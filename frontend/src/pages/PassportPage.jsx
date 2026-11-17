import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { passportService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import Toast from '../components/common/Toast';

const PassportPage = () => {
  const { studentData, refreshStudentData } = useCareer();
  const { openModal } = useModal();

  const [passportData, setPassportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Core Programming',
    percentage: 75,
    evidence: 'Coursework & Projects'
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadPassport();
  }, []);

  const loadPassport = async () => {
    try {
      setLoading(true);
      const data = await passportService.getPassport();
      setPassportData(data);
    } catch {
      // Fallback to studentData
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;

    try {
      await passportService.addSkill({
        name: newSkill.name.trim(),
        category: newSkill.category,
        percentage: parseInt(newSkill.percentage) || 60,
        evidence: newSkill.evidence
      });

      setToastMessage(`Skill "${newSkill.name}" added to your Skill Passport!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setShowAddModal(false);
      setNewSkill({ name: '', category: 'Core Programming', percentage: 75, evidence: 'Coursework & Projects' });
      
      loadPassport();
      if (refreshStudentData) refreshStudentData();
    } catch (err) {
      setToastMessage(err.response?.data?.detail || "Failed to add skill");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const skills = passportData?.skills || studentData?.skills || [];
  const stats = passportData?.stats || studentData?.stats || {};
  const user = passportData?.user || studentData?.profile || {};
  const badges = passportData?.badges || [];

  const columns = [
    {
      header: "Skill & Domain",
      accessor: "name",
      render: (row) => (
        <div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white block">{row.name}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{row.category}</span>
        </div>
      )
    },
    {
      header: "Confidence",
      accessor: "percentage",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 min-w-[36px]">{row.percentage}%</span>
          <div className="w-20 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.percentage >= 80 ? 'bg-emerald-500' : row.percentage >= 65 ? 'bg-blue-600' : 'bg-amber-500'
              }`}
              style={{ width: `${row.percentage}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: "Verified Evidence",
      accessor: "evidence",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{row.evidence}</span>
        </div>
      )
    },
    {
      header: "Attestation Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === 'Verified' ? 'success' : row.status === 'Developing' ? 'warning' : 'danger'}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Action",
      accessor: "action",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openModal(`Evidence Verification: ${row.name}`, `• Skill Level: ${row.level || 'Evaluated'}\n• Verification Date: ${row.verifiedDate || 'Recent'}\n• Evidence Trail:\n${row.evidence}\n• Confidence: ${row.percentage}%`)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700"
        >
          View Trail
        </Button>
      )
    }
  ];

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
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Living Skill Passport</span>
            <span className="text-white font-semibold">• {user.name ? `${user.name}${user.degree ? ` (${user.degree})` : ''}` : 'Student Profile'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Verified Skill Passport & Evidence Ledger</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
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
          <Button
            variant="outline"
            size="md"
            onClick={() => openModal("Shareable Skill Passport", `Public URL: ${user.public_url || 'https://careeros.app/passport/verified'}\n\nRecruiters and hiring managers can view your verified coding stats, faculty attestations, and GitHub evidence directly.`)}
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Export Passport
          </Button>
        </div>
      </div>

      {/* 4 Score Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Confidence"
          value={stats.overall_confidence || stats.skill_confidence || "0%"}
          subtitle={skills.length > 0 ? `${skills.length} skills tracked` : "Add skills to track"}
          icon="ShieldCheck"
          color="green"
        />
        <StatCard
          title="Verified Projects"
          value={stats.verified_projects || 0}
          subtitle="Faculty Reviewed"
          icon="FolderGit2"
          color="blue"
        />
        <StatCard
          title="Coding Benchmark"
          value={stats.coding_score || "0%"}
          subtitle="Problem Solving Arena"
          icon="Code2"
          color="purple"
        />
        <StatCard
          title="Interview Readiness"
          value={stats.interview_readiness || stats.career_readiness || "0%"}
          subtitle={user.target_role ? `Target: ${user.target_role}` : "Set target role"}
          icon="Target"
          color="orange"
        />
      </div>

      {/* Verified Skills Table */}
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
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No skills added to your passport yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Add programming languages, frameworks, or CS core competencies to start building your verified evidence ledger.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="mt-4"
            >
              Add First Skill
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={skills} keyField="name" />
        )}
      </Card>

      {/* Badges & Verifications Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Faculty Attestations" subtitle="Signed by academic guides">
          {skills.some(s => s.status === 'Verified') ? (
            <div className="space-y-3">
              {skills.filter(s => s.status === 'Verified').slice(0, 3).map((s, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">{s.name}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Attested: {s.evidence}</p>
                  <Badge variant="success">Verified Evidence</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No faculty attestations yet. Submitting verified course projects will unlock endorsements.
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
              Solve coding challenges and earn XP to unlock verified technical badges.
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

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Skill to Passport</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Specify skill and self-assessed proficiency</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g. Python, React, PostgreSQL, Docker"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                >
                  <option value="Core Programming">Core Programming</option>
                  <option value="Machine Learning / AI">Machine Learning / AI</option>
                  <option value="Web & Full Stack">Web & Full Stack</option>
                  <option value="Databases & Systems">Databases & Systems</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Confidence Level</label>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{newSkill.percentage}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={newSkill.percentage}
                  onChange={(e) => setNewSkill({ ...newSkill, percentage: e.target.value })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evidence Source</label>
                <input
                  type="text"
                  value={newSkill.evidence}
                  onChange={(e) => setNewSkill({ ...newSkill, evidence: e.target.value })}
                  placeholder="e.g. Coursework CS301, GitHub Repo, Coding Arena"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
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
                  Add to Passport
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassportPage;
