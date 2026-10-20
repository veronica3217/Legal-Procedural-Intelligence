import os
import sys
import json
import time
import torch
from collections import Counter, defaultdict
from datasets import load_from_disk
from transformers import AutoTokenizer, AutoModelForTokenClassification

# Try importing seqeval metrics
try:
    from seqeval.metrics import classification_report as seqeval_report
    from seqeval.metrics import precision_score as seqeval_precision
    from seqeval.metrics import recall_score as seqeval_recall
    from seqeval.metrics import f1_score as seqeval_f1
    SEQEVAL_AVAILABLE = True
except ImportError:
    SEQEVAL_AVAILABLE = False


def extract_gt_spans_from_example(example):
    """
    Extract exact ground truth entity spans directly from annotation dictionary:
    set of tuples: (entity_type, start_char, end_char, entity_text)
    """
    text = example["data"]["text"]
    gt_spans = []

    annotations = example.get("annotations", [])
    if not annotations:
        return text, gt_spans

    results = annotations[0].get("result", [])
    for ann in results:
        val = ann.get("value", {})
        start = val.get("start")
        end = val.get("end")
        labels = val.get("labels", [])
        if start is not None and end is not None and labels:
            entity_type = labels[0]
            entity_text = text[start:end]
            gt_spans.append({
                "entity": entity_type,
                "start": start,
                "end": end,
                "text": entity_text
            })

    # Deduplicate ground truth spans if any exact duplicates exist
    unique_gt = []
    seen = set()
    for s in gt_spans:
        key = (s["entity"], s["start"], s["end"])
        if key not in seen:
            seen.add(key)
            unique_gt.append(s)

    return text, unique_gt


def convert_example_to_bio_sequence(example, tokenizer, label2id):
    """
    Notebook's exact convert_example_to_bio function for extracting token-level BIO labels.
    """
    text = example["data"]["text"]
    char_labels = ["O"] * len(text)

    annotations = example.get("annotations", [])
    if annotations:
        results = annotations[0].get("result", [])
        for ann in results:
            value = ann.get("value", {})
            start = value.get("start")
            end = value.get("end")
            labels = value.get("labels", [])
            if start is not None and end is not None and labels:
                entity_type = labels[0]
                for i in range(start, end):
                    if 0 <= i < len(char_labels):
                        char_labels[i] = entity_type

    encoding = tokenizer(
        text,
        truncation=False,
        return_offsets_mapping=True,
        add_special_tokens=False
    )

    token_labels = []
    offsets = encoding["offset_mapping"]

    for start, end in offsets:
        if start == end:
            token_labels.append("O")
            continue

        covered_labels = char_labels[start:end]
        entity_labels = [lbl for lbl in covered_labels if lbl != "O"]

        if not entity_labels:
            token_labels.append("O")
        else:
            entity_type = entity_labels[0]
            previous_labels = char_labels[:start]
            if start == 0 or previous_labels[-1] != entity_type:
                token_labels.append("B-" + entity_type)
            else:
                token_labels.append("I-" + entity_type)

    return encoding["input_ids"], offsets, token_labels


def extract_entities_from_token_predictions(preds, offsets, doc_text, id2label):
    """
    Convert chunk-level token predictions into BIO entities with character offsets.
    """
    chunk_entities = []
    current_entity = None

    for pred_id, (start_char, end_char) in zip(preds, offsets):
        if start_char == end_char:
            if current_entity:
                chunk_entities.append(current_entity)
                current_entity = None
            continue

        label = id2label.get(pred_id, "O")
        if isinstance(label, int):
            label = str(label)

        if label == "O":
            if current_entity:
                chunk_entities.append(current_entity)
                current_entity = None
        elif label.startswith("B-"):
            if current_entity:
                chunk_entities.append(current_entity)
            ent_type = label[2:]
            current_entity = {
                "entity": ent_type,
                "start": start_char,
                "end": end_char
            }
        elif label.startswith("I-"):
            ent_type = label[2:]
            if current_entity and current_entity["entity"] == ent_type:
                current_entity["end"] = end_char
            else:
                if current_entity:
                    chunk_entities.append(current_entity)
                current_entity = {
                    "entity": ent_type,
                    "start": start_char,
                    "end": end_char
                }

    if current_entity:
        chunk_entities.append(current_entity)

    for ent in chunk_entities:
        ent["text"] = doc_text[ent["start"]:ent["end"]]

    return chunk_entities


