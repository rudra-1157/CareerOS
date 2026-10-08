import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';

const CareerPage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();

  const skillGaps = [
    { skill: "Machine Learning (PyTorch)", current: 52, target: 80, gap: "-28%", status: "High Priority" },
    { skill: "Data Structures & Algorithms", current: 68, target: 80, gap: "-12%", status: "Medium Priority" },
    { skill: "SQL & Relational DBs", current: 64, target: 75, gap: "-11%", status: "Medium Priority" },
    { skill: "Python & Core OOP", current: 88, target: 80, gap: "+8%", status: "Target Met" }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🎯 Placement Target:</span>
            <span className="text-white font-bold">AI/ML Engineer</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Career Intelligence Hub</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            CareerOS combines your resume ATS parsing, GitHub commit patterns, and lab performance to predict candidate readiness and pinpoint precise skill gaps.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/resume')}
            className="bg-white text-[#101a3b] hover:bg-[#edf2ff] font-bold"
          >
            📄 Resume Analysis
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/github')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold"
          >
            🐙 GitHub Intelligence
          </Button>
        </div>
      </div>

      {/* Top 4 Intelligence Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Resume ATS Score"
          value="84%"
          subtitle="Tier-1 Match Ready"
          icon="📄"
          color="blue"
          onClick={() => navigate('/resume')}
        />
        <StatCard
          title="GitHub Intelligence"
          value="88/100"
          subtitle="Strong Project Evidence"
          icon="🐙"
          color="green"
          onClick={() => navigate('/github')}
        />
        <StatCard
          title="Overall Readiness"
          value="72%"
          subtitle="Target: AI/ML Engineer"
          icon="🎯"
          color="orange"
        />
        <StatCard
          title="Identified Gaps"
          value="3 Skills"
          subtitle="Action Plan Ready"
          icon="📊"
          color="purple"
        />
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Skill Gap Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Skill Gap Matrix (Target vs Current Profile)"
            subtitle="Calculated based on 2,500+ campus hiring rounds for AI/ML Engineer roles"
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/roadmap')}
                className="font-bold text-xs"
              >
                View 6-Month Roadmap →
              </Button>
            }
          >
            <div className="space-y-4">
              {skillGaps.map((item, idx) => (
                <div key={idx} className="p-4 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <b className="text-sm text-[#172033]">{item.skill}</b>
                      <Badge variant={item.status === 'High Priority' ? 'danger' : item.status === 'Target Met' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    </div>
                    <span className="font-bold text-xs text-[#68738a]">
                      Current: {item.current}% / Target: {item.target}% ({item.gap})
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#68738a]">
                      <span>Current Proficiency</span>
                      <span>Target Level ({item.target}%)</span>
                    </div>
                    <ProgressBar
                      value={item.current}
                      color={item.current >= item.target ? 'green' : item.current >= 65 ? 'blue' : 'orange'}
                      size="md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Core Insights & Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="📄 Resume Insights">
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Detected strong foundations in Python, Git, and Data Structures.
              </p>
              <div className="p-3 bg-[#f8f9fc] rounded-xl text-xs text-[#15966b] font-semibold border border-[#d8e6dc] mb-3">
                ✓ 84% ATS Score with high technical keyword density
              </div>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/resume')}
                className="text-xs font-bold"
              >
                Open Full Resume Diagnostic
              </Button>
            </Card>

            <Card title="🐙 GitHub Evidence">
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                5 Python repos, 2 React projects, and high commit consistency.
              </p>
              <div className="p-3 bg-[#f8f9fc] rounded-xl text-xs text-[#315bdc] font-semibold border border-[#d2defa] mb-3">
                ✓ Evidence Strength: High across full-stack repositories
              </div>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/github')}
                className="text-xs font-bold"
              >
                Inspect GitHub Intelligence
              </Button>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Recommended Skill Roadmap Preview */}
        <div className="space-y-6">
          <Card
            title="Personalized 4-Phase Roadmap"
            subtitle="Tailored to bridge your exact gaps"
            action={
              <Badge variant="info">AI Generated</Badge>
            }
          >
            <div className="space-y-3">
              {[
                { phase: "Phase 1: DSA Mastery", weeks: "4 weeks", focus: "Graphs & Dynamic Programming" },
                { phase: "Phase 2: PyTorch & ML Core", weeks: "6 weeks", focus: "Model Training & Evaluation" },
                { phase: "Phase 3: SQL & Vector DB", weeks: "3 weeks", focus: "Query Optimization & Embeddings" },
                { phase: "Phase 4: ML Capstone Deploy", weeks: "5 weeks", focus: "FastAPI + Docker Deployment" }
              ].map((step, idx) => (
                <div key={idx} className="p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1] text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <b className="text-[#172033]">{step.phase}</b>
                    <span className="text-[10px] font-bold bg-[#edf2ff] text-[#315bdc] px-2 py-0.5 rounded">
                      {step.weeks}
                    </span>
                  </div>
                  <p className="text-[#68738a] text-[11px]">{step.focus}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#edf0f5]">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => navigate('/roadmap')}
                className="font-bold text-xs"
              >
                Explore Interactive Roadmap
              </Button>
            </div>
          </Card>

          <Card title="Recruiter Evaluation Standard">
            <p className="text-xs text-[#475569] leading-relaxed">
              Tier-1 campus recruiters require at least <b>3 verified project artifacts</b> and <b>75%+ skill confidence</b> in core domain skills before shortlisting for interviews.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerPage;
