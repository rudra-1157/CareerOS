from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/demo", tags=["Demo Mode"])

DEMO_DEVELOPERS: List[Dict[str, Any]] = [
    {
        "id": 901,
        "name": "Priya Sharma",
        "username": "priya_codes",
        "is_demo": True,
        "avatar_url": None,
        "initials": "PS",
        "tagline": "AI/ML Enthusiast & PyTorch Developer",
        "bio": "Building vision transformer pipelines and participating in campus algorithmic contests. CSE 3rd Year.",
        "college": "MIT-ADT University",
        "department": "Department of CSE",
        "year": "3rd Year",
        "degree": "B.Tech Computer Science & Engineering",
        "semester": "Semester 6",
        "level": "Advanced",
        "programming_interests": ["Deep Learning", "Algorithms", "PyTorch", "Python"],
        "skills": [
            {"name": "Python", "level": "Advanced", "score": 92},
            {"name": "PyTorch", "level": "Intermediate", "score": 85},
            {"name": "DSA", "level": "Advanced", "score": 88},
            {"name": "SQL", "level": "Intermediate", "score": 78}
        ],
        "joined_date": "August 2024",
        "total_xp": 2840,
        "current_streak": 14,
        "longest_streak": 26,
        "friends_count": 18,
        "mutual_friends": 4,
        "stats": {
            "total_solved": 92,
            "easy": 45,
            "medium": 38,
            "hard": 9,
            "acceptance_rate": "84.2%",
            "language_distribution": [
                {"language": "Python", "percentage": 68},
                {"language": "C++", "percentage": 22},
                {"language": "SQL", "percentage": 10}
            ]
        },
        "challenges": {
            "total": 24,
            "wins": 18,
            "losses": 4,
            "draws": 2,
            "win_rate": "75%"
        },
        "badges": [
            {"title": "Algorithms Master", "subtitle": "Top 5% Cohort", "date": "Oct 2026"},
            {"title": "14-Day Streak", "subtitle": "Consistency Award", "date": "Nov 2026"},
            {"title": "PyTorch Pioneer", "subtitle": "Capstone Verified", "date": "Sep 2026"}
        ]
    },
    {
        "id": 902,
        "name": "Rohan Verma",
        "username": "rohan_v",
        "is_demo": True,
        "avatar_url": None,
        "initials": "RV",
        "tagline": "Competitive Programmer & C++ Specialist",
        "bio": "Specializing in graph algorithms, segment trees, and high-frequency problem solving. Codeforces Specialist.",
        "college": "MIT-ADT University",
        "department": "Department of IT",
        "year": "2nd Year",
        "degree": "B.Tech Information Technology",
        "semester": "Semester 4",
        "level": "Intermediate",
        "programming_interests": ["Competitive Programming", "C++", "Graphs", "Dynamic Programming"],
        "skills": [
            {"name": "C++", "level": "Advanced", "score": 90},
            {"name": "DSA", "level": "Advanced", "score": 86},
            {"name": "Algorithms", "level": "Advanced", "score": 84}
        ],
        "joined_date": "January 2025",
        "total_xp": 1950,
        "current_streak": 8,
        "longest_streak": 19,
        "friends_count": 12,
        "mutual_friends": 3,
        "stats": {
            "total_solved": 64,
            "easy": 30,
            "medium": 26,
            "hard": 8,
            "acceptance_rate": "79.1%",
            "language_distribution": [
                {"language": "C++", "percentage": 78},
                {"language": "Python", "percentage": 22}
            ]
        },
        "challenges": {
            "total": 19,
            "wins": 13,
            "losses": 5,
            "draws": 1,
            "win_rate": "68%"
        },
        "badges": [
            {"title": "Speed Demon", "subtitle": "<20m Solution", "date": "Nov 2026"},
            {"title": "Graph Solver", "subtitle": "Advanced Traversal", "date": "Oct 2026"}
        ]
    },
    {
        "id": 903,
        "name": "Sneha Kulkarni",
        "username": "sneha_dev",
        "is_demo": True,
        "avatar_url": None,
        "initials": "SK",
        "tagline": "Full-Stack Engineer & React / Node Developer",
        "bio": "Passionate about building distributed web architectures, microservices, and clean component systems.",
        "college": "MIT-ADT University",
        "department": "Department of CSE",
        "year": "3rd Year",
        "degree": "B.Tech Computer Science & Engineering",
        "semester": "Semester 6",
        "level": "Advanced",
        "programming_interests": ["Web Systems", "React", "Node.js", "Docker", "PostgreSQL"],
        "skills": [
            {"name": "JavaScript", "level": "Advanced", "score": 94},
            {"name": "React", "level": "Advanced", "score": 92},
            {"name": "Python", "level": "Intermediate", "score": 80},
            {"name": "PostgreSQL", "level": "Intermediate", "score": 82}
        ],
        "joined_date": "September 2024",
        "total_xp": 2420,
        "current_streak": 11,
        "longest_streak": 22,
        "friends_count": 22,
        "mutual_friends": 5,
        "stats": {
            "total_solved": 81,
            "easy": 42,
            "medium": 32,
            "hard": 7,
            "acceptance_rate": "82.5%",
            "language_distribution": [
                {"language": "JavaScript", "percentage": 58},
                {"language": "Python", "percentage": 30},
                {"language": "SQL", "percentage": 12}
            ]
        },
        "challenges": {
            "total": 21,
            "wins": 15,
            "losses": 5,
            "draws": 1,
            "win_rate": "71%"
        },
        "badges": [
            {"title": "Full-Stack Attested", "subtitle": "Faculty Verified", "date": "Oct 2026"},
            {"title": "Clean Code", "subtitle": "Zero Lint Warnings", "date": "Aug 2026"}
        ]
    },
    {
        "id": 904,
        "name": "Amit Patel",
        "username": "amit_p",
        "is_demo": True,
        "avatar_url": None,
        "initials": "AP",
        "tagline": "1st Year CSE Explorer & Python Learner",
        "bio": "Building foundations in object-oriented programming, elementary data structures, and computer organization.",
        "college": "MIT-ADT University",
        "department": "Department of CSE",
        "year": "1st Year",
        "degree": "B.Tech Computer Science & Engineering",
        "semester": "Semester 2",
        "level": "Beginner",
        "programming_interests": ["Python", "Logic Building", "Math for CS"],
        "skills": [
            {"name": "Python", "level": "Developing", "score": 68},
            {"name": "C", "level": "Developing", "score": 62}
        ],
        "joined_date": "August 2025",
        "total_xp": 650,
        "current_streak": 4,
        "longest_streak": 6,
        "friends_count": 8,
        "mutual_friends": 2,
        "stats": {
            "total_solved": 22,
            "easy": 18,
            "medium": 4,
            "hard": 0,
            "acceptance_rate": "71.0%",
            "language_distribution": [
                {"language": "Python", "percentage": 75},
                {"language": "C", "percentage": 25}
            ]
        },
        "challenges": {
            "total": 6,
            "wins": 3,
            "losses": 3,
            "draws": 0,
            "win_rate": "50%"
        },
        "badges": [
            {"title": "First Problem Solved", "subtitle": "Journey Started", "date": "Sep 2026"}
        ]
    },
    {
        "id": 905,
        "name": "Neha Deshmukh",
        "username": "neha_d",
        "is_demo": True,
        "avatar_url": None,
        "initials": "ND",
        "tagline": "AI & Data Science Student | Scikit-Learn & NLP",
        "bio": "Focusing on statistical modeling, tabular data analysis, and natural language processing pipelines.",
        "college": "MIT-ADT University",
        "department": "Department of AI & Data Science",
        "year": "2nd Year",
        "degree": "B.Tech AI & Data Science",
        "semester": "Semester 4",
        "level": "Intermediate",
        "programming_interests": ["Data Science", "Python", "Scikit-Learn", "FastAPI"],
        "skills": [
            {"name": "Python", "level": "Advanced", "score": 88},
            {"name": "Data Science", "level": "Intermediate", "score": 82},
            {"name": "SQL", "level": "Intermediate", "score": 75}
        ],
        "joined_date": "July 2024",
        "total_xp": 1720,
        "current_streak": 9,
        "longest_streak": 16,
        "friends_count": 14,
        "mutual_friends": 4,
        "stats": {
            "total_solved": 55,
            "easy": 30,
            "medium": 21,
            "hard": 4,
            "acceptance_rate": "80.0%",
            "language_distribution": [
                {"language": "Python", "percentage": 82},
                {"language": "SQL", "percentage": 18}
            ]
        },
        "challenges": {
            "total": 14,
            "wins": 9,
            "losses": 4,
            "draws": 1,
            "win_rate": "64%"
        },
        "badges": [
            {"title": "Data Wrangler", "subtitle": "Clean ETL", "date": "Oct 2026"}
        ]
    },
    {
        "id": 906,
        "name": "Vikram Joshi",
        "username": "vikram_j",
        "is_demo": True,
        "avatar_url": None,
        "initials": "VJ",
        "tagline": "Systems Engineer | Linux, Go & Distributed Storage",
        "bio": "Interested in operating systems kernels, networking protocols, low-level concurrency, and cloud infrastructure.",
        "college": "MIT-ADT University",
        "department": "Department of IT",
        "year": "3rd Year",
        "degree": "B.Tech Information Technology",
        "semester": "Semester 6",
        "level": "Advanced",
        "programming_interests": ["Go", "C++", "Linux Systems", "Distributed Databases"],
        "skills": [
            {"name": "C++", "level": "Advanced", "score": 92},
            {"name": "Go", "level": "Advanced", "score": 88},
            {"name": "Operating Systems", "level": "Advanced", "score": 90}
        ],
        "joined_date": "March 2024",
        "total_xp": 3100,
        "current_streak": 18,
        "longest_streak": 31,
        "friends_count": 25,
        "mutual_friends": 6,
        "stats": {
            "total_solved": 105,
            "easy": 48,
            "medium": 45,
            "hard": 12,
            "acceptance_rate": "86.4%",
            "language_distribution": [
                {"language": "C++", "percentage": 50},
                {"language": "Go", "percentage": 35},
                {"language": "Python", "percentage": 15}
            ]
        },
        "challenges": {
            "total": 32,
            "wins": 26,
            "losses": 5,
            "draws": 1,
            "win_rate": "81%"
        },
        "badges": [
            {"title": "Arena Champion", "subtitle": "Rank 1 in Cohort", "date": "Nov 2026"},
            {"title": "Concurrency Pro", "subtitle": "Lockless Algorithms", "date": "Sep 2026"}
        ]
    },
    {
        "id": 907,
        "name": "Ananya Roy",
        "username": "ananya_ai",
        "is_demo": True,
        "avatar_url": None,
        "initials": "AR",
        "tagline": "DSA Enthusiast & Python Developer",
        "bio": "Daily LeetCode solver with high accuracy on dynamic programming and tree traversals. CSE 2nd Year.",
        "college": "MIT-ADT University",
        "department": "Department of CSE",
        "year": "2nd Year",
        "degree": "B.Tech Computer Science & Engineering",
        "semester": "Semester 4",
        "level": "Intermediate",
        "programming_interests": ["DSA", "Python", "Algorithms", "Mathematics"],
        "skills": [
            {"name": "Python", "level": "Advanced", "score": 86},
            {"name": "DSA", "level": "Intermediate", "score": 80}
        ],
        "joined_date": "October 2024",
        "total_xp": 1480,
        "current_streak": 6,
        "longest_streak": 12,
        "friends_count": 11,
        "mutual_friends": 3,
        "stats": {
            "total_solved": 48,
            "easy": 28,
            "medium": 18,
            "hard": 2,
            "acceptance_rate": "77.5%",
            "language_distribution": [
                {"language": "Python", "percentage": 85},
                {"language": "C++", "percentage": 15}
            ]
        },
        "challenges": {
            "total": 12,
            "wins": 7,
            "losses": 4,
            "draws": 1,
            "win_rate": "58%"
        },
        "badges": [
            {"title": "Tree Master", "subtitle": "Binary Trees 100%", "date": "Oct 2026"}
        ]
    },
    {
        "id": 908,
        "name": "Tanmay Patil",
        "username": "tanmay_p",
        "is_demo": True,
        "avatar_url": None,
        "initials": "TP",
        "tagline": "1st Year CSE | C++ Foundations & Arrays",
        "bio": "Learning pointers, memory allocation, time complexity analysis, and basic sorting algorithms.",
        "college": "MIT-ADT University",
        "department": "Department of CSE",
        "year": "1st Year",
        "degree": "B.Tech Computer Science & Engineering",
        "semester": "Semester 2",
        "level": "Beginner",
        "programming_interests": ["C++", "Algorithms", "Competitive Basics"],
        "skills": [
            {"name": "C++", "level": "Developing", "score": 72},
            {"name": "Algorithms", "level": "Developing", "score": 65}
        ],
        "joined_date": "August 2025",
        "total_xp": 780,
        "current_streak": 5,
        "longest_streak": 8,
        "friends_count": 6,
        "mutual_friends": 1,
        "stats": {
            "total_solved": 28,
            "easy": 22,
            "medium": 6,
            "hard": 0,
            "acceptance_rate": "73.2%",
            "language_distribution": [
                {"language": "C++", "percentage": 90},
                {"language": "Python", "percentage": 10}
            ]
        },
        "challenges": {
            "total": 8,
            "wins": 4,
            "losses": 4,
            "draws": 0,
            "win_rate": "50%"
        },
        "badges": [
            {"title": "Pointer Ace", "subtitle": "Memory Management", "date": "Nov 2026"}
        ]
    },
    {
        "id": 909,
        "name": "Shreya Nair",
        "username": "shreya_n",
        "is_demo": True,
        "avatar_url": None,
        "initials": "SN",
        "tagline": "Backend Architect & Cloud Systems Developer",
        "bio": "Building high-throughput FastAPI microservices with Redis caching, PostgreSQL indexing, and CI/CD pipelines.",
        "college": "MIT-ADT University",
        "department": "Department of CSE",
        "year": "3rd Year",
        "degree": "B.Tech Computer Science & Engineering",
        "semester": "Semester 6",
        "level": "Advanced",
        "programming_interests": ["Backend", "FastAPI", "PostgreSQL", "Docker", "DevOps"],
        "skills": [
            {"name": "Python", "level": "Advanced", "score": 93},
            {"name": "FastAPI", "level": "Advanced", "score": 90},
            {"name": "Docker", "level": "Intermediate", "score": 84}
        ],
        "joined_date": "May 2024",
        "total_xp": 2640,
        "current_streak": 13,
        "longest_streak": 24,
        "friends_count": 20,
        "mutual_friends": 5,
        "stats": {
            "total_solved": 88,
            "easy": 40,
            "medium": 40,
            "hard": 8,
            "acceptance_rate": "83.0%",
            "language_distribution": [
                {"language": "Python", "percentage": 70},
                {"language": "SQL", "percentage": 20},
                {"language": "Bash", "percentage": 10}
            ]
        },
        "challenges": {
            "total": 26,
            "wins": 19,
            "losses": 6,
            "draws": 1,
            "win_rate": "73%"
        },
        "badges": [
            {"title": "DevOps Architect", "subtitle": "Containerization Pro", "date": "Oct 2026"}
        ]
    },
    {
        "id": 910,
        "name": "Harsh Mehta",
        "username": "harsh_m",
        "is_demo": True,
        "avatar_url": None,
        "initials": "HM",
        "tagline": "Frontend Specialist | UI/UX & React Native",
        "bio": "Building responsive accessible user interfaces, micro-interactions, and cross-platform mobile apps.",
        "college": "MIT-ADT University",
        "department": "Department of IT",
        "year": "2nd Year",
        "degree": "B.Tech Information Technology",
        "semester": "Semester 4",
        "level": "Intermediate",
        "programming_interests": ["JavaScript", "TypeScript", "React", "Mobile"],
        "skills": [
            {"name": "JavaScript", "level": "Advanced", "score": 89},
            {"name": "React", "level": "Advanced", "score": 87},
            {"name": "CSS/Tailwind", "level": "Advanced", "score": 92}
        ],
        "joined_date": "November 2024",
        "total_xp": 1320,
        "current_streak": 7,
        "longest_streak": 14,
        "friends_count": 10,
        "mutual_friends": 2,
        "stats": {
            "total_solved": 42,
            "easy": 26,
            "medium": 14,
            "hard": 2,
            "acceptance_rate": "76.4%",
            "language_distribution": [
                {"language": "JavaScript", "percentage": 75},
                {"language": "Python", "percentage": 25}
            ]
        },
        "challenges": {
            "total": 10,
            "wins": 6,
            "losses": 4,
            "draws": 0,
            "win_rate": "60%"
        },
        "badges": [
            {"title": "UI Craftsman", "subtitle": "Component Design", "date": "Nov 2026"}
        ]
    }
]

