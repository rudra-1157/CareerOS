from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Administrator"])

@router.get("/dashboard")
def get_admin_dashboard():
    return {
        "stats": {
            "total_enrolled_students": 1240,
            "total_faculty_members": 48,
            "system_health": "99.98%",
            "rag_indexed_docs": 184,
            "partner_companies": 32,
            "active_placements": 89
        },
        "department_metrics": [
            {"department": "Computer Science & Engineering", "students": 480, "readiness": "78%", "faculty": 18, "status": "Optimal"},
            {"department": "Information Technology", "students": 320, "readiness": "75%", "faculty": 12, "status": "Optimal"},
            {"department": "AI & Data Science", "students": 240, "readiness": "82%", "faculty": 10, "status": "High Growth"},
            {"department": "Electronics & Telecomm.", "students": 200, "readiness": "69%", "faculty": 8, "status": "Needs Review"}
        ],
        "rag_status": {
            "vector_store": "FAISS Index Active",
            "embeddings_model": "text-embedding-004",
            "curriculum_docs_indexed": 184,
            "last_synced": "10 minutes ago"
        },
        "system_audit_logs": [
            {"event": "Curriculum RAG Sync", "actor": "Admin NV", "status": "Success", "time": "18:20"},
            {"event": "Batch 2026 Student Onboarding", "actor": "System", "status": "Completed (420 Users)", "time": "14:00"},
            {"event": "Company Portal Verification Key Updated", "actor": "Admin NV", "status": "Success", "time": "Yesterday"}
        ]
    }
