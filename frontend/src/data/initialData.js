/**
 * Initial empty-state defaults for CareerContext.
 * 
 * IMPORTANT: This file must NOT contain any real user data.
 * All user-specific information is fetched from the backend API.
 * These are safe "loading" / "empty" fallbacks only.
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
