import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/api/v1')) {
  rawBaseUrl = `${rawBaseUrl}/api/v1`;
}
const API_BASE_URL = rawBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── JWT Interceptor ─────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('careeros_token') || sessionStorage.getItem('careeros_token');
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ─── Response Interceptor: Auto-recover from stale/invalid credentials ───────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const detail = error.response.data?.detail;
      if (
        detail === 'Could not validate credentials' ||
        detail === 'Not authenticated' ||
        detail === 'Invalid token payload'
      ) {
        localStorage.removeItem('careeros_token');
        localStorage.removeItem('careeros_user');
        sessionStorage.removeItem('careeros_token');
        sessionStorage.removeItem('careeros_user');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },
  getDemoUsers: async () => {
    try {
      const response = await apiClient.get('/auth/demo-users');
      return response.data;
    } catch {
      return [
        { role: 'student', email: 'student@careeros.edu', password: 'password123', name: 'Student Demo' },
        { role: 'faculty', email: 'faculty@careeros.edu', password: 'password123', name: 'Faculty Demo' },
        { role: 'admin', email: 'admin@careeros.edu', password: 'password123', name: 'Admin Demo' }
      ];
    }
  },
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};

// ─── Student Dashboard ────────────────────────────────────────────────────────
export const studentService = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/student/dashboard');
      return response.data;
    } catch (error) {
      if (error?.response?.status === 401) return null; // Not authenticated
      console.warn('Backend student/dashboard unavailable');
      return null;
    }
  },
  getProfile: async () => {
    const response = await apiClient.get('/student/profile');
    return response.data;
  },
  updateProfile: async (payload) => {
    const response = await apiClient.put('/student/profile', payload);
    return response.data;
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/student/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  removeAvatar: async () => {
    const response = await apiClient.delete('/student/avatar');
    return response.data;
  },
  updateTheme: async (theme) => {
    const formData = new FormData();
    formData.append('theme', theme);
    const response = await apiClient.put('/student/theme', formData);
    return response.data;
  },
  getDeveloperProfile: async (userId) => {
    const response = await apiClient.get(`/student/developer/${userId}`);
    return response.data;
  }
};

// ─── Faculty ──────────────────────────────────────────────────────────────────
export const facultyService = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/faculty/dashboard');
      return response.data;
    } catch {
      return null;
    }
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminService = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return response.data;
    } catch {
      return null;
    }
  },
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to load user database:', error);
      return { total: 0, users: [] };
    }
  },
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/admin/users/stats');
      return response.data;
    } catch {
      return null;
    }
  },
  getExportUrl: () => `${API_BASE_URL}/admin/users/export`
};

// ─── AI Mentor ────────────────────────────────────────────────────────────────
export const mentorService = {
  ask: async (message, session_id = null) => {
    const payload = { message };
    if (session_id) payload.session_id = session_id;
    const response = await apiClient.post('/mentor/chat', payload);
    return response.data;
  },
  getSessions: async () => {
    const response = await apiClient.get('/mentor/sessions');
    return response.data;
  },
  createSession: async (title = 'New Conversation') => {
    const response = await apiClient.post('/mentor/sessions', { title });
    return response.data;
  },
  getSession: async (session_id) => {
    const response = await apiClient.get(`/mentor/sessions/${session_id}`);
    return response.data;
  },
  deleteSession: async (session_id) => {
    const response = await apiClient.delete(`/mentor/sessions/${session_id}`);
    return response.data;
  },
  getResources: async () => {
    const response = await apiClient.get('/mentor/resources');
    return response.data;
  },
  getAIStatus: async () => {
    try {
      const response = await apiClient.get('/mentor/ai-status');
      return response.data;
    } catch {
      return { configured: false, status: 'Unknown' };
    }
  }
};

// ─── Coding Arena ─────────────────────────────────────────────────────────────
export const codingService = {
  getChallenges: async () => {
    const response = await apiClient.get('/coding/challenges');
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/coding/stats');
    return response.data;
  },
  runCode: async (payload) => {
    const response = await apiClient.post('/coding/run', payload);
    return response.data;
  },
  submitCode: async (payload) => {
    const response = await apiClient.post('/coding/submit', payload);
    return response.data;
  },
  createChallenge: async (payload) => {
    const response = await apiClient.post('/coding/challenges/create', payload);
    return response.data;
  },
  getSubmissions: async () => {
    const response = await apiClient.get('/coding/submissions');
    return response.data;
  }
};

