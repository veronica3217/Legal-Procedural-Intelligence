import os
import sys
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

def test_model1():
    # Resolve model directory relative to script location
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model1")

    print(f"Loading Model 1 (InLegalNER-BERT) from: {model_path}")

    if not os.path.exists(model_path):
        print(f"Error: Model directory not found at {model_path}")
        return

    try:
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForTokenClassification.from_pretrained(model_path, local_files_only=True)

        print("Model and Tokenizer loaded successfully!")
        print(f"Number of labels: {model.config.num_labels}")
        print(f"Labels mapping (id2label):\n{model.config.id2label}\n")

        # Create NER pipeline
        ner_pipeline = pipeline(
            "ner",
            model=model,
            tokenizer=tokenizer,
            aggregation_strategy="simple"
        )

        sample_text = (
            "In the High Court of Delhi, Petitioner Ramesh Kumar filed a writ petition against "
            "Respondent State of Delhi under Section 482 of the Code of Criminal Procedure, 1973 "
            "on 12th January 2024. Justice S. Muralidhar presided over the hearing."
        )

        print("Running NER inference on sample text...")
        print(f"Sample Text: \"{sample_text}\"\n")

        entities = ner_pipeline(sample_text)

        print("Extracted Entities:")
        print("-" * 50)
        for entity in entities:
            print(f"Entity: {entity['word']:<30} | Group: {entity['entity_group']:<15} | Score: {entity['score']:.4f}")
        print("-" * 50)

    except Exception as e:
        print(f"An error occurred while loading or running Model 1: {e}")

if __name__ == "__main__":
    test_model1()
