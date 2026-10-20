import os
import sys
import time
import io
import torch
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForTokenClassification

# PDF extraction
try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    FITZ_AVAILABLE = True
except ImportError:
    FITZ_AVAILABLE = False


app = FastAPI(
    title="LPI ML Service (Model 1 - InLegalNER)",
    description="FastAPI service for Legal Named Entity Recognition using fine-tuned BERT",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
tokenizer = None
model = None
device = None
id2label = {}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model1")

CONTENT_LENGTH = 510
OVERLAP = 64
STEP = CONTENT_LENGTH - OVERLAP


class TextAnalysisRequest(BaseModel):
    text: str
    documentId: Optional[str] = None


class EntityItem(BaseModel):
    entity: str
    text: str
    start: int
    end: int
    score: Optional[float] = None


class AnalysisResponse(BaseModel):
    documentId: str
    text: str
    entities: List[EntityItem]
    entityCount: int
    processingTime: float


@app.on_event("startup")
def load_model():
    global tokenizer, model, device, id2label
    print(f"Loading Model 1 from {MODEL_PATH}...")
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model 1 directory not found at {MODEL_PATH}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
    model = AutoModelForTokenClassification.from_pretrained(MODEL_PATH, local_files_only=True)
    model.to(device)
    model.eval()

    id2label = {int(k): v for k, v in model.config.id2label.items()}
    print(f"Model 1 loaded successfully on {device}! Total labels: {len(id2label)}")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LPI ML Service",
        "model": "InLegalNER-BERT (Model 1)",
        "device": str(device),
        "model_loaded": model is not None,
        "labels_count": len(id2label)
    }


def extract_entities_from_chunk(preds, probs, offsets, doc_text):
    chunk_entities = []
    current_entity = None

    for pred_id, score, (start_char, end_char) in zip(preds, probs, offsets):
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
                "end": end_char,
                "scores": [score]
            }
        elif label.startswith("I-"):
            ent_type = label[2:]
            if current_entity and current_entity["entity"] == ent_type:
                current_entity["end"] = end_char
                current_entity["scores"].append(score)
            else:
                if current_entity:
                    chunk_entities.append(current_entity)
                current_entity = {
                    "entity": ent_type,
                    "start": start_char,
                    "end": end_char,
                    "scores": [score]
                }

    if current_entity:
        chunk_entities.append(current_entity)

    res = []
    for ent in chunk_entities:
        avg_score = sum(ent["scores"]) / len(ent["scores"]) if ent.get("scores") else 0.99
        res.append({
            "entity": ent["entity"],
            "text": doc_text[ent["start"]:ent["end"]],
            "start": ent["start"],
            "end": ent["end"],
            "score": round(float(avg_score), 4)
        })
    return res


def merge_entities(entities, doc_text):
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


def run_ner_inference(text: str) -> List[Dict[str, Any]]:
    if not text.strip():
        return []

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

    chunks = []
    start_idx = 0
    while start_idx < total_tokens:
        end_idx = min(start_idx + CONTENT_LENGTH, total_tokens)
        chunks.append({
            "token_ids": input_ids[start_idx:end_idx],
            "offsets": offset_mapping[start_idx:end_idx]
        })
        if end_idx == total_tokens:
            break
        start_idx += STEP

    cls_id = tokenizer.cls_token_id if tokenizer.cls_token_id is not None else 101
    sep_id = tokenizer.sep_token_id if tokenizer.sep_token_id is not None else 102

    all_raw_entities = []

    for chunk in chunks:
        chunk_input_ids = [cls_id] + chunk["token_ids"] + [sep_id]
        input_tensor = torch.tensor([chunk_input_ids], device=device)
        attention_mask = torch.ones_like(input_tensor)

        with torch.no_grad():
            outputs = model(input_ids=input_tensor, attention_mask=attention_mask)
            softmax_probs = torch.softmax(outputs.logits, dim=-1)[0]
            max_probs, preds = torch.max(softmax_probs, dim=-1)
            
            preds = preds.cpu().tolist()[1:-1]
            probs = max_probs.cpu().tolist()[1:-1]

        chunk_ents = extract_entities_from_chunk(preds, probs, chunk["offsets"], text)
        all_raw_entities.extend(chunk_ents)

    return merge_entities(all_raw_entities, text)


@app.post("/predict-entities", response_model=AnalysisResponse)
def predict_entities(request: TextAnalysisRequest):
    start_t = time.time()
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Document text cannot be empty")

    entities = run_ner_inference(request.text)
    proc_time = round(time.time() - start_t, 3)

    doc_id = request.documentId or f"doc_{int(time.time() * 1000)}"

    return AnalysisResponse(
        documentId=doc_id,
        text=request.text,
        entities=[EntityItem(**e) for e in entities],
        entityCount=len(entities),
        processingTime=proc_time
    )


@app.post("/parse-and-predict")
async def parse_and_predict(file: UploadFile = File(...)):
    start_t = time.time()
    filename = file.filename or "uploaded_document"
    contents = await file.read()
    text = ""

    if filename.endswith(".pdf"):
        if FITZ_AVAILABLE:
            doc = fitz.open(stream=contents, filetype="pdf")
            extracted = []
            for page in doc:
                extracted.append(page.get_text())
            text = "\n".join(extracted)
        elif PYPDF_AVAILABLE:
            pdf_reader = pypdf.PdfReader(io.BytesIO(contents))
            extracted = []
            for page in pdf_reader.pages:
                extracted.append(page.extract_text() or "")
            text = "\n".join(extracted)
        else:
            raise HTTPException(status_code=500, detail="No PDF extraction library available")
    else:
        text = contents.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text could be extracted from the file")

    entities = run_ner_inference(text)
    proc_time = round(time.time() - start_t, 3)
    doc_id = f"doc_{int(time.time() * 1000)}"

    return {
        "documentId": doc_id,
        "documentName": filename,
        "text": text,
        "entities": entities,
        "entityCount": len(entities),
        "processingTime": proc_time
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
