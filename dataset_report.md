# InLegalNER Dataset Statistics & Model 1 Performance Report

## 1. Executive Summary

This report presents a comprehensive statistical audit of the **InLegalNER** legal dataset used in **Model 1 (Legal Named Entity Recognition)**, alongside the empirical test performance of the trained InLegalNER-BERT model.

- **Dataset Path:** `C:\Users\VERONICA A\legal-procedural-intelligence\data\03_legal_ner\InLegalNER`
- **On-Disk Size:** **11,898,781 bytes** (11.35 MB / 0.0111 GB)
- **Total Documents:** **16,570**
- **Total Entity Mentions:** **46,590**
- **Entity Classes:** **14** distinct legal named entity types
- **Model 1 Test Precision:** **73.09%**
- **Model 1 Test Recall:** **83.29%**
- **Model 1 Test Strict-Span F1:** **77.86%**

---

## 2. Dataset Split & Verification

| Split | Documents | Share of Total Docs | Annotations (Mentions) | Share of Total Annotations | Malformed Annotations |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **TRAIN** | 10,995 | 66.35% | 29,964 | 64.31% | 0 |
| **DEV** | 1,074 | 6.48% | 3,261 | 7.00% | 0 |
| **TEST** | 4,501 | 27.16% | 13,365 | 28.69% | 0 |
| **TOTAL** | **16,570** | **100.00%** | **46,590** | **100.00%** | **0** |

---

## 3. Entity Class Distribution across Splits

> **Note on Metrics:**
> - **Mentions**: Total number of annotated entity spans of that type across documents.
> - **Docs**: Number of unique documents containing at least one mention of that entity type.
> - **%**: Percentage share of total entity annotations in that specific split.

| Entity Type | Train Mentions (%) | Train Docs | Dev Mentions (%) | Dev Docs | Test Mentions (%) | Test Docs | Total Mentions (%) | Total Docs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CASE_NUMBER** | 1,040 (3.47%) | 865 | 121 (3.71%) | 97 | 667 (4.99%) | 525 | **1,828** (3.92%) | **1,487** |
| **COURT** | 2,367 (7.90%) | 2,251 | 296 (9.08%) | 276 | 1,221 (9.14%) | 1,126 | **3,884** (8.34%) | **3,653** |
| **DATE** | 1,885 (6.29%) | 1,548 | 222 (6.81%) | 186 | 1,112 (8.32%) | 879 | **3,219** (6.91%) | **2,613** |
| **GPE** | 1,398 (4.67%) | 1,027 | 183 (5.61%) | 110 | 721 (5.39%) | 511 | **2,302** (4.94%) | **1,648** |
| **JUDGE** | 2,325 (7.76%) | 1,504 | 174 (5.34%) | 98 | 590 (4.41%) | 339 | **3,089** (6.63%) | **1,941** |
| **LAWYER** | 3,505 (11.70%) | 843 | 589 (18.06%) | 88 | 1,798 (13.45%) | 283 | **5,892** (12.65%) | **1,214** |
| **ORG** | 1,441 (4.81%) | 1,152 | 159 (4.88%) | 123 | 914 (6.84%) | 696 | **2,514** (5.40%) | **1,971** |
| **OTHER_PERSON** | 2,653 (8.85%) | 1,768 | 276 (8.46%) | 183 | 1,109 (8.30%) | 798 | **4,038** (8.67%) | **2,749** |
| **PETITIONER** | 3,068 (10.24%) | 1,867 | 211 (6.47%) | 131 | 862 (6.45%) | 464 | **4,141** (8.89%) | **2,462** |
| **PRECEDENT** | 1,351 (4.51%) | 1,146 | 177 (5.43%) | 147 | 650 (4.86%) | 554 | **2,178** (4.67%) | **1,847** |
| **PROVISION** | 2,384 (7.96%) | 1,905 | 258 (7.91%) | 202 | 1,220 (9.13%) | 958 | **3,862** (8.29%) | **3,065** |
| **RESPONDENT** | 3,862 (12.89%) | 1,802 | 315 (9.66%) | 128 | 1,113 (8.33%) | 456 | **5,290** (11.35%) | **2,386** |
| **STATUTE** | 1,804 (6.02%) | 1,510 | 222 (6.81%) | 167 | 975 (7.30%) | 788 | **3,001** (6.44%) | **2,465** |
| **WITNESS** | 881 (2.94%) | 642 | 58 (1.78%) | 45 | 413 (3.09%) | 313 | **1,352** (2.90%) | **1,000** |
| **TOTAL** | **29,964** (100.00%) | — | **3,261** (100.00%) | — | **13,365** (100.00%) | — | **46,590** (100.00%) | — |

---

## 4. Data Health & Annotation Integrity Audit

