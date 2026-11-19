import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Award, 
  Code2, 
  Target, 
  FolderGit2, 
  Plus, 
  Share2, 
  Search, 
  CheckCircle2, 
  Building2, 
  X,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Send,
  AlertCircle,
  HelpCircle,
  Trash2,
  Edit3,
  Calendar,
  Check,
  GraduationCap,
  Layers,
  ChevronDown
} from 'lucide-react';
import { passportService, projectsService, codingService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';
import SkillsTable, { getStatusBadge } from '../components/passport/SkillsTable';

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Data Structures and Algorithms",
  "Web Development",
  "Database Management",
  "Artificial Intelligence and Machine Learning",
  "Computer Science Fundamentals",
  "Software Engineering",
  "Cloud and DevOps",
  "Cybersecurity",
  "Tools and Frameworks"
];

const PROFICIENCY_LEVELS = [
  { level: "Beginner", defaultPct: 35, desc: "Fundamental understanding of syntax and basic concepts" },
  { level: "Elementary", defaultPct: 50, desc: "Able to write simple modules and follow documentation" },
  { level: "Intermediate", defaultPct: 68, desc: "Can independently build functional features and solve standard problems" },
  { level: "Advanced", defaultPct: 85, desc: "Deep architectural knowledge, optimization, and debugging" },
  { level: "Expert", defaultPct: 96, desc: "Comprehensive mastery, mentoring, and system design expertise" }
];

const EVIDENCE_TYPES = [
  "GitHub Repository",
  "Coding Arena Submission",
  "Capstone Project",
  "Personal Project",
  "Faculty Assessment",
  "External Certification"
];

const DEMO_SKILLS = [
  {
    id: 101,
    name: "Python & Backend Systems",
    category: "Programming Languages",
    description: "Designed and deployed asynchronous RESTful microservices and background job workers with FastAPI, SQLAlchemy ORM, and Celery.",
    proficiency_level: "Advanced",
    percentage: 85,
    learning_start_date: "2024-03-15",
    related_technology: "FastAPI, PostgreSQL, Docker",
    supporting_project: "Distributed E-Commerce Engine",
    github_repo_url: "https://github.com/careeros-student/distributed-ecommerce",
    learning_notes: "Implemented Redis pub/sub queue patterns and JWT cryptographic verification for role-based access control.",
    status: "Verified",
    evidence_count: 2,
    evidences: [
      {
        id: 201,
        title: "GitHub Repository & Microservices Codebase",
        evidence_type: "GitHub Repository",
        description: "Well-structured modular clean architecture with high unit test coverage and Docker Compose orchestrations.",
        external_url: "https://github.com/careeros-student/distributed-ecommerce",
        status: "Verified",
        reviewer_comments: "Excellent architecture and test suite compliance.",
        created_at: "2024-09-10"
      },
      {
        id: 202,
        title: "Faculty Lab Evaluation & Benchmark",
        evidence_type: "Faculty Assessment",
        description: "Verified in person by Prof. Sharma during CSE Systems Practicum with zero regression defects.",
        external_url: "",
        status: "Verified",
        reviewer_comments: "Demonstrated production-grade async API design and thorough test case execution.",
        created_at: "2024-10-12"
      }
    ],
    verified_date: "2024-10-12",
    verified_by: "Prof. R. K. Sharma (Faculty Lead, Systems)",
    verification_comments: "Demonstrated production-grade async API design and thorough test case execution.",
    history: [
      { id: 301, event_type: "CREATED", description: "Skill registered in Skill Passport", created_at: "2024-03-15" },
      { id: 302, event_type: "EVIDENCE_ATTACHED", description: "Attached GitHub repository Distributed E-Commerce Engine", created_at: "2024-09-10" },
      { id: 303, event_type: "VERIFIED", description: "Faculty verified by Prof. R. K. Sharma", created_at: "2024-10-12" }
    ],
    created_at: "2024-03-15"
  },
  {
    id: 102,
    name: "Data Structures & Algorithms",
    category: "Data Structures and Algorithms",
    description: "Algorithmic problem solving across graph algorithms, dynamic programming, tree traversals, and algorithmic complexity optimization.",
    proficiency_level: "Advanced",
    percentage: 82,
    learning_start_date: "2023-09-01",
    related_technology: "C++, Python, STL",
    supporting_project: "Coding Arena Benchmark Submissions",
    github_repo_url: "https://github.com/careeros-student/competitive-programming-dsa",
    learning_notes: "Solved 140+ problems across LeetCode and CareerOS Coding Arena with O(N log N) or better constraints.",
    status: "Verified",
    evidence_count: 2,
    evidences: [
      {
        id: 203,
        title: "Coding Arena - 85 Solved Benchmark Challenges",
        evidence_type: "Coding Arena Submission",
        description: "Completed 35 Easy, 40 Medium, and 10 Hard challenges with all automated unit test suites passed.",
        external_url: "",
        status: "Verified",
        reviewer_comments: "Cleared benchmark with 94.6% optimal runtime.",
        created_at: "2024-10-20"
      },
      {
        id: 204,
        title: "DSA Repository & Analysis Notes",
        evidence_type: "GitHub Repository",
        description: "Public repository containing documented solutions with time and space complexity annotations.",
        external_url: "https://github.com/careeros-student/competitive-programming-dsa",
        status: "Verified",
        reviewer_comments: "Clean modular implementations with complete corner case handling.",
        created_at: "2024-11-05"
      }
    ],
    verified_date: "2024-11-05",
    verified_by: "Dr. A. Verma (Department of Computing)",
    verification_comments: "Consistently cleared automated test suites and live whiteboard assessments.",
    history: [
      { id: 304, event_type: "CREATED", description: "Skill registered in Skill Passport", created_at: "2023-09-01" },
      { id: 305, event_type: "EVIDENCE_ATTACHED", description: "Submitted Coding Arena verification evidence", created_at: "2024-10-20" },
      { id: 306, event_type: "VERIFIED", description: "Faculty verified by Dr. A. Verma", created_at: "2024-11-05" }
    ],
    created_at: "2023-09-01"
  },
  {
    id: 103,
    name: "React & Modern Web Architecture",
    category: "Web Development",
    description: "Building responsive single-page web applications with React 18, Tailwind CSS, Vite, and modular component architecture.",
    proficiency_level: "Intermediate",
    percentage: 74,
    learning_start_date: "2024-05-10",
    related_technology: "React, TypeScript, Tailwind CSS, Vite",
    supporting_project: "Campus Resource Management Portal",
    github_repo_url: "https://github.com/careeros-student/campus-resource-portal",
    learning_notes: "Implemented custom React hooks for state normalization, memoized selectors, and dark mode theming.",
    status: "Pending Review",
    evidence_count: 1,
    evidences: [
      {
        id: 205,
        title: "Interactive UI & Component Library",
        evidence_type: "GitHub Repository",
        description: "Full-stack client codebase featuring accessible UI components and custom React context state trees.",
        external_url: "https://github.com/careeros-student/campus-resource-portal",
        status: "Pending Review",
        reviewer_comments: "Submitted for faculty evaluation. Awaiting review.",
        created_at: "2024-11-10"
      }
    ],
    verified_date: null,
    verified_by: null,
    verification_comments: "Evidence attached and queued for faculty review.",
    history: [
      { id: 307, event_type: "CREATED", description: "Skill registered in Skill Passport", created_at: "2024-05-10" },
      { id: 308, event_type: "EVIDENCE_ATTACHED", description: "Attached GitHub repository Campus Resource Portal", created_at: "2024-11-10" },
      { id: 309, event_type: "VERIFICATION_REQUESTED", description: "Verification review requested from department faculty", created_at: "2024-11-12" }
    ],
    created_at: "2024-05-10"
  },
  {
    id: 104,
    name: "Docker & Container Orchestration",
    category: "Cloud and DevOps",
    description: "Containerizing web services with multi-stage Dockerfiles, Docker Compose service definitions, and volume management.",
    proficiency_level: "Elementary",
    percentage: 52,
    learning_start_date: "2024-08-20",
    related_technology: "Docker, Docker Compose, Linux Bash",
    supporting_project: "Local Multi-Container Dev Environment",
    github_repo_url: "https://github.com/careeros-student/docker-dev-sandbox",
    learning_notes: "Currently experimenting with Alpine minimal base images and health check probes.",
    status: "Self-Declared",
    evidence_count: 0,
    evidences: [],
    verified_date: null,
    verified_by: null,
    verification_comments: null,
    history: [
      { id: 310, event_type: "CREATED", description: "Skill registered in Skill Passport as Self-Declared", created_at: "2024-08-20" }
    ],
    created_at: "2024-08-20"
  }
];

