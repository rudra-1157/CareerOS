import React, { useState, useEffect } from 'react';
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
        tech_stack: newProject.techStack.split(',').map(s => s.trim()).filter(Boolean),
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

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🛠️ Verified Project Ledger</span>
            <span className="text-white font-bold">{projects.length} Registered</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Capstone Projects & Technical Artifacts</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            Real engineering projects backed by GitHub repository code, live deployments, and faculty attestations for recruiter dossiers.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsAdding(true)}
          className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold shadow-sm shrink-0"
        >
          ➕ Register New Project
        </Button>
      </div>

      {/* Add Project Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#e5e9f1] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#edf0f5] pb-3">
              <h3 className="text-lg font-bold text-[#172033]">Register Project for Verification</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-[#68738a] hover:text-[#172033] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#68738a] uppercase mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Distributed Model Serving Engine"
                  className="w-full px-3 py-2 text-xs border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#68738a] uppercase mb-1">Domain</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                  >
                    <option value="Machine Learning / AI">Machine Learning / AI</option>
                    <option value="Full-Stack Dev">Full-Stack Dev</option>
                    <option value="Systems & Cloud">Systems & Cloud</option>
                    <option value="Mobile App">Mobile App</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#68738a] uppercase mb-1">Key Metrics</label>
                  <input
                    type="text"
                    value={newProject.metrics}
                    onChange={(e) => setNewProject({ ...newProject, metrics: e.target.value })}
                    placeholder="e.g. 98.2% Accuracy, <40ms Latency"
                    className="w-full px-3 py-2 text-xs border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#68738a] uppercase mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  placeholder="Python, PyTorch, FastAPI, React"
                  className="w-full px-3 py-2 text-xs border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#68738a] uppercase mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-3 py-2 text-xs border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#68738a] uppercase mb-1">Live Demo URL (optional)</label>
                <input
                  type="url"
                  value={newProject.demoUrl}
                  onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                  placeholder="https://my-app.vercel.app"
                  className="w-full px-3 py-2 text-xs border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#68738a] uppercase mb-1">Project Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newProject.desc}
                  onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })}
                  placeholder="Explain architecture, key features, and your individual engineering contribution..."
                  className="w-full px-3 py-2 text-xs border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#edf0f5]">
                <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold">
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
            <span className="text-4xl mb-3">🛠️</span>
            <h3 className="text-base font-bold text-[#172033]">No Projects Registered Yet</h3>
            <p className="text-xs text-[#68738a] mt-1 max-w-sm">
              Register your course assignments, capstone systems, or independent software projects to build verifiable proof for faculty and campus recruiters.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAdding(true)}
              className="mt-5 font-bold"
            >
              ➕ Register Your First Project
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className="hover:border-[#ccd6e8] transition-all flex flex-col justify-between"
              padding="p-6"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#315bdc] block mb-1">
                      {proj.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#172033] tracking-tight">{proj.title}</h3>
                  </div>
                  <Badge variant={proj.verifiedStatus?.includes('Verified') ? 'success' : 'warning'}>
                    {proj.verifiedStatus}
                  </Badge>
                </div>

                <p className="text-xs text-[#475569] leading-relaxed">
                  {proj.desc}
                </p>

                {proj.metrics && (
                  <div className="p-2.5 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-xs font-semibold text-[#15966b]">
                    📊 {proj.metrics}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(proj.techStack || []).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#edf2ff] text-[#315bdc] text-[11px] font-bold rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#edf0f5] flex items-center justify-between text-xs">
                <span className="text-[#68738a] font-medium">
                  Attested: <b className="text-[#172033]">{proj.verifiedBy}</b>
                </span>
                <div className="flex items-center gap-3">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#315bdc] hover:underline font-bold"
                    >
                      GitHub ↗
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#15966b] hover:underline font-bold"
                    >
                      Live Demo ↗
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
