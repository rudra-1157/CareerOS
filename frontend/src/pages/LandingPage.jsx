import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Code2,
  GitBranch,
  Target,
  Map,
  FileText,
  MessageSquare,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Sun,
  Moon,
  Layers,
  GraduationCap,
  Sparkles,
  Terminal,
  Cpu,
  BarChart3,
  ExternalLink,
  Palette
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const modulesList = [
  {
    id: 'mentor',
    title: 'AI Learning Mentor',
    subtitle: 'Institutional syllabus-aware assistant',
    desc: 'Provides structured guidance on core computer science subjects, viva preparation, and concept clarification powered by curated academic resources.',
    icon: Compass,
    stage: '1st Year: Learn',
    status: 'Operational'
  },
  {
    id: 'coding',
    title: 'Coding Arena & XP',
    subtitle: 'Algorithmic problem solving and peer challenges',
    desc: 'Interactive code editor with sandboxed execution, test cases, automated runtime analysis, and XP tracking across batch leaderboards.',
    icon: Code2,
    stage: '2nd Year: Practice',
    status: 'Operational'
  },
  {
    id: 'github',
    title: 'GitHub Intelligence',
    subtitle: 'Verifiable open-source engineering trail',
    desc: 'Analyzes public repository contributions, code architecture, commit frequency, and language breakdowns to build evidence for recruiters.',
    icon: GitBranch,
    stage: '2nd Year: Build',
    status: 'Operational'
  },
  {
    id: 'skillgap',
    title: 'Skill-Gap Analysis',
    subtitle: 'Target role benchmark comparison',
    desc: 'Compares your current verified competencies against target job roles (e.g. AI/ML Engineer, Full-Stack Developer) and flags missing requirements.',
    icon: Target,
    stage: '2nd Year: Build',
    status: 'Operational'
  },
  {
    id: 'roadmap',
    title: 'Personalized Roadmaps',
    subtitle: 'Semester-by-semester milestone timeline',
    desc: 'Generates structured learning paths tailored to your career goals, breaking down multi-month objectives into actionable weekly milestones.',
    icon: Map,
    stage: '2nd Year: Build',
    status: 'Operational'
  },
  {
    id: 'resume',
    title: 'AI Resume Builder & ATS Diagnostic',
    subtitle: 'Keyword benchmark and hiring filter diagnostics',
    desc: 'Parses resume files to benchmark technical keyword density, formatting readability, and alignment with campus recruitment ATS standards.',
    icon: FileText,
    stage: '3rd Year: Get Placed',
    status: 'Operational'
  },
  {
    id: 'interview',
    title: 'AI Mock Interviews',
    subtitle: 'Technical and behavioral question practice',
    desc: 'Simulated interview sessions offering domain-specific technical questions, algorithmic problem prompts, and structured answer guidance.',
    icon: MessageSquare,
    stage: '3rd Year: Get Placed',
    status: 'Operational'
  },
  {
    id: 'passport',
    title: 'Verified Skill Badges & Passport',
    subtitle: 'Faculty-attested competency dossier',
    desc: 'Consolidates verified skills, completed coursework, coding benchmarks, and capstone project attestations into a tamper-evident student profile.',
    icon: ShieldCheck,
    stage: '3rd Year: Get Placed',
    status: 'Operational'
  },
  {
    id: 'company',
    title: 'Company Dashboard',
    subtitle: 'Recruiter talent discovery interface',
    desc: 'Allows verified campus recruiters to search candidate profiles filtered by demonstrable evidence, coding benchmarks, and faculty attestations.',
    icon: Building2,
    stage: 'Placement',
    status: 'Operational'
  }
];

