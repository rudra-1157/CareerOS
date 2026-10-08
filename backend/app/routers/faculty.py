from fastapi import APIRouter

router = APIRouter(prefix="/faculty", tags=["Faculty"])

@router.get("/dashboard")
def get_faculty_dashboard():
    return {
        "stats": {
            "total_students": 142,
            "batches_assigned": 3,
            "avg_skill_confidence": "81%",
            "placement_ready_pct": "76%",
            "pending_viva_reviews": 6
        },
        "assigned_classes": [
            {"subject": "Design & Analysis of Algorithms", "code": "CS-301", "batch": "CSE 3rd Year - A", "students": 58, "avg_score": "84%"},
            {"subject": "Machine Learning Systems", "code": "CS-504", "batch": "CSE 3rd Year - B", "students": 46, "avg_score": "78%"},
            {"subject": "Database Management Systems", "code": "CS-302", "batch": "CSE 2nd Year - C", "students": 38, "avg_score": "86%"}
        ],
        "recent_submissions": [
            {"student": "Rudra Padhy", "topic": "DSA Two Sum Challenge", "status": "Verified", "time": "2 hours ago", "xp": "+100 XP"},
            {"student": "Sahil Shinde", "topic": "Graph Algorithms & BFS", "status": "Under Review", "time": "5 hours ago", "xp": "+120 XP"},
            {"student": "Ananya Roy", "topic": "Relational Indexing Lab", "status": "Verified", "time": "1 day ago", "xp": "+90 XP"},
            {"student": "Karan Mehta", "topic": "ML Regression Pipeline", "status": "Action Required", "time": "2 days ago", "xp": "+150 XP"}
        ],
        "curriculum_recommendations": [
            "Increase practical lab assignments on Dynamic Programming for CS-301.",
            "Schedule guest seminar on Production ML Pipelines for CS-504.",
            "Verify remaining 6 viva submissions before weekly deadline."
        ]
    }