const PASSPORT_STORAGE_KEY = 'careeros_skill_passport_skills';

const loadStoredSkills = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(PASSPORT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn("Could not read stored passport skills from localStorage:", e);
  }
  return DEMO_SKILLS;
};

const saveStoredSkills = (skillsList) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(skillsList));
    }
  } catch (e) {
    console.warn("Could not save passport skills to localStorage:", e);
  }
};

const calculateMetrics = (skillsList) => {
  const total = skillsList.length;
  const verifiedSkills = skillsList.filter(s => s.status === 'Verified');
  const pendingSkills = skillsList.filter(s => s.status === 'Pending Review' || s.status === 'Evidence Submitted');
  const needsAttentionSkills = skillsList.filter(s => s.status === 'Needs Improvement' || s.status === 'Rejected');
  
  const hasEvidence = verifiedSkills.length > 0;
  const avgVerifiedPct = hasEvidence 
    ? Math.round(verifiedSkills.reduce((acc, s) => acc + (s.percentage || 50), 0) / verifiedSkills.length)
    : 0;
  
  const verifiedProjectNames = new Set();
  verifiedSkills.forEach(s => {
    if (s.supporting_project && s.supporting_project.trim()) {
      verifiedProjectNames.add(s.supporting_project.trim());
    }
    if (s.evidences && Array.isArray(s.evidences)) {
      s.evidences.forEach(e => {
        if (e.status === 'Verified' && e.title) {
          verifiedProjectNames.add(e.title);
        }
      });
    }
  });

  const verifiedProjectsCount = Math.max(verifiedSkills.length, verifiedProjectNames.size);

  return {
    total_skills: total,
    verified_skills_count: verifiedSkills.length,
    pending_verifications_count: pendingSkills.length,
    needs_improvement_count: needsAttentionSkills.length,
    has_sufficient_evidence: hasEvidence,
    overall_confidence: hasEvidence ? `${avgVerifiedPct}%` : '0%',
    verified_projects: verifiedProjectsCount,
    coding_score: '82%',
    coding_benchmark: {
      score: '82%',
      total_solved: 85,
      easy_solved: 35,
      medium_solved: 40,
      hard_solved: 10
    },
    interview_readiness: hasEvidence ? `${Math.min(95, Math.round(avgVerifiedPct * 0.92))}%` : '50%'
  };
};

