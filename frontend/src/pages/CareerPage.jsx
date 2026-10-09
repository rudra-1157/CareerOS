import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';

const CareerPage = () => {
  const { openModal } = useModal();
  const { studentData } = useCareer();
  const navigate = useNavigate();

  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    try {
      setLoading(true);
      const data = await careerService.getIntelligence();
      setIntelligence(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const targetRole = intelligence?.target_role || studentData?.profile?.target_role || "Not set — update your profile";
  const resumeScore = intelligence?.resume_score;
  const githubScore = intelligence?.github_score;
  const skillGaps = intelligence?.skill_gaps || [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>🎯 Placement Target:</span>
            <span className="text-white font-bold">{targetRole}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Career Intelligence Hub</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            CareerOS aggregates your uploaded resume ATS diagnostic, GitHub repository commits, and verified skill passport to compute placement readiness and bridge skill gaps.
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
          value={resumeScore !== null && resumeScore !== undefined ? `${resumeScore}%` : "—"}
          subtitle={resumeScore ? "Diagnostic complete" : "Upload your resume"}
          icon="📄"
          color="blue"
          onClick={() => navigate('/resume')}
        />
        <StatCard
          title="GitHub Intelligence"
          value={githubScore !== null && githubScore !== undefined ? `${githubScore}/100` : "—"}
          subtitle={githubScore ? "Code evidence synced" : "Sync GitHub profile"}
          icon="🐙"
          color="green"
          onClick={() => navigate('/github')}
        />
        <StatCard
          title="Overall Readiness"
          value={studentData?.stats?.career_readiness || "0%"}
          subtitle={`Target: ${targetRole}`}
          icon="🎯"
          color="orange"
        />
        <StatCard
          title="Identified Gaps"
          value={skillGaps.length > 0 ? `${skillGaps.filter(g => g.status !== 'Target Met').length} Skills` : "—"}
          subtitle={skillGaps.length > 0 ? "Action plan ready" : "Add target role"}
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
            subtitle={`Benchmarked against industry hiring expectations for: ${targetRole}`}
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/roadmap')}
                className="font-bold text-xs"
              >
                View Career Roadmap →
              </Button>
            }
          >
            {skillGaps.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94a3b8]">
                Set your target career role in your Profile to generate your personalized skill gap matrix.
              </div>
            ) : (
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
            )}
          </Card>

          {/* Core Insights & Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="📄 Resume Insights">
              {intelligence?.has_resume ? (
                <>
                  <p className="text-xs text-[#475569] leading-relaxed mb-3">
                    Active resume file: <b className="text-[#172033]">{intelligence.resume_name}</b>
                  </p>
                  <div className="p-3 bg-[#f8f9fc] rounded-xl text-xs text-[#15966b] font-semibold border border-[#d8e6dc] mb-3">
                    ✓ {intelligence.resume_score}% ATS score with verified keyword mapping
                  </div>
                </>
              ) : (
                <div className="py-3 text-xs text-[#68738a] leading-relaxed mb-3">
                  No resume document uploaded yet. Upload a PDF or DOCX to benchmark against ATS hiring filters.
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/resume')}
                className="w-full text-xs font-semibold"
              >
                Open Resume Analysis →
              </Button>
            </Card>

            <Card title="🐙 GitHub Intelligence">
              {intelligence?.has_github ? (
                <>
                  <p className="text-xs text-[#475569] leading-relaxed mb-3">
                    Linked GitHub account: <b className="text-[#172033]">@{intelligence.github_username}</b>
                  </p>
                  <div className="p-3 bg-[#f8f9fc] rounded-xl text-xs text-[#315bdc] font-semibold border border-[#d8e2fd] mb-3">
                    ⚡ {intelligence.github_score}/100 code evidence score
                  </div>
                </>
              ) : (
                <div className="py-3 text-xs text-[#68738a] leading-relaxed mb-3">
                  No GitHub account connected. Connect your GitHub profile to turn public repositories into hiring proof.
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/github')}
                className="w-full text-xs font-semibold"
              >
                Open GitHub Intelligence →
              </Button>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Strategic Action Plan */}
        <div className="space-y-6">
          <Card
            title="Strategic Action Plan"
            subtitle="Prioritized recommendations to boost placement readiness"
            action={<Badge variant="info">AI Guided</Badge>}
          >
            <div className="space-y-3">
              <div className="p-3 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#172033]">1. Practice Coding Arena</span>
                  <Badge variant="warning">High Priority</Badge>
                </div>
                <p className="text-[11px] text-[#68738a] leading-relaxed">
                  Solve coding challenges to increase verified problem-solving evidence in your Skill Passport.
                </p>
                <button onClick={() => navigate('/coding')} className="text-[11px] font-bold text-[#315bdc] hover:underline pt-1 block">
                  Go to Arena →
                </button>
              </div>

              <div className="p-3 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#172033]">2. Upload & Parse Resume</span>
                  <Badge variant="info">Diagnostic</Badge>
                </div>
                <p className="text-[11px] text-[#68738a] leading-relaxed">
                  Upload your latest resume to discover missing skills and improve formatting.
                </p>
                <button onClick={() => navigate('/resume')} className="text-[11px] font-bold text-[#315bdc] hover:underline pt-1 block">
                  Analyze Resume →
                </button>
              </div>

              <div className="p-3 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#172033]">3. Build Capstone Projects</span>
                  <Badge variant="success">Evidence</Badge>
                </div>
                <p className="text-[11px] text-[#68738a] leading-relaxed">
                  Register repository projects for faculty attestation and recruiter discovery dossiers.
                </p>
                <button onClick={() => navigate('/projects')} className="text-[11px] font-bold text-[#315bdc] hover:underline pt-1 block">
                  View Projects →
                </button>
              </div>
            </div>
          </Card>

          <Card title="Recruiter Visibility">
            <p className="text-xs text-[#475569] leading-relaxed mb-3">
              Your profile is visible to verified campus placement recruiters once you reach at least 70% skill confidence and have at least 1 faculty-verified project.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-[#edf0f5]">
              <span>Placement Status:</span>
              <span className="text-[#315bdc]">In Progress</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerPage;
