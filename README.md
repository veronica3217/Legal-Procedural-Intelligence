 # Legal Procedural Intelligence

AI-based legal procedural intelligence system focused on understanding Indian legal documents, extracting important information, and supporting legal research.

## Primary Dataset

### Indian Supreme Court Judgments

Official Indian Supreme Court Judgments dataset hosted through the AWS Open Data Registry.

**Dataset:** Indian Supreme Court Judgments
**Source:** AWS Open Data Registry

**Direct dataset link:**

**2023 Indian Supreme Court Judgments — English TAR (≈382 MB)**

The official dataset documentation confirms this exact S3 URL pattern for downloading the 2023 English archive, and the archive contains the English judgment PDFs for that year.

```text
s3://indian-supreme-court-judgments/data/tar/year=2023/english/english.tar
```

**Download command:**

```bash
aws s3 cp s3://indian-supreme-court-judgments/data/tar/year=2023/english/english.tar . --no-sign-request
```

**Official Dataset Sources:**

* [AWS Open Data Registry](https://registry.opendata.aws/indian-supreme-court-judgments/)
* [GitHub Repository](https://github.com/vanga/indian-supreme-court-judgments)
* [Dataset Documentation](https://github.com/vanga/indian-supreme-court-judgments/blob/main/opendata/docs/dataset.md)

## Supporting Datasets

### IndicLegalQA

* [Dataset](https://data.mendeley.com/datasets/gf8n8cnmvc/2)
* [Paper / DOI](https://doi.org/10.1016/j.dib.2025.111647)

### ILDC — Indian Legal Documents Corpus

* [GitHub](https://github.com/Legal-NLP-EkStep/ILDC)
* [Research Paper](https://aclanthology.org/2021.acl-long.313/)

### InLegalNER

* [Hugging Face Dataset](https://huggingface.co/datasets/opennyaiorg/InLegalNER)
* [OpenNyAI GitHub](https://github.com/OpenNyAI)

### AILQA

* [GitHub](https://github.com/ShubhamKumarNigam/AILQA)
* [Research Paper](https://link.springer.com/article/10.1007/s10506-026-09537-2)

### ILSIC

* [GitHub](https://github.com/Legal-NLP-EkStep/ILSIC)
* [Research Paper](https://aclanthology.org/2026.findings-eacl.354/)

### Indian High Court Judgments

* [AWS Open Data Registry](https://registry.opendata.aws/indian-high-court-judgments/)

## Research Papers

### Journal Papers

1. **Intelligent Legal Tech to Empower Self-Represented Litigants**
   Amy J. Schmitz & John Zeleznikow, 2022
   [Paper](https://journals.library.columbia.edu/index.php/stlr/article/view/9391)

2. **Survey on Legal Information Extraction: Current Status and Open Challenges**
   Damith Premasiri et al., 2025
   [Paper](https://link.springer.com/article/10.1007/s10115-025-02600-5)

3. **An End-to-End Joint Model for Evidence Information Extraction from Court Record Document**
   Donghong Ji et al., 2021
   [Paper](https://www.sciencedirect.com/science/article/abs/pii/S0306457320308001)

4. **LegalAsst: Human-centered and AI-empowered machine to enhance court productivity and legal assistance**
   2024
   [Paper](https://www.sciencedirect.com/science/article/abs/pii/S0020025524009666)

5. **AILQA: Evaluating AI-driven Legal Question Answering Systems for the Indian Legal System**
   Shubham Kumar Nigam et al., 2026
   [Paper](https://link.springer.com/article/10.1007/s10506-026-09537-2)

### Research Preprint

6. **Time as Structure: Temporal Dependency Graphs for Verifiable Deadline Computation over Legal Documents**
   Maryia Zhyrko, Lifeng Han & Suzan Verberne, 2026
   [arXiv](https://arxiv.org/abs/2608.15270)
