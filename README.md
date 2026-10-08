# CareerOS — AI-Powered Career Operating System for Students

> **One Journey. First Year → Placement.**  
> *Learn → Practice → Build → Verify → Showcase → Get Hired*

---

## 🏛️ Project Architecture

```
CareerOS/
├── frontend/                     # React 18 + Vite + Tailwind CSS + Lucide
│   ├── src/
│   │   ├── components/           # Modular & reusable UI components
│   │   │   ├── common/           # MetricCard, Modal, Badge, Button
│   │   │   ├── dashboard/        # HeroBanner, SkillProgressList, JourneyTimeline
│   │   │   ├── mentor/           # ChatInterface, ResourceList
│   │   │   ├── coding/           # CodingGrid
│   │   │   ├── career/           # IntelligenceGrid
│   │   │   ├── passport/         # SkillsTable
│   │   │   └── company/          # CandidateSearchTable
│   │   ├── pages/                # Route pages (Dashboard, Mentor, Coding, Career, Passport, Company)
│   │   ├── layouts/              # MainLayout, Sidebar, TopHeader
│   │   ├── context/              # CareerContext, ModalContext
│   │   ├── services/             # Axios API service client
│   │   ├── data/                 # Baseline prototype demo dataset
│   │   ├── App.jsx               # React Router navigation tree
│   │   ├── main.jsx              # React DOM mounting
│   │   └── index.css             # Tailwind & design token styling
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                      # Python FastAPI application
│   ├── app/
│   │   ├── main.py               # FastAPI application entrypoint & CORS
│   │   ├── config.py             # App settings & environment configs
│   │   ├── database.py           # SQLAlchemy engine & session maker
│   │   ├── models/               # ORM Models (User, Skill, Challenge, CareerProfile)
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── routers/              # API Endpoints (student, mentor, coding, career, passport, company)
│   │   ├── services/             # Core business logic services
│   │   ├── ai/                   # Gemini AI LLM client
│   │   ├── rag/                  # Institutional RAG Retriever engine
│   │   └── utils/                # JWT Auth & utility functions
│   ├── requirements.txt
│   └── .env.example
│
├── database/                     # Database schemas & SQL seeds
│   ├── schema.sql
│   └── seed_data.sql
│
├── docs/                         # System documentation
│   ├── architecture.md
│   └── api_reference.md
│
├── CareerOs.html                 # Original visual baseline prototype
├── .env.example                  # Environment variables template
└── README.md                     # Project documentation
```

---

## 🚀 Running the Application

### 1. Backend (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server with uvicorn
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Base API: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

---

### 2. Frontend (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
- Frontend Web App: [http://localhost:5173](http://localhost:5173)

---

## 💎 Features Preserved & Enhanced
1. **Student Dashboard**: Real-time stats (Learning XP, Skill Confidence, Career Readiness, Streak), skill progress bars, and the full 4-stage student journey.
2. **AI Learning Mentor**: Interactive multi-turn chat assistant powered by Gemini and Institutional RAG, alongside institutional syllabus resources.
3. **Coding Arena**: Daily coding challenges (Two Sum), leaderboard batch rank, friend challenges, and XP tracking.
4. **Career Intelligence**: ATS resume analyzer, GitHub project evidence strength evaluator, AI skill gap identifier, and custom weekly roadmap.
5. **Skill Passport**: Evidence-backed verified skills matrix with confidence ratings and portfolio metrics.
6. **Company Dashboard**: Recruiter candidate search and discovery based on verified student competencies.
