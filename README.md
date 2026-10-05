 # Legal Procedural Intelligence

## Abstract

**Legal Procedural Intelligence** is an AI-powered legal document and procedural analysis platform designed to support self-represented litigants and legal researchers in understanding the procedural progression of Indian legal cases.

The system processes legal judgments and related procedural documents using Natural Language Processing (NLP), legal information extraction, and machine learning techniques. The current implementation focuses on extracting structured legal information from Indian Supreme Court judgments as the foundation for later procedural intelligence components.

The system follows a **human-in-the-loop approach**. AI models generate structured legal information, while the human user reviews and interprets the extracted information. This is an academic research prototype and does not provide legal advice or replace qualified legal professionals.

## Project Objective

The objective is to develop an AI-assisted pipeline that can transform unstructured Indian legal documents into structured information that can later support:

- Procedural event extraction
- Procedural relationship modelling
- Case timeline construction
- Procedural rule retrieval
- Evidence-grounded legal question answering

The current implementation focuses on **Model 1: Legal Information Extraction**.

## Project Pipeline

```text
Indian Legal Documents
        |
        v
Document Processing / Text Extraction
        |
        v
Model 1 - Legal Entity Extraction
        |
        v
Procedural Event Extraction
        |
        v
Event Relationship Modelling
        |
        v
Procedural Timeline
        |
        v
Retrieval-Augmented Generation (RAG)
        |
        v
Evidence-Grounded Procedural Assistance
```

> **Current project status:** Model 1 has been trained and evaluated. Later procedural-event, relationship, timeline, and RAG integration stages are continuing development.

# Dataset

## Indian Supreme Court Judgments Dataset

**Official AWS Open Data Registry:**  
https://registry.opendata.aws/indian-supreme-court-judgments/

**GitHub Repository:**  
https://github.com/vanga/indian-supreme-court-judgments

The Indian Supreme Court Judgments dataset is the primary legal-document source for the project.

For the current implementation, the **2023 English Supreme Court judgment collection** is used.

The working collection contains:

- **854 Supreme Court judgment PDFs**
- English-language judgments
- 2023 judgments
- Associated metadata
- Extracted text versions for NLP processing

## InLegalNER

**Hugging Face:**  
https://huggingface.co/datasets/opennyaiorg/InLegalNER

InLegalNER is used for **legal named entity recognition**.

Entity types include:

- `PETITIONER`
- `RESPONDENT`
- `LAWYER`
- `OTHER_PERSON`
- `PROVISION`
- `COURT`
- `JUDGE`
- `DATE`
- `STATUTE`
- `ORG`
- `GPE`
- `PRECEDENT`
- `CASE_NUMBER`
- `WITNESS`

### Dataset Split

| Split | Records |
|---|---:|
| Train | 10,995 |
| Dev | 1,074 |
| Test | 4,501 |

# Model 1 — Legal Information Extraction

## Objective

Model 1 extracts important legal entities from unstructured legal text. These entities provide the structured foundation for later procedural-event and relationship modelling.

### Architecture

```text
Legal Text
    |
    v
BERT Tokenizer
    |
    v
BERT Token Classification Model
    |
    v
BIO Entity Labels
```

### Model

- **Base model:** `bert-base-cased`
- **Task:** Token Classification / Legal Named Entity Recognition
- **Number of BIO labels:** 29

The labels are:

```text
O

B-RESPONDENT / I-RESPONDENT
B-LAWYER / I-LAWYER
B-PETITIONER / I-PETITIONER
B-OTHER_PERSON / I-OTHER_PERSON
B-PROVISION / I-PROVISION
B-COURT / I-COURT
B-JUDGE / I-JUDGE
B-DATE / I-DATE
B-STATUTE / I-STATUTE
B-ORG / I-ORG
B-GPE / I-GPE
B-PRECEDENT / I-PRECEDENT
B-CASE_NUMBER / I-CASE_NUMBER
B-WITNESS / I-WITNESS
```

## Preprocessing

InLegalNER provides character-level entity spans. The preprocessing converts them into BERT token-level BIO labels.

Example:

```text
Hongkong Bank
```

becomes:

```text
Hong       -> B-ORG
##kon      -> I-ORG
##g        -> I-ORG
Bank       -> I-ORG
```

Long documents are handled with overlapping chunks instead of simple truncation.

### Chunking Configuration