const studentJourney = [
  {
    year: '1st Year',
    title: 'Foundational Learning',
    focus: 'Master Core Concepts',
    description: 'Establish programming fundamentals, discrete mathematics, and systems architecture. Access institutional lecture materials and consult the AI Learning Mentor for curriculum questions.',
    deliverables: ['C/C++ & Python Core', 'Data Structures & Algorithms', 'Institutional Viva Preparation']
  },
  {
    year: '2nd Year',
    title: 'Skill Construction & Code Evidence',
    focus: 'Build Verifiable Work',
    description: 'Solve daily algorithmic challenges in the Coding Arena, build and open-source full-stack projects on GitHub, and generate personalized roadmaps based on skill-gap diagnostics.',
    deliverables: ['Coding Arena XP & Leaderboard Rank', 'Public GitHub Repositories', 'Identified Skill Gaps Bridged']
  },
  {
    year: '3rd Year',
    title: 'Placement Preparation & Verification',
    focus: 'Prepare & Get Hired',
    description: 'Benchmark resumes against ATS scanners, practice with AI Mock Interviews, secure faculty verification for the Skill Passport, and connect with campus recruiters.',
    deliverables: ['ATS Resume Diagnostic Score', 'Faculty-Verified Skill Passport', 'Placement Drive Applications']
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const { theme, cycleTheme, availableThemes } = useTheme();
  const [activePreviewTab, setActivePreviewTab] = useState('dashboard');

  const currentThemeObj = availableThemes?.find(t => t.id === theme) || {
    name: theme === 'midnight-dark' ? 'Midnight Dark' : theme === 'mist-steel' ? 'Mist Blue + Steel Blue' : 'Deep Teal + Aqua'
  };

  const handlePortalAccess = () => {
    if (isAuthenticated) {
      if (userRole === 'faculty') navigate('/faculty');
      else if (userRole === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } else {
      navigate('/login?redirect=/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-main-bg)] text-[var(--color-text-main)] transition-colors duration-200">
      
      {/* ─── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-header-bg)] backdrop-blur-md border-b border-[var(--color-card-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Academic Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-accent)] flex items-center justify-center text-white shadow-sm font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[var(--color-text-main)]">
                  Career<span className="text-[var(--color-primary-accent)]">OS</span>
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)] -mt-1 hidden sm:inline">
                  MIT-ADT University
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-block w-px h-5 bg-[var(--color-card-border)] mx-1" />
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-[var(--color-secondary-bg)] text-[var(--color-text-secondary)]">
              Department of Computer Science & Engineering
            </span>
          </div>

          {/* Quick Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[var(--color-text-secondary)]">
            <a href="#overview" className="hover:text-[var(--color-primary-accent)] transition-colors">
              Platform Overview
            </a>
            <a href="#journey" className="hover:text-[var(--color-primary-accent)] transition-colors">
              Student Journey
            </a>
            <a href="#modules" className="hover:text-[var(--color-primary-accent)] transition-colors">
              The 9 Modules
            </a>
            <a href="#architecture" className="hover:text-[var(--color-primary-accent)] transition-colors">
              System Architecture
            </a>
          </nav>

          {/* Action CTAs & Three-Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={cycleTheme}
              aria-label="Cycle between the 3 official themes"
              title={`Active Theme: ${currentThemeObj.name} (Click to switch)`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card-bg)] text-[var(--color-text-main)] hover:bg-[var(--color-secondary-bg)] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--color-primary-accent)]" />
              <span className="hidden sm:inline">{currentThemeObj.name}</span>
            </button>

            {isAuthenticated ? (
              <Button variant="primary" size="sm" onClick={handlePortalAccess}>
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Button variant="primary" size="sm" onClick={handlePortalAccess}>
                  Go to Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section with High-Resolution Illustration ────────────────── */}
      <section id="overview" className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[var(--color-card-border)] overflow-hidden">
        
        {/* Layer 1: Professional Background Illustration (Optimized WebP / JPG) */}
        <picture className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
          <source srcSet="/hero-illustration.webp" type="image/webp" />
          <img
            src="/hero-illustration.jpg"
            alt="Technology, programming and university campus illustration"
            className="w-full h-full object-cover object-center opacity-30 dark:opacity-20 transition-opacity duration-300"
            loading="eager"
          />
        </picture>

        {/* Layer 2: Theme-Aware Contrast Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-main-bg)]/85 via-[var(--color-main-bg)]/60 to-[var(--color-main-bg)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-main-bg)_80%)] pointer-events-none z-0" />

        {/* Layer 3: Subtle Floating Tech Elements on Large Screens */}
        <div className="hidden xl:block absolute left-8 top-1/4 p-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)]/90 backdrop-blur-xs shadow-md z-10 animate-float pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-main)]">
            <Code2 className="w-4 h-4 text-[var(--color-primary-accent)]" />
            <span>Coding Arena & Battles</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">Automated test execution</span>
        </div>

        <div className="hidden xl:block absolute right-8 top-1/3 p-3 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)]/90 backdrop-blur-xs shadow-md z-10 animate-float pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-main)]">
            <Sparkles className="w-4 h-4 text-[var(--color-primary-accent)]" />
            <span>AI Curriculum Mentor</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)] block mt-0.5">Syllabus-indexed RAG</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            
            {/* Academic Identifier Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--color-secondary-bg)] border border-[var(--color-card-border)] text-[var(--color-text-main)] text-xs font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-accent)] animate-pulse" />
              Academic Project Group SY207 | MIT-ADT University
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text-main)] leading-[1.15]">
              An AI-Powered Career Companion for Students
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed font-normal opacity-90">
              One connected platform guiding engineering students from foundational learning to placement readiness. Unify coding practice, GitHub evidence, resume analysis, and verified skills into a single verifiable dossier.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePortalAccess}
                className="w-full sm:w-auto font-semibold"
              >
                Launch Student Portal
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <a href="#modules" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                  Explore Platform Modules
                </Button>
              </a>
            </div>

            {/* Core Pillars */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-[var(--color-card-border)]">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary-accent)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-main)]">Year 1: Learn</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">Syllabus-indexed AI mentoring for coursework & fundamentals.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary-accent)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-main)]">Year 2: Build Skills</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">Coding Arena challenges, GitHub evidence & roadmap planning.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-primary-accent)] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[var(--color-text-main)]">Year 3: Get Placed</h4>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">ATS resume optimization, verified passports & campus drives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Tabbed Product Preview ────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="blue" size="sm" className="mb-2">Product Interface</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              A Structured Workspace for Engineering Students
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Preview real operational views of CareerOS before logging in.
            </p>
          </div>

          {/* Interactive Preview Container */}
          <div className="max-w-5xl mx-auto bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            
            {/* Preview Tab Selector */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/90 overflow-x-auto p-1.5 gap-1">
              {[
                { id: 'dashboard', label: 'Student Dashboard', icon: BarChart3 },
                { id: 'mentor', label: 'AI Mentor', icon: Compass },
                { id: 'coding', label: 'Coding Arena', icon: Code2 },
                { id: 'passport', label: 'Skill Passport', icon: ShieldCheck },
                { id: 'resume', label: 'ATS Diagnostic', icon: FileText }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activePreviewTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePreviewTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Simulated Live Viewport */}
            <div className="p-6 md:p-8">
              {activePreviewTab === 'dashboard' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60">
                    <div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Target Role: AI/ML Engineer</span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Welcome, Rudra Padhy (Semester 3)</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Placement Readiness: 78% based on verified course and code artifacts.</p>
                    </div>
                    <Badge variant="success" size="md">Profile Verified</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Learning XP</span>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">4,250 XP</div>
                      <span className="text-[11px] text-emerald-600 font-medium">+320 this week</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Skill Confidence</span>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">78%</div>
                      <span className="text-[11px] text-slate-400">Evidence-based</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Career Readiness</span>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">72%</div>
                      <span className="text-[11px] text-slate-400">Target: AI/ML</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <span className="text-[11px] font-medium text-slate-500 uppercase">Learning Streak</span>
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">12 Days</div>
                      <span className="text-[11px] text-slate-400">Consistent</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'mentor' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <Compass className="w-4 h-4" />
                      <span>RAG-Assisted Academic Query Session</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-xs">
                      <strong className="text-slate-900 dark:text-slate-100 block mb-1">Student:</strong>
                      "Explain process synchronization in Operating Systems and common viva questions for Semester 3."
                    </div>
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-blue-700 dark:text-blue-300 block mb-1">CareerOS Mentor (Unit 3 OS Index):</strong>
                      Process synchronization coordinates concurrent process execution to avoid race conditions. Key mechanisms include Semaphores, Mutexes, and Monitors. Common viva questions focus on critical section criteria (mutual exclusion, progress, bounded waiting).
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'coding' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daily Challenge: Two Sum</h4>
                        <span className="text-[11px] text-slate-500">Algorithms • Array, Hash Map • +100 XP</span>
                      </div>
                      <Badge variant="success" size="sm">Easy</Badge>
                    </div>
                    <div className="mt-3 p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto">
                      <code>def two_sum(nums, target):<br/>&nbsp;&nbsp;&nbsp;&nbsp;lookup = {}<br/>&nbsp;&nbsp;&nbsp;&nbsp;for i, num in enumerate(nums):<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if target - num in lookup:<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return [lookup[target - num], i]<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lookup[num] = i</code>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'passport' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <tr>
                          <th className="p-3">Skill</th>
                          <th className="p-3">Confidence</th>
                          <th className="p-3">Evidence Source</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="p-3 font-semibold">Python</td>
                          <td className="p-3 font-bold text-emerald-600">88%</td>
                          <td className="p-3 text-slate-500">5 Repositories • Coding Arena</td>
                          <td className="p-3"><Badge variant="success" size="sm">Verified</Badge></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Git & GitHub</td>
                          <td className="p-3 font-bold text-blue-600">82%</td>
                          <td className="p-3 text-slate-500">Annual Activity • Branching</td>
                          <td className="p-3"><Badge variant="success" size="sm">Verified</Badge></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Data Structures</td>
                          <td className="p-3 font-bold text-amber-600">68%</td>
                          <td className="p-3 text-slate-500">Arena Benchmark (34 Solved)</td>
                          <td className="p-3"><Badge variant="warning" size="sm">Developing</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activePreviewTab === 'resume' && (
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Resume Diagnostic Report</h4>
                        <span className="text-[11px] text-slate-500">File: Resume_Engineering.pdf</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">ATS Benchmark</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">84/100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-1">Key Strengths</span>
                        <p className="text-slate-600 dark:text-slate-300 leading-snug">Strong quantitative metrics, clear single-column layout, verified project links.</p>
                      </div>
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-200/60 dark:border-amber-800/60">
                        <span className="font-semibold text-amber-700 dark:text-amber-300 block mb-1">Recommended Improvements</span>
                        <p className="text-slate-600 dark:text-slate-300 leading-snug">Add MLOps pipeline tooling and containerization keywords for targeted role.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Problem & Purpose ────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-4">
              <Badge variant="neutral" size="sm">The Core Problem</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Engineering students juggle fragmented tools without unified progress tracking.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Students typically disperse their preparation across 5+ disconnected services: YouTube for tutorials, LeetCode for practice, GitHub for repositories, disparate builders for resumes, and separate platforms for mock interviews.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Without a unified system, it remains difficult to diagnose skill gaps, assess true placement readiness, or show verifiable proof to recruiters beyond unverified text on a resume.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                The CareerOS Solution
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <strong className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Unified Academic & Career Trail</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Continuous progression from first-year basics to third-year placement drives.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <strong className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Evidence-Based Skill Confidence</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Skills are verified through coding submissions, GitHub commits, and faculty reviews.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <strong className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">Transparent Recruiter Discovery</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Companies filter by genuine project artifacts and benchmarked competencies.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Student Journey (1st Year -> 2nd Year -> 3rd Year) ───────────── */}
      <section id="journey" className="py-16 md:py-20 bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="blue" size="sm" className="mb-2">Structured Roadmap</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              One Journey: From First Year to Placement
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              CareerOS structures your college career into three clear phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentJourney.map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {step.year}
                    </span>
                    <Badge variant="neutral" size="sm">{step.focus}</Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Key Outcomes:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {step.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── The 9 Core Modules ───────────────────────────────────────────── */}
      <section id="modules" className="py-16 md:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="blue" size="sm" className="mb-2">Platform Capabilities</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              The Nine Platform Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Integrated modules covering the end-to-end student development pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulesList.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/60">
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant="neutral" size="sm">{mod.stage}</Badge>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {mod.title}
                    </h3>
                    <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-0.5 mb-2">
                      {mod.subtitle}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Status: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{mod.status}</strong>
                    </span>
                    <button
                      onClick={handlePortalAccess}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      Open Module
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Proposed System Architecture & Tech Stack ────────────────────── */}
      <section id="architecture" className="py-16 md:py-20 bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="neutral" size="sm" className="mb-2">Technical Foundations</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Proposed System Architecture & Technology Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Clean separation of concerns with modern frontend and backend frameworks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Frontend</span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">React 18 + Vite</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Tailwind CSS & Lucide</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Backend</span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Python FastAPI</div>
              <span className="text-[11px] text-slate-500 mt-1 block">RESTful APIs</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Database</span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">SQLAlchemy ORM</div>
              <span className="text-[11px] text-slate-500 mt-1 block">SQLite / PostgreSQL</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Security</span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">JWT + Bcrypt</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Role Authorization</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">AI Client</span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Groq Cloud API</div>
              <span className="text-[11px] text-slate-500 mt-1 block">LLaMA 3.3 70B & RAG</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Git API</span>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">GitHub REST API</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Public Repo & Commits</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Institutional Project Credits ─────────────────────────────────── */}
      <section className="py-12 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Academic Project Accreditation
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            MIT-ADT UNIVERSITY | School of Computing
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Department of Computer Science & Engineering • Group ID: SY207 • Semester 03, A.Y. 2026-2027
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
            <span>Sahil Shinde</span>
            <span>•</span>
            <span>Rudra Prasad Padhy</span>
            <span>•</span>
            <span>Parth Shinde</span>
            <span>•</span>
            <span>Sanket Raut</span>
          </div>
          <div className="text-xs text-slate-500 pt-1">
            Project Guide: <strong className="text-slate-700 dark:text-slate-300 font-semibold">Dr. Megha Wankhade</strong>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-12 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  Career<span className="text-blue-600 dark:text-blue-400">OS</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-normal">
                An AI-powered career operating system for engineering students. Connects foundational learning, coding practice, GitHub evidence, resume analysis, and placement preparation into one verifiable dossier.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Student Registration</Link></li>
                <li><a href="#journey" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">3-Year Student Journey</a></li>
                <li><a href="#modules" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">All 9 Platform Modules</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                Legal & Governance
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms and Conditions</Link></li>
                <li><span className="text-slate-400">Institution: MIT-ADT University</span></li>
                <li><span className="text-slate-400">Department: CSE (SY207)</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © 2026-2027 CareerOS Project. Developed for MIT-ADT University CSE. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