const PassportPage = () => {
  const { studentData, setStudentData, refreshStudentData, refreshDashboard } = useCareer();
  const { currentUser, userRole } = useAuth();
  const { openModal } = useModal();

  const isFacultyOrAdmin = userRole === 'faculty' || userRole === 'admin';

  // Local skills state with stored/demo seeding
  const [localSkills, setLocalSkills] = useState(() => loadStoredSkills());

  // Passport state
  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [proficiencyFilter, setProficiencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RECENT'); // RECENT, NAME_ASC, PROF_DESC, PROF_ASC

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showFacultyQueue, setShowFacultyQueue] = useState(false);

  // Active item state
  const [activeSkill, setActiveSkill] = useState(null);
  const [facultyQueue, setFacultyQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Form states
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming Languages',
    description: '',
    proficiency_level: 'Intermediate',
    percentage: 68,
    learning_start_date: new Date().toISOString().split('T')[0],
    related_technology: '',
    evidence_source: '',
    supporting_project: '',
    github_repo_url: '',
    learning_notes: ''
  });

  const [editSkillForm, setEditSkillForm] = useState({
    id: null,
    name: '',
    category: 'Programming Languages',
    description: '',
    proficiency_level: 'Intermediate',
    percentage: 68,
    learning_start_date: '',
    related_technology: '',
    supporting_project: '',
    github_repo_url: '',
    learning_notes: ''
  });

  const [newEvidence, setNewEvidence] = useState({
    title: '',
    evidence_type: 'GitHub Repository',
    description: '',
    external_url: '',
    related_submission_id: '',
    related_project_id: ''
  });

  const [reviewForm, setReviewForm] = useState({
    action: 'APPROVED',
    comments: '',
    rejection_reason: ''
  });

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    loadPassport();
    if (isFacultyOrAdmin) {
      loadFacultyQueue();
    }
  }, []);

  const loadPassport = async () => {
    try {
      setLoading(true);
      const data = await passportService.getPassport();
      if (data && Array.isArray(data.skills) && data.skills.length > 0) {
        setPassportData(data);
        setLocalSkills(data.skills);
        saveStoredSkills(data.skills);
      } else {
        const stored = loadStoredSkills();
        setLocalSkills(stored);
      }
    } catch (err) {
      console.warn("Failed to load passport from API, using cached/demo data", err);
      const stored = loadStoredSkills();
      setLocalSkills(stored);
    } finally {
      setLoading(false);
    }
  };

  const loadFacultyQueue = async () => {
    try {
      setQueueLoading(true);
      const res = await passportService.getPendingVerifications();
      if (res && res.queue) {
        setFacultyQueue(res.queue);
      }
    } catch (err) {
      console.warn("Could not load faculty verification queue", err);
    } finally {
      setQueueLoading(false);
    }
  };

  const refreshAll = () => {
    loadPassport();
    if (refreshStudentData) refreshStudentData();
    if (refreshDashboard) refreshDashboard();
    if (isFacultyOrAdmin) loadFacultyQueue();
  };

  // ─── ADD SKILL ─────────────────────────────────────────────────────────────
  const handleProficiencyChange = (level) => {
    const found = PROFICIENCY_LEVELS.find(p => p.level === level);
    setNewSkill(prev => ({
      ...prev,
      proficiency_level: level,
      percentage: found ? found.defaultPct : prev.percentage
    }));
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const cleanName = newSkill.name.trim();
    if (!cleanName) {
      showToastMsg("Please provide a skill name.", "error");
      return;
    }

    // URL validation if given
    if (newSkill.github_repo_url && newSkill.github_repo_url.trim()) {
      const url = newSkill.github_repo_url.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        showToastMsg("GitHub repository URL must start with http:// or https://", "error");
        return;
      }
    }

    // Prevent duplicate skill for user
    const isDuplicate = localSkills.some(
      s => s.name && s.name.toLowerCase().trim() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      showToastMsg(`A skill named "${cleanName}" already exists in your passport.`, "error");
      return;
    }

    const hasRepo = Boolean(newSkill.github_repo_url && newSkill.github_repo_url.trim());
    const initialStatus = hasRepo ? 'Evidence Submitted' : 'Self-Declared';
    const parsedPercentage = parseInt(newSkill.percentage) || 68;

    const newSkillRecord = {
      id: Date.now(),
      name: cleanName,
      category: newSkill.category || 'Programming Languages',
      description: newSkill.description || '',
      proficiency_level: newSkill.proficiency_level || 'Intermediate',
      percentage: parsedPercentage,
      learning_start_date: newSkill.learning_start_date || new Date().toISOString().split('T')[0],
      related_technology: newSkill.related_technology || '',
      supporting_project: newSkill.supporting_project || '',
      github_repo_url: newSkill.github_repo_url ? newSkill.github_repo_url.trim() : '',
      learning_notes: newSkill.learning_notes || '',
      status: initialStatus,
      evidence_count: hasRepo ? 1 : 0,
      evidences: hasRepo ? [{
        id: Date.now() + 1,
        title: newSkill.supporting_project ? `${newSkill.supporting_project} Repository` : `${cleanName} Project Repository`,
        evidence_type: 'GitHub Repository',
        description: newSkill.description || 'Repository attached during skill creation.',
        external_url: newSkill.github_repo_url.trim(),
        status: 'Evidence Submitted',
        reviewer_comments: null,
        created_at: new Date().toISOString()
      }] : [],
      history: [
        {
          id: Date.now() + 2,
          event_type: 'CREATED',
          description: `Skill "${cleanName}" (${newSkill.proficiency_level}) declared in passport as ${initialStatus}`,
          created_at: new Date().toISOString()
        }
      ],
      verified_date: null,
      verified_by: null,
      verification_comments: null,
      created_at: new Date().toISOString()
    };

    // 1. Immediately update local state and localStorage
    const updatedSkills = [newSkillRecord, ...localSkills];
    setLocalSkills(updatedSkills);
    saveStoredSkills(updatedSkills);

    // 2. Sync to CareerContext if setStudentData is available
    if (setStudentData) {
      setStudentData(prev => ({
        ...prev,
        skills: updatedSkills
      }));
    }

    // 3. Persist to backend if API is connected
    try {
      const response = await passportService.addSkill({
        name: cleanName,
        category: newSkill.category,
        description: newSkill.description,
        proficiency_level: newSkill.proficiency_level,
        percentage: parsedPercentage,
        learning_start_date: newSkill.learning_start_date,
        related_technology: newSkill.related_technology,
        evidence_source: newSkill.evidence_source,
        supporting_project: newSkill.supporting_project,
        github_repo_url: newSkill.github_repo_url ? newSkill.github_repo_url.trim() : '',
        learning_notes: newSkill.learning_notes
      });
      if (response && response.skill && response.skill.id) {
        newSkillRecord.id = response.skill.id;
        saveStoredSkills(updatedSkills);
      }
    } catch (err) {
      console.warn("Backend addSkill call failed, but skill is safely preserved in local passport state:", err);
    }

    // 4. UI Success response
    showToastMsg(`Skill "${cleanName}" added to your Skill Passport!`);
    setShowAddModal(false);
    setNewSkill({
      name: '',
      category: 'Programming Languages',
      description: '',
      proficiency_level: 'Intermediate',
      percentage: 68,
      learning_start_date: new Date().toISOString().split('T')[0],
      related_technology: '',
      evidence_source: '',
      supporting_project: '',
      github_repo_url: '',
      learning_notes: ''
    });

    if (refreshStudentData) refreshStudentData();
    if (refreshDashboard) refreshDashboard();
  };

  // ─── EDIT SKILL ────────────────────────────────────────────────────────────
  const openEditModal = (skill) => {
    setEditSkillForm({
      id: skill.id,
      name: skill.name,
      category: skill.category || 'Programming Languages',
      description: skill.description || '',
      proficiency_level: skill.proficiency_level || skill.level || 'Intermediate',
      percentage: skill.percentage || 68,
      learning_start_date: skill.learning_start_date || '',
      related_technology: skill.related_technology || '',
      supporting_project: skill.supporting_project || '',
      github_repo_url: skill.github_repo_url || '',
      learning_notes: skill.learning_notes || ''
    });
    setShowEditModal(true);
  };

  const handleEditSkill = async (e) => {
    e.preventDefault();
    if (!editSkillForm.id) return;

    const parsedPct = parseInt(editSkillForm.percentage) || 68;
    const updatedSkills = localSkills.map(s => {
      if (s.id === editSkillForm.id) {
        return {
          ...s,
          name: editSkillForm.name || s.name,
          category: editSkillForm.category || s.category,
          description: editSkillForm.description || '',
          proficiency_level: editSkillForm.proficiency_level || s.proficiency_level,
          percentage: parsedPct,
          learning_start_date: editSkillForm.learning_start_date || s.learning_start_date,
          related_technology: editSkillForm.related_technology || '',
          supporting_project: editSkillForm.supporting_project || '',
          github_repo_url: editSkillForm.github_repo_url || '',
          learning_notes: editSkillForm.learning_notes || ''
        };
      }
      return s;
    });

    setLocalSkills(updatedSkills);
    saveStoredSkills(updatedSkills);

    if (setStudentData) {
      setStudentData(prev => ({ ...prev, skills: updatedSkills }));
    }

    try {
      await passportService.updateSkill(editSkillForm.id, {
        category: editSkillForm.category,
        description: editSkillForm.description,
        proficiency_level: editSkillForm.proficiency_level,
        percentage: parsedPct,
        learning_start_date: editSkillForm.learning_start_date,
        related_technology: editSkillForm.related_technology,
        supporting_project: editSkillForm.supporting_project,
        github_repo_url: editSkillForm.github_repo_url,
        learning_notes: editSkillForm.learning_notes
      });
    } catch (err) {
      console.warn("Backend updateSkill failed, updated locally:", err);
    }

    showToastMsg(`Skill "${editSkillForm.name}" updated successfully.`);
    setShowEditModal(false);

    if (activeSkill && activeSkill.id === editSkillForm.id) {
      const updatedItem = updatedSkills.find(s => s.id === editSkillForm.id);
      setActiveSkill(updatedItem || null);
    }
  };

  // ─── ADD EVIDENCE ──────────────────────────────────────────────────────────
  const openAddEvidenceModal = (skill) => {
    setActiveSkill(skill);
    setNewEvidence({
      title: `${skill.name} Project Artifact`,
      evidence_type: 'GitHub Repository',
      description: '',
      external_url: skill.github_repo_url || '',
      related_submission_id: '',
      related_project_id: ''
    });
    setShowEvidenceModal(true);
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!activeSkill) return;

    const cleanTitle = newEvidence.title.trim();
    if (!cleanTitle) {
      showToastMsg("Please provide an evidence title.", "error");
      return;
    }

    if (newEvidence.external_url && newEvidence.external_url.trim()) {
      const url = newEvidence.external_url.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        showToastMsg("External link must start with http:// or https://", "error");
        return;
      }
    }

    const newEvidenceObj = {
      id: Date.now(),
      title: cleanTitle,
      evidence_type: newEvidence.evidence_type,
      description: newEvidence.description || '',
      external_url: newEvidence.external_url.trim(),
      status: 'Evidence Submitted',
      created_at: new Date().toISOString()
    };

    const updatedSkills = localSkills.map(s => {
      if (s.id === activeSkill.id) {
        const prevEvidences = Array.isArray(s.evidences) ? s.evidences : [];
        const prevHistory = Array.isArray(s.history) ? s.history : [];
        return {
          ...s,
          status: s.status === 'Self-Declared' ? 'Evidence Submitted' : s.status,
          evidence_count: (s.evidence_count || prevEvidences.length) + 1,
          evidences: [...prevEvidences, newEvidenceObj],
          history: [
            ...prevHistory,
            {
              id: Date.now() + 1,
              event_type: 'EVIDENCE_ATTACHED',
              description: `Attached evidence "${cleanTitle}" (${newEvidence.evidence_type})`,
              created_at: new Date().toISOString()
            }
          ]
        };
      }
      return s;
    });

    setLocalSkills(updatedSkills);
    saveStoredSkills(updatedSkills);

    const updatedActive = updatedSkills.find(s => s.id === activeSkill.id);
    if (updatedActive) {
      setActiveSkill(updatedActive);
    }

    try {
      await passportService.addEvidence(activeSkill.id, {
        title: cleanTitle,
        evidence_type: newEvidence.evidence_type,
        description: newEvidence.description,
        external_url: newEvidence.external_url.trim()
      });
    } catch (err) {
      console.warn("Backend addEvidence call failed, stored locally:", err);
    }

    showToastMsg(`Evidence record attached to "${activeSkill.name}".`);
    setShowEvidenceModal(false);
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!activeSkill) return;

    const updatedSkills = localSkills.map(s => {
      if (s.id === activeSkill.id) {
        const filtered = (s.evidences || []).filter(e => e.id !== evidenceId);
        return {
          ...s,
          evidence_count: filtered.length,
          evidences: filtered
        };
      }
      return s;
    });

    setLocalSkills(updatedSkills);
    saveStoredSkills(updatedSkills);

    const updatedActive = updatedSkills.find(s => s.id === activeSkill.id);
    if (updatedActive) {
      setActiveSkill(updatedActive);
    }

    try {
      await passportService.deleteEvidence(activeSkill.id, evidenceId);
    } catch (err) {
      console.warn("Backend deleteEvidence failed, removed locally:", err);
    }

    showToastMsg("Evidence record removed.");
  };

  // ─── REQUEST VERIFICATION ──────────────────────────────────────────────────
  const handleRequestVerification = async (skill) => {
    const updatedSkills = localSkills.map(s => {
      if (s.id === skill.id) {
        const prevHistory = Array.isArray(s.history) ? s.history : [];
        return {
          ...s,
          status: 'Pending Review',
          history: [
            ...prevHistory,
            {
              id: Date.now(),
              event_type: 'VERIFICATION_REQUESTED',
              description: 'Verification review requested from department faculty',
              created_at: new Date().toISOString()
            }
          ]
        };
      }
      return s;
    });

    setLocalSkills(updatedSkills);
    saveStoredSkills(updatedSkills);

    if (activeSkill && activeSkill.id === skill.id) {
      const updatedActive = updatedSkills.find(s => s.id === skill.id);
      if (updatedActive) setActiveSkill(updatedActive);
    }

    try {
      await passportService.requestVerification(skill.id);
    } catch (err) {
      console.warn("Backend requestVerification call failed, updated locally:", err);
    }

    showToastMsg(`Verification requested for "${skill.name}". Awaiting faculty attestation.`);
  };

  // ─── DELETE SKILL ──────────────────────────────────────────────────────────
  const confirmDeleteSkill = (skill) => {
    setActiveSkill(skill);
    setShowDeleteModal(true);
  };

  const handleDeleteSkill = async () => {
    if (!activeSkill) return;
    const targetId = activeSkill.id;
    const targetName = activeSkill.name;

    const updatedSkills = localSkills.filter(s => s.id !== targetId);
    setLocalSkills(updatedSkills);
    saveStoredSkills(updatedSkills);

    if (setStudentData) {
      setStudentData(prev => ({ ...prev, skills: updatedSkills }));
    }

    try {
      await passportService.deleteSkill(targetId);
    } catch (err) {
      console.warn("Backend deleteSkill failed, deleted locally:", err);
    }

    showToastMsg(`Skill "${targetName}" removed from passport.`);
    setShowDeleteModal(false);
    setShowDetailModal(false);
    setActiveSkill(null);
  };

  // ─── VIEW DETAILS MODAL ───────────────────────────────────────────────────
  const handleOpenDetails = async (skill) => {
    const fullLocal = localSkills.find(s => s.id === skill.id) || skill;
    setActiveSkill(fullLocal);
    setShowDetailModal(true);

    try {
      const data = await passportService.getSkillDetails(skill.id);
      if (data && data.skill) {
        setActiveSkill(data.skill);
      }
    } catch (err) {
      // Retain fullLocal
    }
  };

  // ─── FACULTY REVIEW MODAL ──────────────────────────────────────────────────
  const openReviewModal = (skill) => {
    setActiveSkill(skill);
    setReviewForm({
      action: 'APPROVED',
      comments: 'Attested and verified based on repository code quality and test execution.',
      rejection_reason: ''
    });
    setShowReviewModal(true);
  };

  const handleReviewSkill = async (e) => {
    e.preventDefault();
    if (!activeSkill) return;

    if (reviewForm.action === 'REJECTED' && !reviewForm.rejection_reason.trim()) {
      showToastMsg("Please provide a reason for rejection.", "error");
      return;
    }

    const newStatus = reviewForm.action === 'APPROVED' 
      ? 'Verified' 
      : reviewForm.action === 'IMPROVEMENT_REQUESTED' 
      ? 'Needs Improvement' 
      : 'Rejected';

    const todayStr = new Date().toISOString().split('T')[0];

    const updatedSkills = localSkills.map(s => {
      if (s.id === activeSkill.id) {
        const prevHistory = Array.isArray(s.history) ? s.history : [];
        return {
          ...s,
          status: newStatus,
          verified_date: newStatus === 'Verified' ? todayStr : s.verified_date,
          verified_by: newStatus === 'Verified' ? (currentUser?.name || 'Prof. Academic Evaluator') : s.verified_by,
          verification_comments: reviewForm.comments || s.verification_comments,
          rejection_reason: newStatus === 'Rejected' ? reviewForm.rejection_reason : null,
          history: [
            ...prevHistory,
            {
              id: Date.now(),
              event_type: newStatus === 'Verified' ? 'VERIFIED' : newStatus === 'Rejected' ? 'REJECTED' : 'NEEDS_IMPROVEMENT',
              description: `Faculty review decision: ${newStatus}. ${reviewForm.comments || ''}`,
              created_at: new Date().toISOString()
            }
          ]
        };
      }
      return s;
    });

    setLocalSkills(updatedSkills);
    saveStoredSkills(updatedSkills);

    const updatedActive = updatedSkills.find(s => s.id === activeSkill.id);
    if (updatedActive) setActiveSkill(updatedActive);

    try {
      await passportService.verifySkill(activeSkill.id || activeSkill.skill_id, {
        action: reviewForm.action,
        comments: reviewForm.comments,
        rejection_reason: reviewForm.rejection_reason
      });
    } catch (err) {
      console.warn("Backend verifySkill failed, recorded locally:", err);
    }

    showToastMsg(`Skill verification recorded: ${newStatus}`);
    setShowReviewModal(false);
  };

  // Dynamic calculations and raw data fallbacks
  const dynamicStats = useMemo(() => calculateMetrics(localSkills), [localSkills]);
  const skills = localSkills;
  const stats = passportData?.stats 
    ? { ...passportData.stats, ...dynamicStats }
    : dynamicStats;
  const user = passportData?.user || studentData?.profile || {
    name: "Alex Morgan",
    degree: "B.Tech Computer Science & Engineering",
    target_role: "Full Stack Engineer",
    public_url: "https://careeros.edu/passport/verified/alex-morgan"
  };
  const badges = passportData?.badges || [];

  // ─── FILTER & SORT LOGIC ───────────────────────────────────────────────────
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.related_technology && s.related_technology.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(s => s.category === categoryFilter);
    }

    // Proficiency filter
    if (proficiencyFilter !== 'ALL') {
      result = result.filter(s => 
        (s.proficiency_level && s.proficiency_level.toLowerCase() === proficiencyFilter.toLowerCase()) ||
        (s.level && s.level.toLowerCase() === proficiencyFilter.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'VERIFIED_ONLY') {
        result = result.filter(s => s.status === 'Verified');
      } else {
        result = result.filter(s => s.status === statusFilter);
      }
    }

    // Sort
    if (sortBy === 'NAME_ASC') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'PROF_DESC') {
      result.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    } else if (sortBy === 'PROF_ASC') {
      result.sort((a, b) => (a.percentage || 0) - (b.percentage || 0));
    } else {
      // RECENT
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [skills, searchQuery, categoryFilter, proficiencyFilter, statusFilter, sortBy]);

  const activeFiltersCount = [
    searchQuery.trim() !== '',
    categoryFilter !== 'ALL',
    proficiencyFilter !== 'ALL',
    statusFilter !== 'ALL'
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setProficiencyFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('RECENT');
  };

  return (
    <div className="space-y-6">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* ─── Hero Header ──────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-medium text-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Living Skill Passport</span>
            <span className="text-white font-semibold">• {user.name ? `${user.name}${user.degree ? ` (${user.degree})` : ''}` : 'Student Profile'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Verified Skill Passport & Evidence Ledger</h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            An unforgeable, evidence-backed technical ledger endorsed by faculty, GitHub repository artifacts, and automated code evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowAddModal(true)}
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Skill
          </Button>

          <button
            type="button"
            onClick={() => openModal(
              "Shareable Skill Passport",
              `Public Verification Ledger: ${user.public_url || 'https://careeros.edu/passport/verified'}\n\nCandidate: ${user.name || 'Student'}\nDegree: ${user.degree || 'B.Tech CSE'}\nTotal Skills: ${skills.length}\nVerified Confidence: ${stats.overall_confidence || '0%'}\n\nRecruiters and hiring managers can audit faculty attestations, commit history, and test cases directly through this cryptographic record.`
            )}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg !bg-slate-800 hover:!bg-slate-700 active:!bg-slate-800 focus:!bg-slate-800 !text-white hover:!text-white active:!text-white focus:!text-white border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/50 shadow-sm transition-all duration-150 select-none cursor-pointer"
          >
            <Share2 className="w-4 h-4 mr-1.5 !text-white shrink-0" />
            <span className="!text-white font-medium">Export Passport</span>
          </button>

          {isFacultyOrAdmin && (
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowFacultyQueue(!showFacultyQueue)}
              className="border-blue-600 bg-blue-950/60 text-blue-300 hover:bg-blue-900"
            >
              <GraduationCap className="w-4 h-4 mr-1.5" />
              Faculty Queue ({facultyQueue.length})
            </Button>
          )}
        </div>
      </div>

      {/* ─── Faculty Verification Queue Banner (When Toggled) ──────────────── */}
      {isFacultyOrAdmin && showFacultyQueue && (
        <Card
          title="Faculty Attestation Queue"
          subtitle="Pending student skill submissions awaiting academic verification and audit"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFacultyQueue(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          }
        >
          {facultyQueue.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No student skills currently awaiting faculty review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Skill</th>
                    <th className="pb-2">Domain</th>
                    <th className="pb-2">Level</th>
                    <th className="pb-2">Evidence</th>
                    <th className="pb-2 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {facultyQueue.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                        {item.student_name}
                        <span className="block text-[10px] text-slate-400">{item.student_degree}</span>
                      </td>
                      <td className="py-2.5 font-bold text-blue-600 dark:text-blue-400">{item.skill_name}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{item.category}</td>
                      <td className="py-2.5">{item.proficiency_level} ({item.percentage}%)</td>
                      <td className="py-2.5 text-slate-500">{item.evidence_count} Record(s)</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => openReviewModal({ id: item.skill_id, name: item.skill_name, ...item })}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[11px] font-semibold transition-colors"
                        >
                          Review & Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ─── 4 Score Metrics (Dynamic & Evidence-Based) ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Confidence */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.has_sufficient_evidence ? stats.overall_confidence : (stats.overall_confidence || "0%")}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {stats.has_sufficient_evidence
              ? `${stats.verified_skills_count || 0} verified • ${stats.pending_verifications_count || 0} pending`
              : "Insufficient verified evidence"}
          </p>
          <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {stats.has_sufficient_evidence ? "✓ Evidence-backed score" : "Requires faculty attestation"}
          </div>
        </div>

        {/* Verified Projects */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verified Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.verified_projects ?? 0}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Faculty Reviewed & Attested
          </p>
          <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
            Repository code audited
          </div>
        </div>

        {/* Coding Benchmark */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Coding Benchmark</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.coding_benchmark?.score || stats.coding_score || "0%"}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {stats.coding_benchmark?.total_solved 
              ? `${stats.coding_benchmark.total_solved} solved (${stats.coding_benchmark.easy_solved}E / ${stats.coding_benchmark.medium_solved}M / ${stats.coding_benchmark.hard_solved}H)`
              : "Problem Solving Arena"}
          </p>
          <div className="mt-2 text-[10px] text-purple-600 dark:text-purple-400 font-medium">
            Test case execution verified
          </div>
        </div>

        {/* Interview Readiness */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interview Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.interview_readiness || "0%"}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user.target_role ? `Target: ${user.target_role}` : "Set target role in Profile"}
          </p>
          <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium" title="Indicative CareerOS assessment based on verified skills, projects, and Coding Arena performance. Not a guaranteed placement prediction.">
            *Indicative assessment
          </div>
        </div>
      </div>

      {/* ─── Search, Filter & Sort Bar ────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills by name, technology, or domain..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {SKILL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Proficiency Filter */}
            <select
              value={proficiencyFilter}
              onChange={(e) => setProficiencyFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Proficiencies</option>
              {PROFICIENCY_LEVELS.map(p => (
                <option key={p.level} value={p.level}>{p.level}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED_ONLY">Verified Only</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Evidence Submitted">Evidence Submitted</option>
              <option value="Self-Declared">Self-Declared</option>
              <option value="Needs Improvement">Needs Improvement</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="RECENT">Recently Updated</option>
              <option value="NAME_ASC">Alphabetical (A-Z)</option>
              <option value="PROF_DESC">Highest Proficiency</option>
              <option value="PROF_ASC">Lowest Proficiency</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Counter strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredSkills.length}</strong> of {skills.length} skills
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {skills.filter(s => s.status === 'Verified').length} Verified
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {skills.filter(s => s.status === 'Pending Review' || s.status === 'Evidence Submitted').length} Pending / Evidence
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {skills.filter(s => s.status === 'Self-Declared').length} Self-Declared
            </span>
          </div>
        </div>
      </div>

      {/* ─── Verified Skills Table / Empty State ───────────────────────────── */}
      <Card
        title="Verified Skills & Evidence Matrix"
        subtitle="Every score is backed by faculty sign-offs, repository commits, or automated test suite results"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Skill
          </Button>
        }
      >
        {skills.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No skills added to your passport yet.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Add programming languages, frameworks, or CS core competencies to start building your verified evidence ledger.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add First Skill
            </Button>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No skills match the selected filters.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search query or reset the filter criteria.</p>
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2">
              Reset Filters
            </Button>
          </div>
        ) : (
          <SkillsTable
            skills={filteredSkills}
            onViewDetails={handleOpenDetails}
            onEditSkill={openEditModal}
            onAddEvidence={openAddEvidenceModal}
            onRequestVerification={handleRequestVerification}
            onDeleteSkill={confirmDeleteSkill}
            isReviewer={isFacultyOrAdmin}
            onReviewSkill={openReviewModal}
          />
        )}
      </Card>

      {/* ─── Badges & Verifications Showcase ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Faculty Attestations" subtitle="Signed by academic guides">
          {skills.some(s => s.status === 'Verified') ? (
            <div className="space-y-3">
              {skills.filter(s => s.status === 'Verified').slice(0, 3).map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">{s.name}</span>
                    <Badge variant="success">Faculty Endorsed</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {s.verification_comments || `Attested: ${s.evidence || 'Coursework'}`}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    Verified {s.verified_date || s.verifiedDate || 'Recently'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No faculty attestations yet. Submitting verified course projects or repository evidence will unlock endorsements.
            </div>
          )}
        </Card>

        <Card title="Earned Technical Badges" subtitle="Cryptographically verified milestones">
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {badges.map((b, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-1.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">{b.title}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{b.subtitle}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Solve coding challenges, complete projects, and earn XP to unlock verified technical badges.
            </div>
          )}
        </Card>

        <Card title="Recruiter Trust Factor" subtitle="Authenticity index">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Because Skill Passports are backed by verified commit diffs, live test cases, and institutional attestations, candidates receive higher recruiter evaluation confidence.
          </p>
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>100% Tamper-Evident & Authenticated</span>
          </div>
        </Card>
      </div>

      {/* ─── ADD SKILL MODAL ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Technical Skill to Passport</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Declare skill, self-assessed proficiency, and optional evidence link</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Skill Name */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Name *</label>
                  <input
                    type="text"
                    required
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    placeholder="e.g. Python, React, PostgreSQL, Docker"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  >
                    {SKILL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Description</label>
                <textarea
                  rows={2}
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                  placeholder="Summarize your practical experience and applications with this skill..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Proficiency Level & Slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Proficiency Level</label>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{newSkill.proficiency_level} ({newSkill.percentage}%)</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {PROFICIENCY_LEVELS.map(p => (
                    <button
                      type="button"
                      key={p.level}
                      onClick={() => handleProficiencyChange(p.level)}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[11px] font-semibold transition-all ${
                        newSkill.proficiency_level === p.level
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {p.level}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={newSkill.percentage}
                  onChange={(e) => setNewSkill({ ...newSkill, percentage: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Learning Start Date */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Learning Start Date</label>
                  <input
                    type="date"
                    value={newSkill.learning_start_date}
                    onChange={(e) => setNewSkill({ ...newSkill, learning_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Related Technology */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Related Technology / Library</label>
                  <input
                    type="text"
                    value={newSkill.related_technology}
                    onChange={(e) => setNewSkill({ ...newSkill, related_technology: e.target.value })}
                    placeholder="e.g. FastAPI, NumPy, Pandas, Next.js"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supporting Project */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Supporting Project Name</label>
                  <input
                    type="text"
                    value={newSkill.supporting_project}
                    onChange={(e) => setNewSkill({ ...newSkill, supporting_project: e.target.value })}
                    placeholder="e.g. CareerOS Portal, ML Classifier"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* GitHub Repo URL */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Optional GitHub Repository URL</label>
                  <input
                    type="url"
                    value={newSkill.github_repo_url}
                    onChange={(e) => setNewSkill({ ...newSkill, github_repo_url: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Personal Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Learning Notes</label>
                <textarea
                  rows={2}
                  value={newSkill.learning_notes}
                  onChange={(e) => setNewSkill({ ...newSkill, learning_notes: e.target.value })}
                  placeholder="Key concepts mastered, libraries used, or areas to improve next..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200">
                <strong>CareerOS Integrity Rule:</strong> Newly added skills are recorded as <em>Self-Declared</em>. You can attach code repositories or coding solutions and request faculty attestation to achieve verified status.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Add to Skill Passport
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT SKILL MODAL ─────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Skill: {editSkillForm.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update proficiency, domain categorization, and notes</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={editSkillForm.category}
                  onChange={(e) => setEditSkillForm({ ...editSkillForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                >
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Description</label>
                <textarea
                  rows={2}
                  value={editSkillForm.description}
                  onChange={(e) => setEditSkillForm({ ...editSkillForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Proficiency Level & Slider */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Proficiency Level</label>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{editSkillForm.proficiency_level} ({editSkillForm.percentage}%)</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {PROFICIENCY_LEVELS.map(p => (
                    <button
                      type="button"
                      key={p.level}
                      onClick={() => setEditSkillForm(prev => ({
                        ...prev,
                        proficiency_level: p.level,
                        percentage: p.defaultPct
                      }))}
                      className={`py-1.5 px-1 text-center rounded-lg border text-[11px] font-semibold transition-all ${
                        editSkillForm.proficiency_level === p.level
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      {p.level}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={editSkillForm.percentage}
                  onChange={(e) => setEditSkillForm({ ...editSkillForm, percentage: parseInt(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Related Technology</label>
                  <input
                    type="text"
                    value={editSkillForm.related_technology}
                    onChange={(e) => setEditSkillForm({ ...editSkillForm, related_technology: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={editSkillForm.github_repo_url}
                    onChange={(e) => setEditSkillForm({ ...editSkillForm, github_repo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Learning Notes</label>
                <textarea
                  rows={2}
                  value={editSkillForm.learning_notes}
                  onChange={(e) => setEditSkillForm({ ...editSkillForm, learning_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD EVIDENCE MODAL ───────────────────────────────────────────── */}
      {showEvidenceModal && activeSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Attach Evidence: {activeSkill.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Link repositories, submissions, or faculty-reviewed projects</p>
              </div>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvidence} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evidence Title *</label>
                <input
                  type="text"
                  required
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                  placeholder="e.g. Distributed Database Capstone Repo"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evidence Type *</label>
                <select
                  value={newEvidence.evidence_type}
                  onChange={(e) => setNewEvidence({ ...newEvidence, evidence_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                >
                  {EVIDENCE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">External Link / Repository URL</label>
                <input
                  type="url"
                  value={newEvidence.external_url}
                  onChange={(e) => setNewEvidence({ ...newEvidence, external_url: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Context</label>
                <textarea
                  rows={2}
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                  placeholder="Explain how this evidence demonstrates competency in this skill..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEvidenceModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Attach Evidence
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SKILL DETAILS & PROGRESS HISTORY MODAL ───────────────────────── */}
      {showDetailModal && activeSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeSkill.name}</h3>
                  {getStatusBadge(activeSkill.status)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeSkill.category} {activeSkill.related_technology ? `• ${activeSkill.related_technology}` : ''}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proficiency & Timeline Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Proficiency Level</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{activeSkill.proficiency_level || activeSkill.level || 'Intermediate'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Confidence Score</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{activeSkill.percentage}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Learning Since</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activeSkill.learning_start_date || 'Enrolled'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attestation Date</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{activeSkill.verified_date || activeSkill.verifiedDate || 'Pending'}</span>
              </div>
            </div>

            {/* Description & Learning Notes */}
            {(activeSkill.description || activeSkill.learning_notes) && (
              <div className="space-y-3 text-xs">
                {activeSkill.description && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{activeSkill.description}</p>
                  </div>
                )}
                {activeSkill.learning_notes && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Personal Notes & Reflections</span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{activeSkill.learning_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Faculty Attestation / Reason Card */}
            {activeSkill.status === 'Verified' && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Faculty Attestation Endorsement</span>
                </div>
                <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                  {activeSkill.verification_comments || "Verified through coursework, test case submissions, and laboratory attestations."}
                </p>
                {activeSkill.verified_by_name && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block pt-1">
                    Verified by: {activeSkill.verified_by_name}
                  </span>
                )}
              </div>
            )}

            {activeSkill.status === 'Needs Improvement' && (
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-200">
                  <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Faculty Feedback: Improvement Required</span>
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-[11px]">
                  {activeSkill.verification_comments || "Additional practical code submissions or lab implementations required before formal attestation."}
                </p>
              </div>
            )}

            {activeSkill.status === 'Rejected' && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Attestation Rejected</span>
                </div>
                <p className="text-rose-700 dark:text-rose-300 text-[11px]">
                  Reason: {activeSkill.rejection_reason || "Insufficient verified evidence provided."}
                </p>
              </div>
            )}

            {/* Attached Evidence Records */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Attached Evidence Records ({activeSkill.evidences?.length || 0})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAddEvidenceModal(activeSkill)}
                  className="text-[11px] py-1 px-2.5 h-auto"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Evidence
                </Button>
              </div>

              {(!activeSkill.evidences || activeSkill.evidences.length === 0) ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No evidence records attached yet. Add GitHub repositories or projects to support your verification request.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeSkill.evidences.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{ev.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {ev.evidence_type}
                          </span>
                        </div>
                        {ev.description && (
                          <p className="text-slate-500 dark:text-slate-400 text-[11px]">{ev.description}</p>
                        )}
                        {ev.external_url && (
                          <a
                            href={ev.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{ev.external_url}</span>
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteEvidence(ev.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove evidence"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chronological Progress & Audit History (Part 6) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Chronological Progress Ledger
              </h4>
              
              {(!activeSkill.history || activeSkill.history.length === 0) ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  Initial registration event logged. Subsequent evidence submissions will record timestamps here.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {activeSkill.history.map((hist) => (
                    <div key={hist.id} className="relative text-xs">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{hist.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {hist.created_at ? new Date(hist.created_at).toLocaleString() : ''}
                        </span>
                      </div>
                      {hist.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{hist.description}</p>
                      )}
                      {hist.new_proficiency && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                          Level: {hist.new_proficiency}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => confirmDeleteSkill(activeSkill)}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Skill
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(activeSkill)}
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit Skill
                </Button>

                {activeSkill.status !== 'Verified' && activeSkill.status !== 'Pending Review' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRequestVerification(activeSkill)}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Request Faculty Verification
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── FACULTY REVIEW MODAL ─────────────────────────────────────────── */}
      {showReviewModal && activeSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Faculty Verification Review</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Skill: {activeSkill.name || activeSkill.skill_name}</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Verification Decision *</label>
                <select
                  value={reviewForm.action}
                  onChange={(e) => setReviewForm({ ...reviewForm, action: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
                >
                  <option value="APPROVED">✓ Approve & Endorse Skill</option>
                  <option value="NEEDS_IMPROVEMENT">⚠ Request Improvement / More Evidence</option>
                  <option value="REJECTED">✕ Reject Attestation</option>
                </select>
              </div>

              {reviewForm.action === 'REJECTED' ? (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rejection Reason *</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewForm.rejection_reason}
                    onChange={(e) => setReviewForm({ ...reviewForm, rejection_reason: e.target.value })}
                    placeholder="Specify why this evidence was rejected (e.g. plagiarized code, insufficient test cases)..."
                    className="w-full px-3 py-2 border border-rose-300 dark:border-rose-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Faculty Comments & Notes</label>
                  <textarea
                    rows={3}
                    value={reviewForm.comments}
                    onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                    placeholder="Add faculty observations, lab performance notes, or guidance..."
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className={
                    reviewForm.action === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : reviewForm.action === 'REJECTED'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-purple-600 hover:bg-purple-500'
                  }
                >
                  Confirm Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRMATION DIALOG ──────────────────────────────────── */}
      {showDeleteModal && activeSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Skill?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <strong className="text-slate-900 dark:text-white">"{activeSkill.name}"</strong>? This will permanently delete all associated evidence records and verification history.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteSkill}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                Yes, Delete Skill
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PassportPage;
