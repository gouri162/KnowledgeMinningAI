# ConsultAI · Executive & Academic Intelligence System 🧠

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-GPT--4.1--mini-0078D4.svg?logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)

**ConsultAI** is an executive-grade Retrieval-Augmented Generation (RAG) platform and academic intelligence assistant. It combines high-fidelity document parsing, hybrid vector/keyword search with Reciprocal Rank Fusion (RRF), Azure OpenAI (GPT-4.1-mini), and Supabase vector database to deliver precise, verbatim answers and structured schedule lookups.

---

## 🌟 Key Features

- **Hybrid RAG Pipeline:** Combines dense semantic vector search (`text-embedding-3-small`) with exact lexical matching, question boosting, and Reciprocal Rank Fusion (RRF).
- **Academic Timetable Parsing:** Intelligently extracts complex merged-cell timetables, preserving period numbers, time spans (e.g. 9:00 - 11:00), room numbers, and faculty details.
- **Modern Minimalist Chat Interface:** Clean, focused interface built with vanilla JS and CSS for maximum speed and zero bloatware.
- **Sleek Toast Notifications:** Non-blocking animated toasts for live upload progress, error handling, and confirmation modals.
- **Instant Document Ingestion:** Upload PDFs through drag-and-drop or chat attachments with automated chunking and vector indexing.

---

## 📁 Project Architecture

```
consultai/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpoints (chat, documents, workflows)
│   │   ├── core/           # Config, environment settings, and API clients
│   │   └── services/       # RAG engine, timetable parser, vision OCR
│   ├── .env.example        # Template for credentials
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Backend entrypoint (port 8000)
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components (chat, sidebar, toast, modals)
│   │   └── styles/         # Modern design tokens and stylesheets
│   ├── index.html          # Frontend HTML shell
│   ├── package.json        # Frontend scripts and dependencies
│   └── vite.config.js      # Vite dev server & API reverse proxy
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **Azure OpenAI** resource (`gpt-4.1-mini`, `text-embedding-3-small`)
- **Supabase** project with `pgvector` enabled

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Fill in your Azure OpenAI and Supabase credentials in `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   AZURE_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_API_KEY=your-azure-api-key
   AZURE_API_VERSION=2024-12-01-preview
   CHAT_MODEL=gpt-4.1-mini
   EMBED_MODEL=text-embedding-3-small
   ```
5. Start the backend server:
   ```bash
   python run.py
   ```
   - API Server: `http://127.0.0.1:8000`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup
1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open **`http://localhost:5173`** in your browser.

---

## 🔒 Security Note
Never commit your `.env` file or API keys to any public GitHub repository. Sensitive credentials are fully ignored via `.gitignore`.
