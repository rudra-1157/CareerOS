import React from 'react';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';

const PassportPage = () => {
  const { studentData } = useCareer();
  const { openModal } = useModal();
  const skills = studentData.skills || [];
  const stats = studentData.stats || {};
  const profile = studentData.profile || {};

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
          onClick={() => openModal(`Evidence Verification: ${row.name}`, `• Skill Level: ${row.level || 'Proficient'}\n• Verification Date: ${row.verifiedDate || 'Oct 2026'}\n• Evidence Trail:\n${row.evidence}\n• Confidence: ${row.percentage}%`)}
          className="text-xs font-bold text-[#315bdc]"
        >
          View Trail →
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🛡️ Living Skill Passport</span>
            <span className="text-white font-bold">{profile.name} • {profile.degree}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Verified Skill Passport & Evidence Ledger</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            An unforgeable, evidence-backed academic and technical passport endorsed by university faculty, GitHub repositories, and automated test evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => openModal("Shareable Skill Passport", `Public URL: https://careeros.edu/passport/rudra-padhy\n\nRecruiters and hiring managers can view your verified coding stats, faculty attestations, and GitHub evidence directly.`)}
            className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold shadow-sm"
          >
            🔗 Export Public Passport
          </Button>
        </div>
      </div>

      {/* 4 Score Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Skill Confidence"
          value={stats.skill_confidence || "78%"}
          subtitle="Evidence-Weighted Avg"
          icon="🛡️"
          color="green"
        />
        <StatCard
          title="Verified Projects"
          value={stats.verified_projects || 4}
          subtitle="Faculty Reviewed"
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Coding Score"
          value={stats.coding_score || "86%"}
          subtitle="126 Problems Solved"
          icon="💻"
          color="purple"
        />
        <StatCard
          title="Interview Readiness"
          value={stats.interview_readiness || "81%"}
          subtitle="Target: AI/ML Engineer"
          icon="🎯"
          color="orange"
        />
      </div>

      {/* Verified Skills Table */}
      <Card
        title="Verified Skills & Evidence Matrix"
        subtitle="Every score is backed by cryptographic faculty sign-offs, commits, or test suite results"
      >
        <Table columns={columns} data={skills} keyField="name" />
      </Card>

      {/* Badges & Verifications Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="🏛️ Faculty Endorsements">
          <div className="space-y-3">
            <div className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] space-y-1">
              <b className="text-xs text-[#172033] block">Dr. Arvind Sharma</b>
              <p className="text-[11px] text-[#68738a]">Endorsed Python Core & PyTorch Pipeline</p>
              <Badge variant="success">CSE Dept Head</Badge>
            </div>
            <div className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] space-y-1">
              <b className="text-xs text-[#172033] block">Prof. Rajesh Verma</b>
              <p className="text-[11px] text-[#68738a]">Endorsed Database Systems & SQL Optimization</p>
              <Badge variant="info">DBMS Lab Lead</Badge>
            </div>
          </div>
        </Card>

        <Card title="🏆 Earned Technical Badges">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-center">
              <span className="text-xl block">🐍</span>
              <b className="text-[11px] text-[#172033] block">Python Pro</b>
              <span className="text-[9px] text-[#15966b]">Top 5%</span>
            </div>
            <div className="p-2.5 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-center">
              <span className="text-xl block">🚀</span>
              <b className="text-[11px] text-[#172033] block">FastAPI Builder</b>
              <span className="text-[9px] text-[#315bdc]">Verified</span>
            </div>
            <div className="p-2.5 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-center">
              <span className="text-xl block">⚡</span>
              <b className="text-[11px] text-[#172033] block">12-Day Streak</b>
              <span className="text-[9px] text-[#c97817]">Active</span>
            </div>
            <div className="p-2.5 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-center">
              <span className="text-xl block">🐙</span>
              <b className="text-[11px] text-[#172033] block">GitHub Active</b>
              <span className="text-[9px] text-[#8b5cf6]">380+ Commits</span>
            </div>
          </div>
        </Card>

        <Card title="Recruiter Trust Factor">
          <p className="text-xs text-[#475569] leading-relaxed mb-3">
            Because Skill Passports are backed by actual commit diffs, live tests, and university faculty attestations, candidates see a <b>3.4x higher interview call rate</b>.
          </p>
          <div className="p-3 bg-[#e7f7f0] border border-[#a3e0c7] rounded-xl text-xs text-[#11825c] font-bold">
            ✓ 100% Tamper-Evident & Authenticated
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PassportPage;
