<div align="center">

# 🤖 AI Research Assistant
### RAG + Multi-Agent System for Intelligent Document Research

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-Ecosystem-1C3C3C?style=flat-square&logo=chainlink&logoColor=white)](https://langchain.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![FAISS](https://img.shields.io/badge/Vector_DB-FAISS%20%2F%20ChromaDB-FF6B35?style=flat-square)](https://faiss.ai)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

**An advanced AI-powered research assistant built using Retrieval-Augmented Generation (RAG) and a Multi-Agent architecture. Upload research papers, perform semantic search, and interact with documents using LLM-driven conversational intelligence.**

[Features](#-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Agents](#-multi-agent-system) · [API Docs](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## ✨ Features

### 📄 Document Upload
- Upload research papers in **PDF, TXT, DOCX**, and more
- Automatic parsing, cleaning, and intelligent chunking
- Metadata extraction (title, authors, abstract) for richer retrieval

### 🔍 Semantic Search
- Context-aware search powered by dense vector embeddings
- Finds the most relevant sections across your entire document library
- Supports hybrid search — semantic + keyword for higher precision

### 💬 Chat with Documents
- Ask natural-language questions grounded in your uploaded data
- RAG pipeline actively reduces hallucinations by citing source passages
- Multi-turn conversation with memory of previous exchanges

### 🧠 Multi-Agent System
- Intelligent agent routing based on query type and complexity
- Fallback and self-healing agent mechanism for reliability
- Modular agent design — easy to extend with new specialist agents

### ⚡ LLM Integration
- Supports **OpenAI GPT-4/3.5** and locally hosted models
- Configurable prompt templates and context window management
- Streaming response support for real-time output

### 🗂 Vector Database
- Stores dense embeddings for fast approximate nearest-neighbour retrieval
- Supports **FAISS** (local) and **ChromaDB** (persistent)
- Scales to large document collections with minimal latency

---

## 🏗 Architecture

```
┌─────────────────────────────────────┐
│            User Query               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Agent Selector                │
│   Smart routing based on query type │
└──────┬───────────────────┬──────────┘
       │                   │ (on failure)
┌──────▼──────┐     ┌──────▼──────────┐
│  Research   │     │    Fallback     │
│   Agent     │     │     Agent       │
└──────┬──────┘     └─────────────────┘
       │
┌──────▼──────────────────────────────┐
│     Retriever  (Vector DB)          │
│  FAISS / ChromaDB  ·  Top-K search  │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│     RAG Pipeline                    │
│  Retrieved context + LLM prompt     │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│     Response  (grounded + cited)    │
└─────────────────────────────────────┘
```

**Stack overview:**

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python 3.11+) |
| LLM | Gemini / Local models |
| Embeddings | Sentence Transformers / OpenAI Ada |
| Vector Store | FAISS (local) · ChromaDB (persistent) |
| Agents | Custom multi-agent framework |
| Frontend | React (optional) |

---

## ⚡ Quick Start

### Prerequisites

- Python 3.11+
- An OpenAI API key (or a locally running model)

### 1. Clone the repository

```bash
git clone https://github.com/Darshit02/ai-research-assistant-RAG-multi-agent-system.git
cd ai-research-assistant
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate       # macOS / Linux
venv\Scripts\activate          # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

```env
# .env
OPENAI_API_KEY=sk-...
VECTOR_DB=faiss               # faiss | chroma
EMBEDDING_MODEL=text-embedding-ada-002
CHUNK_SIZE=512
CHUNK_OVERLAP=64
```

### 5. Run the API

```bash
uvicorn app.main:app --reload
```

The API is available at **http://127.0.0.1:8000**
Interactive docs at **http://127.0.0.1:8000/docs**

---

## 🤖 Multi-Agent System

The system uses three cooperating agents to handle queries reliably.

| Agent | Responsibility |
|---|---|
| **Agent Selector** | Analyses the incoming query and routes it to the most capable agent |
| **Research Agent** | Primary agent — retrieves context from the vector store and generates a grounded response |
| **Fallback Agent** | Activates automatically on failure — retries with a simplified strategy or broader retrieval |

### Agent routing flow

```
Incoming query
      │
      ▼
Agent Selector ──► classifies query complexity + type
      │
      ├── simple factual  ──► Research Agent (direct RAG lookup)
      ├── multi-hop       ──► Research Agent (chain-of-thought + multi-retrieve)
      └── ambiguous       ──► Fallback Agent (broad retrieval + clarification)
```

The fallback agent also handles **rate limit errors**, **context overflow**, and **low-confidence responses** — automatically retrying with adjusted parameters.

---

## 🔍 RAG Pipeline

Each query goes through a four-stage pipeline:

**1. Embed** — the query is converted to a dense vector using the configured embedding model.

**2. Retrieve** — the vector store returns the top-K most semantically similar document chunks.

**3. Augment** — retrieved chunks are injected into a structured prompt alongside the original query.

**4. Generate** — the LLM produces a response grounded in the retrieved context, with source citations.

```python
# Example usage
from app.rag.pipeline import RAGPipeline

pipeline = RAGPipeline()

# Index a document
pipeline.index_document("path/to/paper.pdf")

# Query
response = pipeline.query("What are the key findings on transformer attention?")
print(response.answer)
print(response.sources)   # cited chunks
```

---

## 📡 API Reference

Full interactive docs at `http://localhost:8000/docs`.

### Documents

```http
POST   /documents/upload       # Upload and index a document
GET    /documents              # List all indexed documents
DELETE /documents/{id}         # Remove a document and its embeddings
```

### Search

```http
POST   /search                 # Semantic search across documents
```

```json
{
  "query": "transformer self-attention mechanism",
  "top_k": 5,
  "threshold": 0.75
}
```

### Chat

```http
POST   /chat                   # Ask a question (RAG-grounded response)
GET    /chat/history           # Retrieve conversation history
DELETE /chat/history           # Clear conversation memory
```

### Example: upload and query

```bash
# Upload a document
curl -X POST http://localhost:8000/documents/upload \
  -F "file=@paper.pdf"

# Ask a question
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Summarise the methodology section"}'
```

---

## 📌 Usage Guide

**Step 1 — Upload documents**
Use the `/documents/upload` endpoint or the UI to upload your research papers. The system parses, chunks, and indexes them automatically.

**Step 2 — Embeddings are generated**
Each chunk is embedded and stored in the vector database. This is a one-time operation per document.

**Step 3 — Ask questions**
Send natural-language questions via the `/chat` endpoint or the UI. The system retrieves relevant context and generates a grounded answer.

**Step 4 — Review cited sources**
Every response includes the source passages used, so you can verify accuracy and trace answers back to the original text.

---

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# With coverage report
pytest tests/ --cov=app --cov-report=html

# Test a specific module
pytest tests/test_rag.py -v
```

---

## 🗺 Roadmap

| Status | Feature |
|---|---|
| ✅ | PDF / TXT document upload and chunking |
| ✅ | Semantic search with FAISS / ChromaDB |
| ✅ | RAG pipeline with source citations |
| ✅ | Multi-agent routing with fallback |
| ✅ | OpenAI + local LLM support |
| 🚧 | Streaming chat responses |
| 🚧 | React frontend UI |
| 🔜 | Web search integration (hybrid RAG) |
| 🔜 | Research summarisation dashboards |
| 🔜 | Automatic citation generation |
| 🔜 | Memory-based agents (cross-session context) |
| 🔜 | Multi-language document support |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork → clone → branch → commit → push → PR
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
```

---

## ⭐ Acknowledgements

- [Gemini](https://gemini.com) for the LLM and embedding APIs
- [LangChain](https://langchain.com) ecosystem for RAG tooling
- [FAISS](https://faiss.ai) by Meta AI for fast vector search
- [ChromaDB](https://trychroma.com) for the persistent vector store
- [Sentence Transformers](https://sbert.net) for open-source embeddings

---

## 📜 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built to make research faster, smarter, and grounded in your own data.**

⭐ Star this repo if you found it useful!

</div>
