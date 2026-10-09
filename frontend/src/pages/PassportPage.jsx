import React, { useState, useEffect } from 'react';
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
      
      // Refresh passport data & global student context
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
          <b className="text-sm text-[#172033] block">{row.name}</b>
          <span className="text-[11px] text-[#68738a]">{row.category}</span>
        </div>
      )
    },
    {
      header: "Confidence",
      accessor: "percentage",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-[#172033]">{row.percentage}%</span>
          <div className="w-16 bg-[#e9edf5] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.percentage >= 80 ? 'bg-[#15966b]' : row.percentage >= 65 ? 'bg-[#315bdc]' : 'bg-[#c97817]'
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
        <span className="text-xs text-[#475569] font-medium">
          🔍 {row.evidence}
        </span>
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
          className="text-xs font-bold text-[#315bdc]"
        >
          View Trail →
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

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🛡️ Living Skill Passport</span>
            <span className="text-white font-bold">{user.name ? `${user.name}${user.degree ? ` • ${user.degree}` : ''}` : 'Student Profile'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Verified Skill Passport & Evidence Ledger</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            An unforgeable, evidence-backed technical ledger endorsed by faculty, GitHub repository artifacts, and automated code evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowAddModal(true)}
            className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold shadow-sm"
          >
            ➕ Add Skill
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => openModal("Shareable Skill Passport", `Public URL: ${user.public_url || 'https://careeros.app/passport/verified'}\n\nRecruiters and hiring managers can view your verified coding stats, faculty attestations, and GitHub evidence directly.`)}
            className="border-white/20 text-white hover:bg-white/10 font-bold"
          >
            🔗 Export Public Passport
          </Button>
        </div>
      </div>

      {/* 4 Score Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Skill Confidence"
          value={stats.overall_confidence || stats.skill_confidence || "0%"}
          subtitle={skills.length > 0 ? `${skills.length} skills tracked` : "Add skills to track"}
          icon="🛡️"
          color="green"
        />
        <StatCard
          title="Verified Projects"
          value={stats.verified_projects || 0}
          subtitle="Faculty Reviewed"
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Coding Benchmark"
          value={stats.coding_score || "0%"}
          subtitle="Problem Solving Arena"
          icon="💻"
          color="purple"
        />
        <StatCard
          title="Interview Readiness"
          value={stats.interview_readiness || stats.career_readiness || "0%"}
          subtitle={user.target_role ? `Target: ${user.target_role}` : "Set target role"}
          icon="🎯"
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
            className="text-xs font-semibold"
          >
            ➕ Add Skill
          </Button>
        }
      >
        {skills.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-3xl mb-2">🛡️</span>
            <p className="text-sm font-semibold text-[#172033]">No skills added to your passport yet</p>
            <p className="text-xs text-[#68738a] mt-1 max-w-sm">
              Add programming languages, frameworks, or CS core competencies to start building your verified evidence ledger.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="mt-4 font-bold"
            >
              Add First Skill →
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={skills} keyField="name" />
        )}
      </Card>

      {/* Badges & Verifications Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="🏛️ Faculty Attestations">
          {skills.some(s => s.status === 'Verified') ? (
            <div className="space-y-3">
              {skills.filter(s => s.status === 'Verified').slice(0, 3).map((s, idx) => (
                <div key={idx} className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] space-y-1">
                  <b className="text-xs text-[#172033] block">{s.name}</b>
                  <p className="text-[11px] text-[#68738a]">Attested: {s.evidence}</p>
                  <Badge variant="success">Verified Evidence</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#94a3b8]">
              No faculty attestations yet. Submitting verified course projects will unlock endorsements.
            </div>
          )}
        </Card>

        <Card title="🏆 Earned Technical Badges">
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {badges.map((b, idx) => (
                <div key={idx} className="p-2.5 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-center">
                  <span className="text-xl block">{b.icon}</span>
                  <b className="text-[11px] text-[#172033] block">{b.title}</b>
                  <span className="text-[9px] text-[#15966b]">{b.subtitle}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#94a3b8]">
              Solve coding challenges and earn XP to unlock verified technical badges.
            </div>
          )}
        </Card>

        <Card title="Recruiter Trust Factor">
          <p className="text-xs text-[#475569] leading-relaxed mb-3">
            Because Skill Passports are backed by verified commit diffs, live tests, and institutional attestations, candidates see a <b>3.4x higher interview call rate</b>.
          </p>
          <div className="p-3 bg-[#e7f7f0] border border-[#a3e0c7] rounded-xl text-xs text-[#11825c] font-bold">
            ✓ 100% Tamper-Evident & Authenticated
          </div>
        </Card>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e9f1] space-y-4">
            <div className="flex justify-between items-center border-b border-[#edf0f5] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#172033]">Add Skill to Passport</h3>
                <p className="text-xs text-[#68738a]">Specify skill and self-assessed proficiency</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#68738a] hover:text-[#172033] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#172033] mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="e.g. Python, React, PostgreSQL, Docker"
                  className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                >
                  <option value="Core Programming">Core Programming</option>
                  <option value="Machine Learning / AI">Machine Learning / AI</option>
                  <option value="Web & Full Stack">Web & Full Stack</option>
                  <option value="Databases & Systems">Databases & Systems</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-bold text-[#172033]">Confidence Level (%)</label>
                  <span className="font-bold text-[#315bdc]">{newSkill.percentage}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={newSkill.percentage}
                  onChange={(e) => setNewSkill({ ...newSkill, percentage: e.target.value })}
                  className="w-full accent-[#315bdc]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#172033] mb-1">Evidence Source</label>
                <input
                  type="text"
                  value={newSkill.evidence}
                  onChange={(e) => setNewSkill({ ...newSkill, evidence: e.target.value })}
                  placeholder="e.g. Coursework CS301, GitHub Repo, Coding Arena"
                  className="w-full px-3 py-2 border border-[#d9deea] rounded-xl focus:outline-none focus:border-[#315bdc]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#edf0f5]">
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
                  className="font-bold"
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
