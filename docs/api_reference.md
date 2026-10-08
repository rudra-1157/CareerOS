# CareerOS API Reference

Base URL: `http://localhost:8000/api/v1`

## Endpoints

### 1. Student
- `GET /student/dashboard`: Returns student stats, current skills progress, and journey steps.
- `GET /student/profile`: Returns basic student profile and academic status.

### 2. AI Mentor
- `POST /mentor/chat`: Sends a query to the AI Mentor with RAG context retrieval.
  - Body: `{"query": "Explain RAG in simple terms", "student_id": 1}`
- `GET /mentor/resources`: Lists available institutional resources and subject materials.

### 3. Coding Arena
- `GET /coding/overview`: Retrieves today's challenge, rank, batch percentile, and friend challenges.
- `POST /coding/challenge/submit`: Submits code for execution and automated test validation.

### 4. Career Intelligence
- `GET /career/intelligence`: Returns ATS readiness score, detected skills, and GitHub evidence strength.
- `GET /career/roadmap`: Returns the personalized week-by-week skill roadmap.

### 5. Skill Passport
- `GET /passport/summary`: Returns verified skills matrix, confidence ratings, and portfolio metrics.

### 6. Company Dashboard
- `GET /company/candidates`: Returns candidate talent pool with verified skill credentials and readiness.
