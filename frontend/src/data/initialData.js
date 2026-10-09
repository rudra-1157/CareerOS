/**
 * Initial defaults and structures for CareerOS frontend modules.
 * These act as clean initial states and fallbacks when backend data is loading or empty.
 */

export const initialStudentData = {
  profile: {
    name: "",
    university: "",
    degree: "",
    semester: "",
    cgpa: "",
    target_role: "",
    initials: "",
    email: "",
    phone: "",
    location: "",
    github_username: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    resume_name: "",
    resume_uploaded_at: "",
    resume_ats_score: null,
    bio: "",
    profile_completion: 0,
    interests: [],
    primary_skills: []
  },
  stats: {
    learning_xp: 0,
    xp_this_week: "+0 this week",
    skill_confidence: "0%",
    skill_subtitle: "No skills added yet",
    career_readiness: "0%",
    career_subtitle: "Set a target role to get started",
    streak_days: "0 🔥",
    streak_subtitle: "Start your streak today",
    coding_score: "0%",
    interview_readiness: "0%",
    verified_projects: 0,
    assessments_completed: 0
  },
  skills: [],
  journeySteps: [
    { step: 1, icon: "📚", title: "Learn", desc: "Institution resources + AI Mentor", status: "upcoming", progress: "0%" },
    { step: 2, icon: "💻", title: "Practice", desc: "Coding challenges & weekly viva", status: "upcoming", progress: "0%" },
    { step: 3, icon: "🛠️", title: "Build", desc: "Projects & GitHub evidence", status: "upcoming", progress: "0%" },
    { step: 4, icon: "🛡️", title: "Verify", desc: "Faculty review & skill assessments", status: "upcoming", progress: "0%" },
    { step: 5, icon: "🌟", title: "Showcase", desc: "Verified Skill Passport for recruiters", status: "upcoming", progress: "0%" },
    { step: 6, icon: "🚀", title: "Get Hired", desc: "Campus drives & target roles", status: "upcoming", progress: "0%" }
  ],
  recommendedActions: [
    {
      id: 1,
      title: "Complete your student profile",
      category: "Getting Started",
      impact: "Unlock AI recommendations",
      xp: "+50 XP",
      urgency: "High Priority",
      route: "/profile"
    },
    {
      id: 2,
      title: "Add your first skill to Skill Passport",
      category: "Skill Tracking",
      impact: "Begin evidence-based profile",
      xp: "+30 XP",
      urgency: "Recommended",
      route: "/passport"
    },
    {
      id: 3,
      title: "Solve your first coding challenge",
      category: "Coding Practice",
      impact: "Start building coding evidence",
      xp: "+100 XP",
      urgency: "Recommended",
      route: "/coding"
    }
  ],
  recentActivity: [],
  upcomingTasks: [
    { id: 1, title: "No upcoming events", date: "Check back after setting up your profile", type: "Info", badge: "Setup" }
  ],
  aiRecommendations: {
    headline: "Start by completing your profile",
    summary: "Set your target career role, add your skills, and upload your resume to unlock personalized AI recommendations tailored to your goals."
  }
};

export const initialNotificationsData = [
  {
    id: 1,
    title: "Welcome to CareerOS",
    message: "Start by completing your profile and setting your target career role.",
    time: "Just now",
    unread: true
  }
];

export const initialMentorData = {
  initialMessages: [
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your AI Learning Mentor. Ask me any question regarding your university course syllabus, lab viva preparation, DSA algorithms, or AI/ML roadmap!',
      timestamp: 'Just now'
    }
  ],
  suggestedQuestions: [
    "Explain Peterson's Solution for Process Synchronization",
    "What are classic OS Viva questions for Semester 3?",
    "Give me a 4-week Graph Algorithms study roadmap",
    "How do I make my ML project recruiter-ready?"
  ],
  resources: [
    {
      id: 1,
      icon: '📖',
      title: 'Operating Systems (CS301)',
      category: 'Core Syllabus',
      count: '5 Units • 12 Topics',
      topics: ['Process Management', 'CPU Scheduling', 'Deadlocks', 'Memory Management']
    },
    {
      id: 2,
      icon: '📊',
      title: 'Data Structures & Algorithms',
      category: 'Core Syllabus',
      count: '6 Units • 24 Topics',
      topics: ['Trees & Graphs', 'Dynamic Programming', 'Sorting & Searching']
    },
    {
      id: 3,
      icon: '💾',
      title: 'Database Management Systems',
      category: 'Core Syllabus',
      count: '4 Units • 10 Topics',
      topics: ['Normalization', 'Transactions & ACID', 'Indexing & B+ Trees']
    },
    {
      id: 4,
      icon: '📝',
      title: 'Mid-Term & Past Year Papers',
      category: 'Exams & Viva',
      count: '8 Papers Indexed',
      topics: ['2024 Viva Prep', '2023 End-Term Question Bank']
    }
  ]
};