- **Malformed Annotations:** **0** (All character spans `[start, end]` are valid non-negative integers bounded within text length).
- **Missing Labels:** **0** (No entity annotations possess empty label arrays or null values).
- **Unexpected Entity Classes:** **0** (All 46,590 annotations belong strictly to the 14 standard InLegalNER categories).
- **Split Verification:**
  - Train: 10,995 documents (66.35% of total dataset)
  - Dev: 1,074 documents (6.48% of total dataset)
  - Test: 4,501 documents (27.16% of total dataset)

---

## 5. Model 1 Evaluation Integration & Per-Class Performance

Below are the test set evaluation results for **Model 1 (InLegalNER-BERT)** evaluated on the 4,501 untouched test documents:

### Overall Strict-Span Metrics
- **Precision:** **73.09%** (`0.7309`)
- **Recall:** **83.29%** (`0.8329`)
- **Strict-Span F1-Score:** **77.86%** (`0.7786`)
- **True Positives (TP):** 11,132
- **False Positives (FP):** 4,098
- **False Negatives (FN):** 2,233

### Per-Class Test Performance Table

| Entity Class | Test Ground Truth Support | Model Predictions | TP | FP | FN | Precision | Recall | Strict F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CASE_NUMBER** | 667 | 773 | 512 | 261 | 155 | 66.24% | 76.76% | **71.11%** |
| **COURT** | 1,221 | 1,275 | 1,071 | 204 | 150 | 84.00% | 87.71% | **85.82%** |
| **DATE** | 1,112 | 1,132 | 1,015 | 117 | 97 | 89.66% | 91.28% | **90.46%** |
| **GPE** | 721 | 774 | 519 | 255 | 202 | 67.05% | 71.98% | **69.43%** |
| **JUDGE** | 590 | 653 | 527 | 126 | 63 | 80.70% | 89.32% | **84.79%** |
| **LAWYER** | 1,798 | 2,248 | 1,545 | 703 | 253 | 68.73% | 85.93% | **76.37%** |
| **ORG** | 914 | 1,370 | 729 | 641 | 185 | 53.21% | 79.76% | **63.84%** |
| **OTHER_PERSON** | 1,109 | 1,134 | 960 | 174 | 149 | 84.66% | 86.56% | **85.60%** |
| **PETITIONER** | 862 | 884 | 614 | 270 | 248 | 69.46% | 71.23% | **70.33%** |
| **PRECEDENT** | 650 | 794 | 456 | 338 | 194 | 57.43% | 70.15% | **63.16%** |
| **PROVISION** | 1,220 | 1,281 | 1,119 | 162 | 101 | 87.35% | 91.72% | **89.48%** |
| **RESPONDENT** | 1,113 | 1,557 | 840 | 717 | 273 | 53.95% | 75.47% | **62.92%** |
| **STATUTE** | 975 | 980 | 880 | 100 | 95 | 89.80% | 90.26% | **90.03%** |
| **WITNESS** | 413 | 375 | 345 | 30 | 68 | 92.00% | 83.54% | **87.56%** |

---

## 6. Technical Discrepancy Analysis (Strict-Span vs Seqeval)

When evaluating sequence labeling models, two distinct evaluation protocols are commonly reported. Rather than merging or replacing these values, their differences are detailed below:

| Metric | Strict-Span Evaluator (Exact Offset Match) | Seqeval Sequence Evaluator (BIO Token-Level) | Discrepancy / Delta |
| :--- | :---: | :---: | :---: |
| **Precision** | **73.09%** (`0.7309`) | **73.89%** (`0.7389`) | +0.80% |
| **Recall** | **83.29%** (`0.8329`) | **83.27%** (`0.8327`) | -0.02% |
| **F1-Score** | **77.86%** (`0.7786`) | **78.30%** (`0.7830`) | +0.44% |
| **Ground Truth Count / Support** | **13,365** spans | **13,363** token entities | -2 entities |

### Architectural & Methodological Causes of Discrepancy:
1. **Exact Offset Boundary Enforcement vs. Token-Tag Matching:**
   - **Strict-Span Evaluation:** Requires an exact 100% match on both character start offset (`start_char`), character end offset (`end_char`), and entity category. If a predicted span overlaps with ground truth but differs by even a single character (e.g. inclusion/exclusion of trailing whitespace or punctuation), strict-span counts it as **1 False Positive and 1 False Negative**.
   - **Seqeval Evaluation:** Operates on the tokenized sequence tags (`B-TYPE`, `I-TYPE`, `O`). Token sequence alignment relaxes character boundary precision when tokens span boundary punctuation.
2. **Ground-Truth Support Difference (13,365 vs 13,363):**
   - Two ground-truth entity spans in the dataset are situated on unmapped zero-length whitespace tokens during BERT tokenization (`add_special_tokens=False`). The strict-span evaluator measures them directly from raw text annotations (13,365), whereas token sequence convertors drop zero-length token spans, resulting in 13,363 token entities.