def merge_entities(entities, doc_text):
    """
    Merge duplicate and overlapping entities extracted across overlapping chunks.
    """
    if not entities:
        return []

    sorted_entities = sorted(entities, key=lambda x: (x["start"], -x["end"]))

    merged = []
    for current in sorted_entities:
        if not merged:
            merged.append(current)
            continue

        prev = merged[-1]

        if current["entity"] == prev["entity"]:
            if current["start"] <= prev["end"]:
                new_start = prev["start"]
                new_end = max(prev["end"], current["end"])
                prev["start"] = new_start
                prev["end"] = new_end
                prev["text"] = doc_text[new_start:new_end]
                continue

        if any(m["start"] == current["start"] and m["end"] == current["end"] for m in merged):
            continue

        merged.append(current)

    final_list = []
    seen = set()
    for ent in merged:
        key = (ent["start"], ent["end"], ent["entity"])
        if key not in seen:
            seen.add(key)
            ent["text"] = doc_text[ent["start"]:ent["end"]]
            final_list.append(ent)

    final_list.sort(key=lambda x: x["start"])
    return final_list


def compute_span_metrics(all_gt_docs, all_pred_docs):
    """
    Compute strict span-level micro and per-class precision, recall, f1, TP, FP, FN.
    """
    total_tp = 0
    total_fp = 0
    total_fn = 0

    class_counts = defaultdict(lambda: {"tp": 0, "fp": 0, "fn": 0, "gt_count": 0, "pred_count": 0})

    for gt_list, pred_list in zip(all_gt_docs, all_pred_docs):
        gt_set = set((e["entity"], e["start"], e["end"]) for e in gt_list)
        pred_set = set((e["entity"], e["start"], e["end"]) for e in pred_list)

        for e in gt_list:
            class_counts[e["entity"]]["gt_count"] += 1
        for e in pred_list:
            class_counts[e["entity"]]["pred_count"] += 1

        tp_set = gt_set & pred_set
        fp_set = pred_set - gt_set
        fn_set = gt_set - pred_set

        total_tp += len(tp_set)
        total_fp += len(fp_set)
        total_fn += len(fn_set)

        for (ent_type, s, e) in tp_set:
            class_counts[ent_type]["tp"] += 1
        for (ent_type, s, e) in fp_set:
            class_counts[ent_type]["fp"] += 1
        for (ent_type, s, e) in fn_set:
            class_counts[ent_type]["fn"] += 1

    overall_prec = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0.0
    overall_rec = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0.0
    overall_f1 = (2 * overall_prec * overall_rec / (overall_prec + overall_rec)) if (overall_prec + overall_rec) > 0 else 0.0

    per_class_results = {}
    for ent_type, counts in sorted(class_counts.items()):
        tp = counts["tp"]
        fp = counts["fp"]
        fn = counts["fn"]
        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec / (prec + rec)) if (prec + rec) > 0 else 0.0

        per_class_results[ent_type] = {
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "tp": tp,
            "fp": fp,
            "fn": fn,
            "support": counts["gt_count"],
            "pred_count": counts["pred_count"]
        }

    return {
        "overall": {
            "precision": round(overall_prec, 4),
            "recall": round(overall_rec, 4),
            "f1": round(overall_f1, 4),
            "tp": total_tp,
            "fp": total_fp,
            "fn": total_fn,
            "total_gt": total_tp + total_fn,
            "total_pred": total_tp + total_fp
        },
        "per_class": per_class_results
    }


