import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Plus, 
  ExternalLink, 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  X, 
  Github, 
  Sparkles,
  Layers,
  Code
} from 'lucide-react';
import { projectsService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

const ProjectsPage = () => {
  const { refreshStudentData } = useCareer();
  const { openModal } = useModal();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Machine Learning / AI',
    desc: '',
    techStack: 'Python, PyTorch, FastAPI',
    githubUrl: '',
    demoUrl: '',
    metrics: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProjects();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.desc.trim()) return;

    try {
      await projectsService.createProject({
        title: newProject.title.trim(),
        category: newProject.category,
        description: newProject.desc.trim(),
        tech_stack: typeof newProject.techStack === 'string'
          ? newProject.techStack.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(newProject.techStack)
            ? newProject.techStack
            : [],
        github_url: newProject.githubUrl.trim(),
        demo_url: newProject.demoUrl.trim(),
        metrics: newProject.metrics.trim()
      });

      setToastMessage("New project registered and submitted for faculty verification!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsAdding(false);
      setNewProject({
        title: '',
        category: 'Machine Learning / AI',
        desc: '',
        techStack: 'Python, PyTorch, FastAPI',
        githubUrl: '',
        demoUrl: '',
        metrics: ''
      });

      loadProjects();
      if (refreshStudentData) refreshStudentData();
    } catch (err) {
      setToastMessage(err.response?.data?.detail || "Failed to create project");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={toastMessage}
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-medium text-slate-200">
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Verified Project Ledger</span>
            <span className="text-white font-semibold">• {projects.length} Registered</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Capstone Projects & Technical Artifacts</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Real engineering projects backed by GitHub repository code, live deployments, and faculty attestations for recruiter dossiers.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsAdding(true)}
          className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Register New Project
        </Button>
      </div>

      {/* Add Project Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Project for Verification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add implementation details and repository references</p>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Distributed Model Serving Engine"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Domain</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  >
                    <option value="Machine Learning / AI">Machine Learning / AI</option>
                    <option value="Full-Stack Dev">Full-Stack Dev</option>
                    <option value="Systems & Cloud">Systems & Cloud</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Metrics</label>
                  <input
                    type="text"
                    value={newProject.metrics}
                    onChange={(e) => setNewProject({ ...newProject, metrics: e.target.value })}
                    placeholder="e.g. 98.2% Accuracy, <40ms Latency"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  placeholder="Python, PyTorch, FastAPI, React"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Demo URL (optional)</label>
                <input
                  type="url"
                  value={newProject.demoUrl}
                  onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                  placeholder="https://my-app.vercel.app"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newProject.desc}
                  onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })}
                  placeholder="Explain architecture, key features, and your individual engineering contribution..."
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Submit for Verification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-14 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Projects Registered Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Register your course assignments, capstone systems, or independent software projects to build verifiable proof for faculty and campus recruiters.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAdding(true)}
              className="mt-5"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Register Your First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className="hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              padding="p-6"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                      {proj.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{proj.title}</h3>
                  </div>
                  <Badge variant={proj.verifiedStatus?.includes('Verified') ? 'success' : 'warning'}>
                    {proj.verifiedStatus}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {proj.desc}
                </p>

                {proj.metrics && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <BarChart2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{proj.metrics}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(proj.techStack || []).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Attested: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{proj.verifiedBy}</strong>
                </span>
                <div className="flex items-center gap-3">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
