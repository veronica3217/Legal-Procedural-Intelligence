import os
import sys
import json
import torch
from collections import Counter
from transformers import AutoTokenizer, AutoModelForTokenClassification

def extract_entities_from_chunk(preds, offsets, doc_text, id2label):
    """
    Extract BIO entities from a single chunk's predictions and character offset mappings.
    """
    chunk_entities = []
    current_entity = None

    for pred_id, (start_char, end_char) in zip(preds, offsets):
        # Ignore unmapped / special tokens with zero span
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

    # Sort entities primarily by start position, then by end position descending
    sorted_entities = sorted(entities, key=lambda x: (x["start"], -x["end"]))

    merged = []
    for current in sorted_entities:
        if not merged:
            merged.append(current)
            continue

        prev = merged[-1]

        # Merge overlapping entities of the SAME type
        if current["entity"] == prev["entity"]:
            if current["start"] <= prev["end"]:
                new_start = prev["start"]
                new_end = max(prev["end"], current["end"])
                prev["start"] = new_start
                prev["end"] = new_end
                prev["text"] = doc_text[new_start:new_end]
                continue

        # Prevent exact duplicate character spans
        if any(m["start"] == current["start"] and m["end"] == current["end"] for m in merged):
            continue

        merged.append(current)

    # Final cleanup & sorting
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


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model1")
    
    # Path to judgment file (allow override from sys.argv)
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        judgment_path = sys.argv[1]
    else:
        judgment_path = r"C:\Users\VERONICA A\legal-procedural-intelligence\model1_test\judgment.txt"

    output_json_path = os.path.join(base_dir, "real_judgment_ner.json")

    print("Loading Model 1...")
    if not os.path.exists(model_path):
        print(f"Error: Model 1 directory not found at: {model_path}")
        return

    tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
    model = AutoModelForTokenClassification.from_pretrained(model_path, local_files_only=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()

    # Convert id2label keys to integers if they are strings
    id2label = {int(k): v for k, v in model.config.id2label.items()}

    print("Reading judgment...")
    if not os.path.exists(judgment_path):
        print(f"Error: Judgment file not found at {judgment_path}")
        return

    with open(judgment_path, "r", encoding="utf-8") as f:
        text = f.read()

    char_count = len(text)
    print(f"Characters: {char_count}")

    if not text.strip():
        print("Warning: Document is empty!")
        print("Tokens: 0")
        print("Chunks: 0")
        print("Inference completed.")
        print("Entities extracted: 0")

        output_data = {"document": text, "entities": []}
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        print(f"Saved empty NER results to: {output_json_path}")
        return

    # 4. Tokenize entire document without special tokens & without truncation
    encoding = tokenizer(
        text,
        add_special_tokens=False,
        return_offsets_mapping=True,
        truncation=False,
        return_tensors=None
    )

    input_ids = encoding["input_ids"]
    offset_mapping = encoding["offset_mapping"]
    total_tokens = len(input_ids)
    print(f"Tokens: {total_tokens}")

    # 5. Chunking parameters: CONTENT_LENGTH = 510, OVERLAP = 64, STEP = 446
    CONTENT_LENGTH = 510
    OVERLAP = 64
    STEP = CONTENT_LENGTH - OVERLAP  # 446

    chunks = []
    start_idx = 0
    while start_idx < total_tokens:
        end_idx = min(start_idx + CONTENT_LENGTH, total_tokens)
        chunks.append({
            "start_token_idx": start_idx,
            "end_token_idx": end_idx,
            "token_ids": input_ids[start_idx:end_idx],
            "offsets": offset_mapping[start_idx:end_idx]
        })
        if end_idx == total_tokens:
            break
        start_idx += STEP

    print(f"Chunks: {len(chunks)}")

    cls_id = tokenizer.cls_token_id if tokenizer.cls_token_id is not None else 101
    sep_id = tokenizer.sep_token_id if tokenizer.sep_token_id is not None else 102

    all_raw_entities = []

    # 6. Process each chunk
    for i, chunk in enumerate(chunks, 1):
        print(f"Processing chunk {i}/{len(chunks)}...")
        chunk_input_ids = [cls_id] + chunk["token_ids"] + [sep_id]
        input_tensor = torch.tensor([chunk_input_ids], device=device)
        attention_mask = torch.ones_like(input_tensor)

        with torch.no_grad():
            outputs = model(input_ids=input_tensor, attention_mask=attention_mask)
            logits = outputs.logits  # shape: (1, seq_len, num_labels)
            preds = torch.argmax(logits, dim=-1)[0].cpu().tolist()

        # Remove predictions corresponding to CLS and SEP
        content_preds = preds[1:-1]

        # Extract BIO entities from chunk
        chunk_ents = extract_entities_from_chunk(content_preds, chunk["offsets"], text, id2label)
        all_raw_entities.extend(chunk_ents)

    print("Inference completed.")

    # 9. Merge duplicate / overlapping entities caused by chunk overlap
    final_entities = merge_entities(all_raw_entities, text)
    print(f"Entities extracted: {len(final_entities)}")

    # 10. Print entity distribution and first 50 entities
    type_counts = Counter(ent["entity"] for ent in final_entities)
    print("\nEntity Distribution by Type:")
    print("-" * 45)
    for ent_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {ent_type:<25}: {count}")
    print("-" * 45)

    print(f"\nFirst 50 Extracted Entities (out of {len(final_entities)}):")
    print("=" * 80)
    for idx, ent in enumerate(final_entities[:50], 1):
        clean_text = repr(ent["text"])[1:-1]
        print(f"{idx:2d}. [{ent['entity']:<15}] \"{clean_text}\" (chars {ent['start']}-{ent['end']})")
    print("=" * 80)

    # 11. Save complete result to JSON
    output_data = {
        "document": text,
        "entities": final_entities
    }

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\nSaved complete NER results to: {output_json_path}")


if __name__ == "__main__":
    main()