// ─── Career / Resume / GitHub / Roadmap ──────────────────────────────────────
export const careerService = {
  getIntelligence: async () => {
    const response = await apiClient.get('/career/intelligence');
    return response.data;
  },
  getResume: async () => {
    const response = await apiClient.get('/career/resume');
    return response.data;
  },
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/career/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getGitHub: async () => {
    const response = await apiClient.get('/career/github');
    return response.data;
  },
  syncGitHub: async (username) => {
    const response = await apiClient.post('/career/github/sync', { username });
    return response.data;
  },
  getRoadmap: async () => {
    const response = await apiClient.get('/career/roadmap');
    return response.data;
  },
  toggleRoadmapTask: async (phase_number, task_title) => {
    const response = await apiClient.post('/career/roadmap/task/toggle', { phase_number, task_title });
    return response.data;
  }
};

// ─── Skill Passport ───────────────────────────────────────────────────────────
export const passportService = {
  getPassport: async () => {
    const response = await apiClient.get('/passport');
    return response.data;
  },
  addSkill: async (payload) => {
    const response = await apiClient.post('/passport/skills', payload);
    return response.data;
  }
};

// ─── Projects ─────────────────────────────────────────────────────────────────
export const projectsService = {
  getProjects: async () => {
    const response = await apiClient.get('/projects');
    return response.data;
  },
  createProject: async (payload) => {
    const response = await apiClient.post('/projects', payload);
    return response.data;
  }
};

// ─── Company ──────────────────────────────────────────────────────────────────
export const companyService = {
  getCandidates: async (role = '') => {
    const params = role ? `?role=${encodeURIComponent(role)}` : '';
    const response = await apiClient.get(`/company/candidates${params}`);
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get('/company/stats');
    return response.data;
  }
};