export const initialRoadmapData = {
  targetRole: "AI/ML Engineer",
  estimatedTimeline: "6-8 Months",
  overallProgress: 35,
  phases: [
    {
      phaseNumber: 1,
      title: "Phase 1: Mathematical Foundations & Python Mastery",
      duration: "Month 1-2",
      status: "Completed",
      completion: 100,
      tasks: [
        { id: 1, title: "Master Linear Algebra & Vector Calculus", done: true, tag: "Math" },
        { id: 2, title: "Python Advanced OOP & NumPy/Pandas", done: true, tag: "Code" },
        { id: 3, title: "Data Structures & Algorithm Basics", done: true, tag: "DSA" }
      ]
    },
    {
      phaseNumber: 2,
      title: "Phase 2: Classical Machine Learning & Scikit-Learn",
      duration: "Month 3-4",
      status: "In Progress",
      completion: 40,
      tasks: [
        { id: 4, title: "Supervised & Unsupervised Learning Models", done: true, tag: "ML" },
        { id: 5, title: "Feature Engineering & Cross-Validation", done: false, tag: "ML" },
        { id: 6, title: "Kaggle Competition & Benchmark Pipeline", done: false, tag: "Project" }
      ]
    },
    {
      phaseNumber: 3,
      title: "Phase 3: Deep Learning, PyTorch & LLMs",
      duration: "Month 5-6",
      status: "Upcoming",
      completion: 0,
      tasks: [
        { id: 7, title: "Neural Networks & PyTorch Fundamentals", done: false, tag: "DL" },
        { id: 8, title: "Transformer Architectures & Attention Mechanisms", done: false, tag: "LLM" },
        { id: 9, title: "RAG Pipeline with LangChain / Vector DBs", done: false, tag: "Project" }
      ]
    },
    {
      phaseNumber: 4,
      title: "Phase 4: Production Deployment & Placement Readiness",
      duration: "Month 7-8",
      status: "Upcoming",
      completion: 0,
      tasks: [
        { id: 10, title: "FastAPI Microservice & Docker Containerization", done: false, tag: "DevOps" },
        { id: 11, title: "Mock Coding Interviews & System Design", done: false, tag: "Interview" },
        { id: 12, title: "Faculty Attestation & Verified Skill Passport", done: false, tag: "Career" }
      ]
    }
  ]
};

export const initialResumeData = {
  fileName: "Resume_Engineering.pdf",
  atsScore: 84,
  matchRating: "High Match (Target: AI/ML Engineer)",
  parsedAt: "Recent",
  detectedSkills: [
    { name: "Python", category: "Programming", match: true },
    { name: "PyTorch / TensorFlow", category: "Deep Learning", match: true },
    { name: "Scikit-Learn", category: "Machine Learning", match: true },
    { name: "FastAPI / REST", category: "Backend", match: true },
    { name: "Docker / Containers", category: "DevOps", match: true },
    { name: "SQL & PostgreSQL", category: "Databases", match: true },
    { name: "Git & Version Control", category: "Tools", match: true },
    { name: "Kubernetes / Helm", category: "Cloud & Orchestration", match: false },
    { name: "MLOps (MLflow/Airflow)", category: "ML Engineering", match: false }
  ],
  strengths: [
    "Strong emphasis on end-to-end ML projects with verifiable links",
    "Clean single-column layout without tables or multi-column parsing traps",
    "Clear quantifying metrics (e.g. 'reduced latency by 42%')"
  ],
  weaknesses: [
    "Missing MLOps workflow tools (e.g. MLflow, DVC, Airflow)",
    "No formal cloud certifications listed (AWS/GCP/Azure)"
  ],
  suggestions: [
    {
      title: "Add MLOps Keywords",
      desc: "Include keywords like CI/CD for models, artifact tracking with MLflow, and automated model deployment pipelines."
    },
    {
      title: "Highlight Distributed Systems",
      desc: "Mention experience with multi-GPU training or scalable microservice backends to stand out for high-tier tech roles."
    }
  ]
};

export const initialProjectsData = [
  {
    id: 1,
    title: "AI Resume & ATS Diagnostic Engine",
    category: "Machine Learning / NLP",
    desc: "Transformer-based NLP pipeline extracting competencies and calculating semantic matching score against job descriptions.",
    techStack: ["Python", "PyTorch", "FastAPI", "React"],
    githubUrl: "https://github.com/example/career-os",
    demoUrl: "https://demo.careeros.app",
    verifiedStatus: "Faculty Verified",
    verifiedBy: "Dr. K. Sharma (AI Dept Head)",
    evidenceScore: "94/100",
    date: "Semester 3",
    stars: 12,
    metrics: "Sub-150ms inference latency on 10-page PDFs"
  },
  {
    id: 2,
    title: "Distributed Task Scheduler & Job Queue",
    category: "Systems & Backend",
    desc: "Fault-tolerant asynchronous job queue implementing Raft consensus for leader election with Redis persistence.",
    techStack: ["Go", "Redis", "Docker", "gRPC"],
    githubUrl: "https://github.com/example/job-queue",
    demoUrl: "",
    verifiedStatus: "Faculty Verified",
    verifiedBy: "Prof. V. Raman (Systems Lab)",
    evidenceScore: "88/100",
    date: "Semester 2",
    stars: 8,
    metrics: "10,000 tasks/sec throughput with 99.9% uptime"
  }
];