| Parameter | Value |
|---|---:|
| Maximum sequence length | 512 |
| Content length | 510 |
| Overlap | 64 |
| Step size | 446 |

### Processed Dataset

| Split | Processed examples |
|---|---:|
| Train | 11,271 |
| Dev | 1,100 |
| Test | 4,629 |

# Training Configuration

| Parameter | Value |
|---|---|
| Base model | `bert-base-cased` |
| Number of labels | 29 |
| Epochs | 3 |
| Learning rate | `2e-5` |
| Weight decay | `0.01` |
| Training batch size | 8 |
| Evaluation batch size | 8 |
| Gradient accumulation | 2 |
| Mixed precision | FP16 |
| Evaluation | Every epoch |
| Best model criterion | Validation loss |

Training was performed using a **Tesla T4 GPU** in Kaggle.

# Model 1 Evaluation

Model 1 uses entity-level exact-match Precision, Recall, and F1.

### Previous Test Result

| Metric | Result |
|---|---:|
| Precision | **69.30%** |
| Recall | **81.31%** |
| F1 Score | **74.83%** |
| Test Loss | **0.2668** |

The third-epoch validation F1 was approximately **78.43%**. The final reported test F1 was **74.83%**.

> These are the current experimental Model 1 results and should be updated if the reproducible Kaggle run produces different final test metrics.

# Example Model 1 Output

For legal text containing:

```text
Supreme Court of India
Justice Arun Kumar
State of Tamil Nadu
```

the model can identify entities such as:

```text
Supreme Court of India -> COURT
Arun Kumar             -> JUDGE
State of Tamil Nadu    -> RESPONDENT
```

This demonstrates transformation of unstructured legal text into structured legal information.

# Research Relevance

Model 1 is the first machine-learning component of the proposed procedural-intelligence pipeline.

Rather than directly asking an LLM to reason over an entire legal document, the system first identifies important legal entities:

```text
Legal Entities
     |
     v
Procedural Events
     |
     v
Event Relationships
     |
     v
Case Timeline
     |
     v
Procedural Intelligence
```

# Research Papers

## 1. Intelligent Legal Tech to Empower Self-Represented Litigants

**Authors:** Amy J. Schmitz & John Zeleznikow (2022)

This work provides a foundation for the project's focus on technology-assisted support for self-represented litigants and access to justice.

## 2. Improving Access to Justice: AI-Enabled Legal Assistance for Self-Represented Litigants

**Author:** Ramprasad Reddy Mittana (2025)

This research is relevant to AI-based assistance for self-represented litigants and legal-information access.

## 3. AILQA: Evaluating AI-driven Legal Question Answering Systems for the Indian Legal System

**Authors:** Shubham Kumar Nigam et al. (2026)

This work is relevant to the Indian legal question-answering component planned for later stages.

## 4. A Case Study for Automated Attribute Extraction from Legal Documents Using Large Language Models

**Authors:** Adhikary et al.

This work provides a methodological reference for structured information extraction from Indian Supreme Court legal documents. For this project, the structured legal-information extraction paradigm is adapted toward information required for subsequent procedural analysis.

# Current Status

```text
Literature Review                  ✓
Dataset Collection                 ✓
Indian Supreme Court Dataset       ✓
InLegalNER Dataset                 ✓
Legal NER Preprocessing             ✓
Model 1 Architecture                ✓
Model 1 Training                    ✓
Model 1 Evaluation                  ✓
Procedural Event Extraction         In Progress
Event Relationship Model            In Progress
Procedural Timeline                 Planned
RAG Integration                     In Progress
End-to-End Evaluation               Planned
```

# Future Development

### Model 2 — Procedural Event Relationship Extraction

Planned relationships include:

```text
PRECEDES
FOLLOWS
RESULTS_IN
RESPONDS_TO
CHALLENGES
NO_RELATION
```

### Model 3 — Procedural Timeline / Temporal Reasoning

The system will combine procedural events, relationships, dates, and temporal dependencies to construct a structured case timeline.

### Model 4 — Evidence-Grounded Legal QA

The later RAG component will retrieve relevant procedural sources and generate source-grounded responses.

# Disclaimer

This project is an academic research prototype.

It is **not a substitute for a lawyer or qualified legal professional** and does not provide legal advice, guarantee legal deadlines, determine legal rights, or guarantee the admissibility of evidence.

AI-generated outputs should be reviewed against authoritative legal sources and, where appropriate, by a qualified legal professional.
