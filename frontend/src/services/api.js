import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── JWT Interceptor ─────────────────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('careeros_token') || sessionStorage.getItem('careeros_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

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
  },
  getJobs: async () => {
    const response = await apiClient.get('/company/jobs');
    return response.data;
  },
  createJob: async (payload) => {
    const response = await apiClient.post('/company/jobs', payload);
    return response.data;
  },
  toggleJobStatus: async (jobId) => {
    const response = await apiClient.post(`/company/jobs/${jobId}/toggle-status`);
    return response.data;
  },
  getJobApplications: async (jobId) => {
    const response = await apiClient.get(`/company/jobs/${jobId}/applications`);
    return response.data;
  },
  updateApplicationStatus: async (applicationId, payload) => {
    const response = await apiClient.put(`/company/applications/${applicationId}/status`, payload);
    return response.data;
  }
};

// ─── Job Portal & Opportunities ───────────────────────────────────────────────
export const jobService = {
  getDomains: async () => {
    const response = await apiClient.get('/jobs/domains');
    return response.data;
  },
  getJobs: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.domain && params.domain !== 'All') queryParams.append('domain', params.domain);
    if (params.search) queryParams.append('search', params.search);
    if (params.employment_type && params.employment_type !== 'All') queryParams.append('employment_type', params.employment_type);
    if (params.work_arrangement && params.work_arrangement !== 'All') queryParams.append('work_arrangement', params.work_arrangement);
    if (params.eligible_only) queryParams.append('eligible_only', 'true');
    if (params.recommended_only) queryParams.append('recommended_only', 'true');
    if (params.is_demo !== undefined) queryParams.append('is_demo', params.is_demo);

    const qs = queryParams.toString();
    const url = qs ? `/jobs?${qs}` : '/jobs';
    const response = await apiClient.get(url);
    return response.data;
  },
  getJobDetail: async (jobId) => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },
  checkEligibility: async (jobId) => {
    const response = await apiClient.get(`/jobs/${jobId}/eligibility`);
    return response.data;
  },
  applyToJob: async (jobId) => {
    const response = await apiClient.post(`/jobs/${jobId}/apply`);
    return response.data;
  },
  getMyApplications: async () => {
    const response = await apiClient.get('/jobs/applications/me');
    return response.data;
  },
  withdrawApplication: async (applicationId) => {
    const response = await apiClient.post(`/jobs/applications/${applicationId}/withdraw`);
    return response.data;
  },
  getPreferences: async () => {
    const response = await apiClient.get('/jobs/preferences');
    return response.data;
  },
  updatePreferences: async (payload) => {
    const response = await apiClient.put('/jobs/preferences', payload);
    return response.data;
  }
};

export default apiClient;