export const initialGithubData = {
  username: "student-dev",
  stats: {
    githubScore: 88,
    evidenceStrength: "High",
    publicRepos: 14,
    totalCommitsThisYear: 342,
    totalStars: 28,
    currentStreak: "14 Days"
  },
  topRepositories: [
    {
      name: "ai-resume-parser",
      verifiedEvidence: "Verified Artifact",
      stars: 18,
      commits: 64,
      desc: "End-to-end NLP parser and keyword matcher with unit tests and Dockerfile.",
      language: "Python"
    },
    {
      name: "distributed-raft-kv",
      verifiedEvidence: "Systems Code",
      stars: 10,
      commits: 48,
      desc: "Distributed key-value store using Raft consensus algorithm.",
      language: "Go"
    }
  ],
  commitActivity: [
    { month: "May", commits: 38 },
    { month: "Jun", commits: 52 },
    { month: "Jul", commits: 64 },
    { month: "Aug", commits: 45 },
    { month: "Sep", commits: 78 },
    { month: "Oct", commits: 65 }
  ],
  languages: [
    { name: "Python", percentage: 54, color: "#3572A5" },
    { name: "JavaScript / TypeScript", percentage: 28, color: "#F7DF1E" },
    { name: "Go / C++", percentage: 14, color: "#00ADD8" },
    { name: "HTML & CSS", percentage: 4, color: "#E34F26" }
  ]
};

export const initialCompanyData = {
  stats: {
    totalCandidates: 284,
    verifiedCandidates: 196,
    avgReadiness: "76.4%",
    activeJobOpenings: 18
  },
  candidates: [
    {
      id: 1,
      name: "Aarav Sharma",
      targetRole: "AI/ML Engineer",
      degree: "B.Tech CSE (AI Specialization)",
      readiness: 92,
      codingScore: "88%",
      projectsCount: 4,
      githubCommits: 412,
      verifiedBadges: ["PyTorch Certified", "Top 5% DSA", "Faculty Attested"],
      skills: [
        { name: "Python", score: 94, verified: true },
        { name: "PyTorch", score: 90, verified: true },
        { name: "DSA", score: 88, verified: true },
        { name: "FastAPI", score: 85, verified: true }
      ]
    },
    {
      id: 2,
      name: "Ananya Patel",
      targetRole: "Full Stack Engineer",
      degree: "B.Tech Information Technology",
      readiness: 88,
      codingScore: "84%",
      projectsCount: 5,
      githubCommits: 320,
      verifiedBadges: ["React Specialist", "Cloud Practitioner"],
      skills: [
        { name: "React", score: 92, verified: true },
        { name: "Node.js", score: 86, verified: true },
        { name: "PostgreSQL", score: 84, verified: true },
        { name: "TypeScript", score: 82, verified: true }
      ]
    },
    {
      id: 3,
      name: "Rohan Verma",
      targetRole: "Cloud & DevOps Engineer",
      degree: "B.Tech CSE",
      readiness: 81,
      codingScore: "78%",
      projectsCount: 3,
      githubCommits: 290,
      verifiedBadges: ["Docker Certified", "Linux SysAdmin"],
      skills: [
        { name: "Docker/K8s", score: 86, verified: true },
        { name: "Linux", score: 88, verified: true },
        { name: "AWS", score: 79, verified: false },
        { name: "CI/CD", score: 82, verified: true }
      ]
    }
  ]
};

export const initialCodingData = {
  stats: {
    solvedCount: 18,
    batchRank: "#12",
    percentile: "Top 6% of CSE",
    totalXP: "1,850 XP",
    streak: "8 Days"
  },
  todaysChallenge: {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    xp: "+100 XP",
    category: "Arrays & Hashing",
    tags: ["Array", "Hash Table", "Top Interview 150"],
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    starterCode: {
      python: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []",
      javascript: "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}",
      cpp: "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int diff = target - nums[i];\n            if (seen.count(diff)) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};"
    },
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]", status: "Passed" },
      { input: "nums = [3,2,4], target = 6", expected: "[1, 2]", status: "Passed" },
      { input: "nums = [3,3], target = 6", expected: "[0, 1]", status: "Passed" }
    ]
  },
  challenges: [
    {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      xp: 100,
      category: "Arrays & Hashing"
    },
    {
      id: "valid-anagram",
      title: "Valid Anagram",
      difficulty: "Easy",
      xp: 80,
      category: "Strings"
    },
    {
      id: "binary-search",
      title: "Binary Search",
      difficulty: "Easy",
      xp: 80,
      category: "Binary Search"
    },
    {
      id: "longest-substring",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      xp: 180,
      category: "Sliding Window"
    }
  ]
};