def perform_error_analysis(all_gt_docs, all_pred_docs, max_samples=100):
    """
    Categorize entity extraction errors into:
    1. Type mismatch (overlapping character span, different entity label)
    2. Boundary mismatch (same entity label, overlapping character span)
    3. Completely missed ground truth entity (FN)
    4. Completely spurious predicted entity (FP)
    """
    errors = {
        "type_mismatches": [],
        "boundary_mismatches": [],
        "completely_missed": [],
        "spurious_predictions": []
    }

    for doc_idx, (gt_list, pred_list) in enumerate(zip(all_gt_docs, all_pred_docs)):
        matched_gt = set()
        matched_pred = set()

        # Exact matches
        for i, gt in enumerate(gt_list):
            for j, pred in enumerate(pred_list):
                if gt["entity"] == pred["entity"] and gt["start"] == pred["start"] and gt["end"] == pred["end"]:
                    matched_gt.add(i)
                    matched_pred.add(j)

        # Overlap analysis for unmatched
        unmatched_gt = [i for i in range(len(gt_list)) if i not in matched_gt]
        unmatched_pred = [j for j in range(len(pred_list)) if j not in matched_pred]

        for i in unmatched_gt:
            gt = gt_list[i]
            found_overlap = False
            for j in unmatched_pred:
                pred = pred_list[j]
                # Check character overlap
                if max(gt["start"], pred["start"]) < min(gt["end"], pred["end"]):
                    found_overlap = True
                    matched_pred.add(j)
                    if gt["entity"] != pred["entity"]:
                        if len(errors["type_mismatches"]) < max_samples:
                            errors["type_mismatches"].append({
                                "doc_idx": doc_idx,
                                "true_entity": gt["entity"],
                                "pred_entity": pred["entity"],
                                "true_text": gt["text"],
                                "pred_text": pred["text"],
                                "true_span": (gt["start"], gt["end"]),
                                "pred_span": (pred["start"], pred["end"])
                            })
                    else:
                        if len(errors["boundary_mismatches"]) < max_samples:
                            errors["boundary_mismatches"].append({
                                "doc_idx": doc_idx,
                                "entity_type": gt["entity"],
                                "true_text": gt["text"],
                                "pred_text": pred["text"],
                                "true_span": (gt["start"], gt["end"]),
                                "pred_span": (pred["start"], pred["end"])
                            })
                    break

            if not found_overlap:
                if len(errors["completely_missed"]) < max_samples:
                    errors["completely_missed"].append({
                        "doc_idx": doc_idx,
                        "entity": gt["entity"],
                        "text": gt["text"],
                        "span": (gt["start"], gt["end"])
                    })

        for j in range(len(pred_list)):
            if j not in matched_pred:
                pred = pred_list[j]
                if len(errors["spurious_predictions"]) < max_samples:
                    errors["spurious_predictions"].append({
                        "doc_idx": doc_idx,
                        "entity": pred["entity"],
                        "text": pred["text"],
                        "span": (pred["start"], pred["end"])
                    })

    return errors


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model1")
    dataset_path = r"C:\Users\VERONICA A\legal-procedural-intelligence\data\03_legal_ner\InLegalNER"
    out_json_path = os.path.join(base_dir, "model1_evaluation.json")
    out_txt_path = os.path.join(base_dir, "model1_evaluation_report.txt")

    print("=" * 70)
    print("LEGAL NER MODEL 1 (InLegalNER-BERT) - COMPREHENSIVE EVALUATION")
    print("=" * 70)

    print("\n[1/5] Checking Dataset & Model Paths...")
    if not os.path.exists(dataset_path):
        print(f"ERROR: Dataset path not found: {dataset_path}")
        print("Note: If running on Kaggle, set dataset_path to '/kaggle/input/datasets/averonican/legal-ner-dataset/InLegalNER'")
        sys.exit(1)

    if not os.path.exists(model_path):
        print(f"ERROR: Local model folder not found at {model_path}")
        sys.exit(1)

    print(f"  Model Folder  : {model_path}")
    print(f"  Dataset Folder: {dataset_path}")

    print("\n[2/5] Loading Model, Tokenizer, and Test Dataset...")
    tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
    model = AutoModelForTokenClassification.from_pretrained(model_path, local_files_only=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

    print(f"  Running on Device: {device}")

    id2label = {int(k): v for k, v in model.config.id2label.items()}
    label2id = {v: k for k, v in id2label.items()}

    dataset_dict = load_from_disk(dataset_path)
    test_dataset = dataset_dict["test"]

    total_test_examples = len(test_dataset)
    print(f"  Total Test Examples in Split: {total_test_examples}")

    MAX_LENGTH = 510
    OVERLAP = 64
    STEP = MAX_LENGTH - OVERLAP

    all_gt_docs = []
    all_pred_docs = []
    all_true_token_labels_docs = []
    all_pred_token_labels_docs = []

    eval_start_time = time.time()
    successful_examples = 0

    print("\n[3/5] Running Inference & Span Extraction across Test Set...")

    cls_id = tokenizer.cls_token_id if tokenizer.cls_token_id is not None else 101
    sep_id = tokenizer.sep_token_id if tokenizer.sep_token_id is not None else 102

    for idx, example in enumerate(test_dataset):
        if (idx + 1) % 500 == 0 or (idx + 1) == total_test_examples:
            elapsed = time.time() - eval_start_time
            print(f"  Evaluated {idx + 1}/{total_test_examples} documents... ({elapsed:.1f}s)")

        doc_text, gt_spans = extract_gt_spans_from_example(example)

        if not doc_text.strip():
            all_gt_docs.append(gt_spans)
            all_pred_docs.append([])
            all_true_token_labels_docs.append([])
            all_pred_token_labels_docs.append([])
            successful_examples += 1
            continue

        input_ids, offsets, true_token_bio = convert_example_to_bio_sequence(example, tokenizer, label2id)
        total_tokens = len(input_ids)

        chunks = []
        start_token_idx = 0
        while start_token_idx < total_tokens:
            end_token_idx = min(start_token_idx + MAX_LENGTH, total_tokens)
            chunks.append({
                "start": start_token_idx,
                "end": end_token_idx,
                "token_ids": input_ids[start_token_idx:end_token_idx],
                "offsets": offsets[start_token_idx:end_token_idx],
                "true_bio": true_token_bio[start_token_idx:end_token_idx]
            })
            if end_token_idx == total_tokens:
                break
            start_token_idx += STEP

        doc_raw_pred_spans = []
        doc_pred_token_bio = ["O"] * total_tokens

        for chunk in chunks:
            chunk_input_ids = [cls_id] + chunk["token_ids"] + [sep_id]
            input_tensor = torch.tensor([chunk_input_ids], device=device)
            attn_mask = torch.ones_like(input_tensor)

            with torch.no_grad():
                logits = model(input_ids=input_tensor, attention_mask=attn_mask).logits
                preds = torch.argmax(logits, dim=-1)[0].cpu().tolist()

            content_preds = preds[1:-1]

            for offset_i, pred_label_id in enumerate(content_preds):
                global_tok_idx = chunk["start"] + offset_i
                if global_tok_idx < total_tokens:
                    doc_pred_token_bio[global_tok_idx] = id2label.get(pred_label_id, "O")

            chunk_ents = extract_entities_from_token_predictions(
                content_preds, chunk["offsets"], doc_text, id2label
            )
            doc_raw_pred_spans.extend(chunk_ents)

        merged_pred_spans = merge_entities(doc_raw_pred_spans, doc_text)

        all_gt_docs.append(gt_spans)
        all_pred_docs.append(merged_pred_spans)
        all_true_token_labels_docs.append(true_token_bio)
        all_pred_token_labels_docs.append(doc_pred_token_bio)
        successful_examples += 1

    total_eval_time = time.time() - eval_start_time

    print(f"\n[4/5] Computing Metrics & Error Analysis...")
    span_metrics = compute_span_metrics(all_gt_docs, all_pred_docs)

    seqeval_report_str = ""
    seqeval_summary = {}
    if SEQEVAL_AVAILABLE:
        try:
            seqeval_report_str = seqeval_report(all_true_token_labels_docs, all_pred_token_labels_docs, digits=4)
            seqeval_summary = {
                "precision": round(seqeval_precision(all_true_token_labels_docs, all_pred_token_labels_docs), 4),
                "recall": round(seqeval_recall(all_true_token_labels_docs, all_pred_token_labels_docs), 4),
                "f1": round(seqeval_f1(all_true_token_labels_docs, all_pred_token_labels_docs), 4)
            }
        except Exception as e:
            seqeval_report_str = f"Seqeval reporting error: {e}"

    errors = perform_error_analysis(all_gt_docs, all_pred_docs, max_samples=50)

    # Print Summary Table
    print("\n" + "=" * 75)
    print("EVALUATION RESULTS SUMMARY")
    print("=" * 75)
    print(f"Total Test Examples        : {total_test_examples}")
    print(f"Successfully Evaluated     : {successful_examples}")
    print(f"Inference & Eval Duration  : {total_eval_time:.2f} seconds")
    print("-" * 75)
    print(f"Overall Strict Precision   : {span_metrics['overall']['precision']:.4f}")
    print(f"Overall Strict Recall      : {span_metrics['overall']['recall']:.4f}")
    print(f"Overall Strict F1-Score    : {span_metrics['overall']['f1']:.4f}")
    print(f"Total Ground Truth Entities: {span_metrics['overall']['total_gt']}")
    print(f"Total Predicted Entities   : {span_metrics['overall']['total_pred']}")
    print(f"True Positives (TP)        : {span_metrics['overall']['tp']}")
    print(f"False Positives (FP)       : {span_metrics['overall']['fp']}")
    print(f"False Negatives (FN)       : {span_metrics['overall']['fn']}")
    print("=" * 75)

    print("\nPer-Entity-Type Performance Breakdown:")
    print("-" * 80)
    print(f"{'Entity Type':<18} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'TP':<6} | {'FP':<6} | {'FN':<6} | {'Support':<7}")
    print("-" * 80)
    for ent_type, m in span_metrics["per_class"].items():
        print(f"{ent_type:<18} | {m['precision']:<10.4f} | {m['recall']:<10.4f} | {m['f1']:<10.4f} | {m['tp']:<6} | {m['fp']:<6} | {m['fn']:<6} | {m['support']:<7}")
    print("-" * 80)

    if SEQEVAL_AVAILABLE and seqeval_report_str:
        print("\nSeqeval Sequence-Level Classification Report:")
        print("-" * 75)
        print(seqeval_report_str)
        print("-" * 75)

    print("\nError Analysis Overview:")
    print(f"  Type Mismatches (Span overlaps, wrong label)  : {len(errors['type_mismatches'])}")
    print(f"  Boundary Mismatches (Same label, wrong span): {len(errors['boundary_mismatches'])}")
    print(f"  Completely Missed Entities (FN)              : {len(errors['completely_missed'])}")
    print(f"  Spurious Predictions (FP)                    : {len(errors['spurious_predictions'])}")

    # Write Output JSON
    output_data = {
        "model_name": "InLegalNER-BERT (Model 1)",
        "evaluation_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "test_dataset_path": dataset_path,
        "total_test_examples": total_test_examples,
        "successfully_evaluated_examples": successful_examples,
        "inference_duration_seconds": round(total_eval_time, 2),
        "overall_metrics": span_metrics["overall"],
        "seqeval_summary": seqeval_summary,
        "per_class_metrics": span_metrics["per_class"],
        "error_analysis_samples": errors
    }

    with open(out_json_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    # Write Readable Text Report
    with open(out_txt_path, "w", encoding="utf-8") as f:
        f.write("===========================================================================\n")
        f.write("      LEGAL NAMED ENTITY RECOGNITION (MODEL 1) EVALUATION REPORT          \n")
        f.write("===========================================================================\n\n")
        f.write(f"Model Path        : {model_path}\n")
        f.write(f"Dataset Path      : {dataset_path}\n")
        f.write(f"Total Test Split  : {total_test_examples} examples\n")
        f.write(f"Evaluated Examples: {successful_examples} examples\n")
        f.write(f"Evaluation Time   : {total_eval_time:.2f} seconds\n\n")

        f.write("--- OVERALL STRICT ENTITY SPAN METRICS ---\n")
        f.write(f"Precision          : {span_metrics['overall']['precision']:.4f}\n")
        f.write(f"Recall             : {span_metrics['overall']['recall']:.4f}\n")
        f.write(f"F1-Score           : {span_metrics['overall']['f1']:.4f}\n")
        f.write(f"True Positives     : {span_metrics['overall']['tp']}\n")
        f.write(f"False Positives    : {span_metrics['overall']['fp']}\n")
        f.write(f"False Negatives    : {span_metrics['overall']['fn']}\n")
        f.write(f"Ground Truth Count : {span_metrics['overall']['total_gt']}\n")
        f.write(f"Predicted Count    : {span_metrics['overall']['total_pred']}\n\n")

        f.write("--- PER-ENTITY TYPE PERFORMANCE ---\n")
        f.write(f"{'Entity Type':<18} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'TP':<6} | {'FP':<6} | {'FN':<6} | {'Support':<7}\n")
        f.write("-" * 80 + "\n")
        for ent_type, m in span_metrics["per_class"].items():
            f.write(f"{ent_type:<18} | {m['precision']:<10.4f} | {m['recall']:<10.4f} | {m['f1']:<10.4f} | {m['tp']:<6} | {m['fp']:<6} | {m['fn']:<6} | {m['support']:<7}\n")

        if SEQEVAL_AVAILABLE and seqeval_report_str:
            f.write("\n--- SEQEVAL CLASSIFICATION REPORT ---\n")
            f.write(seqeval_report_str + "\n")

        f.write("\n--- ERROR ANALYSIS EXAMPLES (FIRST 10 OF EACH CATEGORY) ---\n\n")

        f.write("1. Type Mismatches (Correct Span / Overlap, Wrong Entity Class):\n")
        for err in errors["type_mismatches"][:10]:
            f.write(f"   - Doc {err['doc_idx']}: True='{err['true_entity']}' (\"{err['true_text']}\") vs Pred='{err['pred_entity']}' (\"{err['pred_text']}\")\n")

        f.write("\n2. Boundary Mismatches (Same Entity Class, Sub-span / Offset Error):\n")
        for err in errors["boundary_mismatches"][:10]:
            f.write(f"   - Doc {err['doc_idx']}: Class='{err['entity_type']}', True=\"{err['true_text']}\" {err['true_span']} vs Pred=\"{err['pred_text']}\" {err['pred_span']}\n")

        f.write("\n3. Completely Missed Ground Truth Entities (False Negatives):\n")
        for err in errors["completely_missed"][:10]:
            f.write(f"   - Doc {err['doc_idx']}: Missed '{err['entity']}' -> \"{err['text']}\" {err['span']}\n")

        f.write("\n4. Spurious Predicted Entities (False Positives):\n")
        for err in errors["spurious_predictions"][:10]:
            f.write(f"   - Doc {err['doc_idx']}: Extra '{err['entity']}' -> \"{err['text']}\" {err['span']}\n")

    print(f"\n[5/5] Evaluation Artifacts Successfully Saved:")
    print(f"  JSON Results : {out_json_path}")
    print(f"  Text Report  : {out_txt_path}")
    print("=" * 75)


if __name__ == "__main__":
    main()
