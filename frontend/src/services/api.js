import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

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
  }
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

export default apiClient;