@router.get("/developers")
def list_demo_developers():
    """
    Returns the list of 10 fictional demo developer accounts.
    Explicitly labeled as demonstration data.
    """
    return {
        "is_demo_mode": True,
        "notice": "You're viewing sample developer profiles and demonstration activity.",
        "total": len(DEMO_DEVELOPERS),
        "developers": DEMO_DEVELOPERS
    }

@router.get("/developer/{identifier}")
def get_demo_developer_profile(identifier: str):
    """
    Return full developer profile for a demo account by username or id.
    """
    found = None
    for d in DEMO_DEVELOPERS:
        if str(d["id"]) == identifier or d["username"].lower() == identifier.lower():
            found = d
            break

    if not found:
        raise HTTPException(status_code=404, detail="Demo developer profile not found.")

    return {
        "is_demo_mode": True,
        "notice": "You're viewing sample developer profiles and demonstration activity.",
        "developer": found
    }

@router.post("/friend-request")
def simulate_demo_friend_request(target_username: str):
    """Simulate sending a friend request to a demo account."""
    return {
        "status": "success",
        "is_simulated": True,
        "message": f"Demonstration friend request sent to {target_username}! In demo mode, sample accounts simulate accepting your connection."
    }

@router.post("/challenge-sim")
def simulate_demo_challenge(target_username: str, difficulty: str = "Medium"):
    """Simulate a challenge duel with a demo bot."""
    return {
        "status": "success",
        "is_simulated": True,
        "opponent": target_username,
        "difficulty": difficulty,
        "room_code": "DEMO99",
        "message": f"Simulated challenge match initialized with {target_username}!"
    }
