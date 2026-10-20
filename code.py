from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification
)

model_path = r"C:\Users\VERONICA A\legal-procedural-intelligence\models\InLegalNER-BERT-12epochs"

tokenizer = AutoTokenizer.from_pretrained(
    model_path,
    local_files_only=True
)

model = AutoModelForTokenClassification.from_pretrained(
    model_path,
    local_files_only=True
)

print("Model loaded successfully!")
print("Number of labels:", model.config.num_labels)
print("Labels:", model.config.id2label)