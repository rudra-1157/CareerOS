# CareerOS Architecture & System Design

## 1. System Overview
CareerOS is an AI-powered Career Operating System for students, structuring the journey from first year to placement:
**Learn → Practice → Build → Verify → Showcase → Get Hired**

```mermaid
graph TD
    A[Student / Recruiter Web Client] -->|React 18 + Vite + Tailwind| B[CareerOS Frontend UI]
    B -->|Axios REST & JWT| C[FastAPI Application Gateway]
    C --> D[Student & Profile Service]
    C --> E[Coding Arena Engine]
    C --> F[Career Intelligence & ATS Engine]
    C --> G[Institutional RAG Service]
    C --> H[Company Recruiter Portal]
    G --> I[(FAISS / Institutional Vector Docs)]
    G --> J[Gemini AI LLM]
    D --> K[(PostgreSQL / SQLite Database)]
    E --> K
    F --> K
```

## 2. Component Breakdown

### Frontend (`frontend/`)
- **React 18 & Vite**: Fast HMR and lightweight bundle.
- **Tailwind CSS & Vanilla Design Tokens**: Maintains prototype color scheme (`#101a3b`, `#172654`, `#315bdc`, `#f5f7fb`, `#29396f`).
- **React Router**: Seamless client-side navigation (`/`, `/mentor`, `/coding`, `/career`, `/passport`, `/companies`).
- **Lucide React Icons**: Consistent icons for navigation and actions.
- **Context API**: Global state for user profile, active modal states, and live chat.

### Backend (`backend/`)
- **FastAPI**: Asynchronous high-performance REST API.
- **SQLAlchemy & Pydantic**: Robust ORM models and schema validation.
- **Gemini AI Integration**: Real-time response generation with context augmentation.
- **Institutional RAG**: Semantic retrieval of institutional documents and course resources.

### Database (`database/`)
- Relational schema for students, skills, challenges, and career intelligence.
