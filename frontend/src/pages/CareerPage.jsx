import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  FileText,
  GitBranch,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2,
  FolderGit2
} from 'lucide-react';
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

  const targetRole = intelligence?.target_role || studentData?.profile?.target_role || "Not configured (Set in Profile)";
  const resumeScore = intelligence?.resume_score;
  const githubScore = intelligence?.github_score;
  const skillGaps = intelligence?.skill_gaps || [];

  return (
    <div className="space-y-6">
      
      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-xs font-medium text-blue-300">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>Placement Target:</span>
            <strong className="text-white font-semibold">{targetRole}</strong>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Career Intelligence Hub
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            CareerOS aggregates your uploaded resume ATS diagnostic, GitHub repository commits, and verified skill passport to compute placement readiness and bridge skill gaps.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/resume')}
            icon={<FileText className="w-4 h-4" />}
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs"
          >
            Resume Analysis
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/github')}
            icon={<GitBranch className="w-4 h-4" />}
            className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs"
          >
            GitHub Intelligence
          </Button>
        </div>
      </div>

      {/* ─── Top 4 Intelligence Scores ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Resume ATS Score"
          value={resumeScore !== null && resumeScore !== undefined ? `${resumeScore}%` : "-"}
          subtitle={resumeScore ? "Diagnostic complete" : "Upload your resume"}
          icon={FileText}
          color="blue"
          onClick={() => navigate('/resume')}
        />
        <StatCard
          title="GitHub Intelligence"
          value={githubScore !== null && githubScore !== undefined ? `${githubScore}/100` : "-"}
          subtitle={githubScore ? "Code evidence synced" : "Sync GitHub profile"}
          icon={GitBranch}
          color="emerald"
          onClick={() => navigate('/github')}
        />
        <StatCard
          title="Overall Readiness"
          value={studentData?.stats?.career_readiness || "0%"}
          subtitle={`Target: ${targetRole}`}
          icon={Target}
          color="amber"
        />
        <StatCard
          title="Identified Gaps"
          value={skillGaps.length > 0 ? `${skillGaps.filter(g => g.status !== 'Target Met').length} Skills` : "-"}
          subtitle={skillGaps.length > 0 ? "Action plan ready" : "Configure target role"}
          icon={BarChart3}
          color="indigo"
        />
      </div>

      {/* ─── Main 2-Column Section ────────────────────────────────────────── */}
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
              >
                View Roadmap
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            {skillGaps.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Configure your target career role in your Profile to generate your personalized skill gap matrix.
              </div>
            ) : (
              <div className="space-y-3">
                {skillGaps.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.skill}</strong>
                        <Badge variant={item.status === 'High Priority' ? 'danger' : item.status === 'Target Met' ? 'success' : 'warning'} size="sm">
                          {item.status}
                        </Badge>
                      </div>
                      <span className="font-medium text-xs text-slate-500 dark:text-slate-400">
                        Current: {item.current}% / Target: {item.target}% ({item.gap})
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Current Proficiency</span>
                        <span>Target Level ({item.target}%)</span>
                      </div>
                      <ProgressBar
                        value={item.current}
                        color={item.current >= item.target ? 'emerald' : item.current >= 65 ? 'blue' : 'amber'}
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
            <Card title="Resume Diagnostic Insights">
              {intelligence?.has_resume ? (
                <>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    Active document: <strong className="text-slate-900 dark:text-slate-100">{intelligence.resume_name}</strong>
                  </p>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{intelligence.resume_score}% ATS score with verified keyword mapping</span>
                  </div>
                </>
              ) : (
                <div className="py-3 text-xs text-slate-500 leading-relaxed mb-3">
                  No resume document uploaded yet. Upload a PDF or DOCX to benchmark against ATS hiring filters.
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/resume')}
                className="w-full text-xs font-semibold"
              >
                Open Resume Analysis
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Card>

            <Card title="GitHub Code Intelligence">
              {intelligence?.has_github ? (
                <>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    Linked GitHub account: <strong className="text-slate-900 dark:text-slate-100">@{intelligence.github_username}</strong>
                  </p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-xs text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600" />
                    <span>{intelligence.github_score}/100 code evidence score</span>
                  </div>
                </>
              ) : (
                <div className="py-3 text-xs text-slate-500 leading-relaxed mb-3">
                  No GitHub account connected. Connect your GitHub profile to turn public repositories into hiring proof.
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/github')}
                className="w-full text-xs font-semibold"
              >
                Open GitHub Intelligence
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Strategic Action Plan */}
        <div className="space-y-6">
          <Card
            title="Strategic Action Plan"
            subtitle="Prioritized steps to improve placement readiness"
            action={<Badge variant="info" size="sm">AI Guided</Badge>}
          >
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">1. Practice Coding Arena</span>
                  <Badge variant="warning" size="sm">High Priority</Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Solve coding challenges to increase verified problem-solving evidence in your Skill Passport.
                </p>
                <button onClick={() => navigate('/coding')} className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 block">
                  Go to Arena →
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">2. Upload & Parse Resume</span>
                  <Badge variant="info" size="sm">Diagnostic</Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload your latest resume to discover missing skills and benchmark keyword density.
                </p>
                <button onClick={() => navigate('/resume')} className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 block">
                  Analyze Resume →
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">3. Build Capstone Projects</span>
                  <Badge variant="success" size="sm">Evidence</Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Register repository projects for faculty attestation and recruiter discovery dossiers.
                </p>
                <button onClick={() => navigate('/projects')} className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1 block">
                  View Projects →
                </button>
              </div>
            </div>
          </Card>

          <Card title="Recruiter Visibility Status">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 font-normal">
              Your profile is visible to verified campus placement recruiters once you reach at least 70% skill confidence and have at least 1 faculty-verified project.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Placement Status:</span>
              <span className="text-blue-600 dark:text-blue-400">In Progress</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CareerPage;