// ─── Friends & Social ─────────────────────────────────────────────────────────
export const friendsService = {
  getFriends: async () => {
    const response = await apiClient.get('/friends/list');
    return response.data;
  },
  getRequests: async () => {
    const response = await apiClient.get('/friends/requests');
    return response.data;
  },
  searchFriends: async (query) => {
    const response = await apiClient.get(`/friends/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  sendRequest: async (targetUserId) => {
    const response = await apiClient.post(`/friends/request/${targetUserId}`);
    return response.data;
  },
  acceptRequest: async (requestId) => {
    const response = await apiClient.post(`/friends/accept/${requestId}`);
    return response.data;
  },
  declineRequest: async (requestId) => {
    const response = await apiClient.post(`/friends/decline/${requestId}`);
    return response.data;
  },
  removeFriend: async (friendId) => {
    const response = await apiClient.delete(`/friends/remove/${friendId}`);
    return response.data;
  },
  compare: async (targetUserId) => {
    const response = await apiClient.get(`/friends/compare/${targetUserId}`);
    return response.data;
  }
};

// ─── Coding Battles & Challenges ─────────────────────────────────────────────
export const challengeService = {
  createBattle: async (payload) => {
    const response = await apiClient.post('/challenges/create', payload);
    return response.data;
  },
  getRoom: async (roomCode) => {
    const response = await apiClient.get(`/challenges/room/${roomCode}`);
    return response.data;
  },
  joinRoom: async (roomCode) => {
    const response = await apiClient.post(`/challenges/join/${roomCode}`);
    return response.data;
  },
  toggleReady: async (roomCode, isReady = true) => {
    const response = await apiClient.post(`/challenges/ready/${roomCode}`, { is_ready: isReady });
    return response.data;
  },
  startBattle: async (roomCode) => {
    const response = await apiClient.post(`/challenges/start/${roomCode}`);
    return response.data;
  },
  submitCode: async (roomCode, payload) => {
    const response = await apiClient.post(`/challenges/submit/${roomCode}`, payload);
    return response.data;
  },
  getHistory: async () => {
    const response = await apiClient.get('/challenges/history');
    return response.data;
  }
};

// ─── In-App Notifications ────────────────────────────────────────────────────
export const notificationService = {
  getNotifications: async () => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },
  markRead: async (notificationId) => {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

// ─── External Public Developer Data ──────────────────────────────────────────
export const externalService = {
  getGithub: async (username) => {
    const response = await apiClient.get(`/external/github/${encodeURIComponent(username)}`);
    return response.data;
  },
  getCodeforces: async (handle) => {
    const response = await apiClient.get(`/external/codeforces/${encodeURIComponent(handle)}`);
    return response.data;
  }
};

// ─── Demo Accounts & Simulation ──────────────────────────────────────────────
export const demoService = {
  getDevelopers: async () => {
    const response = await apiClient.get('/demo/developers');
    return response.data;
  },
  getProfile: async (demoId) => {
    const response = await apiClient.get(`/demo/profile/${demoId}`);
    return response.data;
  },
  simulateFriendRequest: async (demoId) => {
    const response = await apiClient.post(`/demo/simulate-friend-request/${demoId}`);
    return response.data;
  },
  simulateChallenge: async (demoId) => {
    const response = await apiClient.post(`/demo/simulate-challenge/${demoId}`);
    return response.data;
  }
};

// ─── Job Portal & Companies ───────────────────────────────────────────────────
export const jobsService = {
  // Marketplace Overview Stats
  getMarketplaceStats: async () => {
    const response = await apiClient.get('/marketplace/stats');
    return response.data;
  },

  // Student Resume
  getMyResume: async () => {
    const response = await apiClient.get('/resume/my');
    return response.data;
  },
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Companies
  getCompanies: async (domain = '', search = '') => {
    const params = new URLSearchParams();
    if (domain) params.append('domain', domain);
    if (search) params.append('search', search);
    const response = await apiClient.get(`/companies${params.toString() ? '?' + params : ''}`);
    return response.data;
  },
  getCompany: async (id) => {
    const response = await apiClient.get(`/companies/${id}`);
    return response.data;
  },
  saveCompany: async (companyId) => {
    const response = await apiClient.post(`/companies/${companyId}/save`);
    return response.data;
  },
  getSavedCompanies: async () => {
    const response = await apiClient.get('/companies/saved');
    return response.data;
  },

  // Jobs & Internships
  getJobs: async ({ domain = '', search = '', type = '', workMode = '', companyId = null } = {}) => {
    const params = new URLSearchParams();
    if (domain) params.append('domain', domain);
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (workMode) params.append('work_mode', workMode);
    if (companyId) params.append('company_id', companyId);
    const response = await apiClient.get(`/jobs${params.toString() ? '?' + params : ''}`);
    return response.data;
  },
  getJob: async (jobId) => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },
  getJobMatch: async (jobId) => {
    const response = await apiClient.get(`/jobs/${jobId}/match`);
    return response.data;
  },
  getRecommendedJobs: async (limit = 8) => {
    const response = await apiClient.get(`/jobs/recommended?limit=${limit}`);
    return response.data;
  },

  // Saved Jobs
  getSavedJobs: async () => {
    const response = await apiClient.get('/saved-jobs');
    return response.data;
  },
  saveJob: async (jobId) => {
    const response = await apiClient.post(`/saved-jobs/${jobId}`);
    return response.data;
  },
  removeSavedJob: async (jobId) => {
    const response = await apiClient.delete(`/saved-jobs/${jobId}`);
    return response.data;
  },

  // Applications
  applyForJob: async (jobId, { resumeName = '', coverLetter = '', resumeFile = null } = {}) => {
    const formData = new FormData();
    if (resumeName) formData.append('resume_name', resumeName);
    if (coverLetter) formData.append('cover_letter', coverLetter);
    if (resumeFile) formData.append('resume_file', resumeFile);

    const response = await apiClient.post(`/jobs/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getMyApplications: async () => {
    const response = await apiClient.get('/applications/my');
    return response.data;
  },

  // AI Career Advice
  getAiExplanation: async (jobId) => {
    const response = await apiClient.post(`/jobs/${jobId}/ai-explanation`);
    return response.data;
  },

  // Recruiter
  getRecruiterJobs: async () => {
    const response = await apiClient.get('/recruiter/jobs');
    return response.data;
  },
  getRecruiterApplications: async (jobId = null) => {
    const params = jobId ? `?job_id=${jobId}` : '';
    const response = await apiClient.get(`/recruiter/applications${params}`);
    return response.data;
  },
  updateApplicationStatus: async (applicationId, status) => {
    const response = await apiClient.put(`/recruiter/applications/${applicationId}/status`, { status });
    return response.data;
  },
};

export default apiClient;

// ─── Interview Evaluation ────────────────────────────────────────────────────
export const interviewService = {
  /**
   * Evaluate a mock interview answer via Groq AI (or rule-engine fallback).
   * Throws HTTP 422 if the answer is too short.
   */
  evaluate: async ({ question, answer, idealKeyPoints, track, difficulty }) => {
    const response = await apiClient.post('/interview/evaluate', {
      question,
      answer,
      ideal_key_points: idealKeyPoints,
      track,
      difficulty,
    });
    return response.data;
  },
};

