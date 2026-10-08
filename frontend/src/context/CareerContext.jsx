import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialStudentData } from '../data/initialData';
import { studentService } from '../services/api';

const CareerContext = createContext(null);

export const CareerProvider = ({ children }) => {
  const [studentData, setStudentData] = useState(initialStudentData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getDashboard();
      if (data) {
        setStudentData(prev => ({
          ...prev,
          // Real profile from DB
          profile: data.student
            ? {
                ...prev.profile,
                name: data.student.name || "",
                email: data.student.email || "",
                university: data.student.university || "",
                degree: data.student.degree || "",
                semester: data.student.semester || "",
                cgpa: data.student.cgpa || "",
                target_role: data.student.target_role || "",
                bio: data.student.bio || "",
                phone: data.student.phone || "",
                location: data.student.location || "",
                github_username: data.student.github_username || "",
                linkedin_url: data.student.linkedin_url || "",
                portfolio_url: data.student.portfolio_url || "",
                initials: (data.student.name || "")
                  .split(" ")
                  .map(w => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?",
                profile_completion: data.student.profile_completion || 0,
              }
            : prev.profile,

          // Real stats from DB
          stats: data.stats
            ? {
                learning_xp: data.stats.learning_xp ?? 0,
                xp_this_week: `+${data.stats.xp_this_week ?? 0} this week`,
                skill_confidence: `${data.stats.skill_confidence ?? 0}%`,
                skill_subtitle: "Evidence-based profile",
                career_readiness: `${data.stats.career_readiness ?? 0}%`,
                career_subtitle: `Target: ${data.student?.target_role || "Not set"}`,
                streak_days: `${data.stats.streak_days ?? 0} 🔥`,
                streak_subtitle: "days continuous practice",
                coding_score: `${data.stats.coding_score ?? 0}%`,
                interview_readiness: `${data.stats.interview_readiness ?? 0}%`,
                verified_projects: data.stats.verified_projects ?? 0,
                assessments_completed: data.stats.assessments_completed ?? 0,
              }
            : prev.stats,

          // Real skills from DB (empty array = show empty state)
          skills: Array.isArray(data.skills) ? data.skills : prev.skills,

          // Journey steps if provided
          journeySteps: Array.isArray(data.journey_steps) ? data.journey_steps : prev.journeySteps,

          // Recent activity if provided
          recentActivity: Array.isArray(data.recent_activity) ? data.recent_activity : prev.recentActivity,

          // Recommended actions if provided
          recommendedActions: Array.isArray(data.recommended_actions) && data.recommended_actions.length > 0
            ? data.recommended_actions
            : prev.recommendedActions,
        }));
      }
    } catch (err) {
      setError("Could not load dashboard data. Please check your connection.");
      console.warn("CareerContext: dashboard fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh from backend — exportable for use in any page
  const refreshDashboard = useCallback(() => {
    const token = localStorage.getItem('careeros_token') || sessionStorage.getItem('careeros_token');
    if (token) {
      fetchDashboard();
    }
  }, [fetchDashboard]);

  // Auto-fetch on mount if the user is logged in
  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return (
    <CareerContext.Provider value={{ studentData, setStudentData, loading, error, refreshDashboard }}>
      {children}
    </CareerContext.Provider>
  );
};

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
};
