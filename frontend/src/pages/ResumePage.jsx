import React, { useState } from 'react';
import { initialResumeData } from '../data/initialData';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Toast from '../components/common/Toast';

const ResumePage = () => {
  const { openModal } = useModal();
  const [resumeData, setResumeData] = useState(initialResumeData);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSimulatedUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setResumeData(prev => ({
        ...prev,
        fileName: file.name,
        atsScore: 89,
        matchRating: "High Match (Target: AI/ML Engineer)",
        parsedAt: "Just now"
      }));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message="Resume parsed successfully! ATS score updated to 89%."
        type="success"
        onClose={() => setShowToast(false)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>📄 ATS Intelligence</span>
            <span className="text-white font-bold">{resumeData.matchRating}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">AI Resume Analysis & ATS Diagnostic</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            Upload your resume PDF to benchmark formatting, keyword density, and domain relevance against real campus hiring algorithms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleSimulatedUpload}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center font-bold text-sm bg-white text-[#101a3b] hover:bg-[#edf2ff] px-5 py-2.5 rounded-xl shadow-sm transition-all">
              {isUploading ? 'Parsing Resume...' : '📤 Upload New Resume'}
            </span>
          </label>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall ATS Score"
          value={`${resumeData.atsScore}%`}
          subtitle="Tier-1 Placement Ready"
          icon="🎯"
          color="green"
        />
        <StatCard
          title="Detected Skills"
          value={resumeData.detectedSkills.filter(s => s.match).length}
          subtitle="7 Matched / 2 Missing"
          icon="🔍"
          color="blue"
        />
        <StatCard
          title="Format Compliance"
          value="95%"
          subtitle="Standard Single-Column"
          icon="📐"
          color="purple"
        />
        <StatCard
          title="Active Document"
          value="1 File"
          subtitle={resumeData.fileName}
          icon="📄"
          color="neutral"
        />
      </div>

      {/* Main Grid: Parsed Breakdown vs Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Parsed Skills & Strengths/Weaknesses */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Parsed Skills Keyword Matrix */}
          <Card
            title="Extracted Skills & Keyword Matching"
            subtitle="Comparing resume tokens with AI/ML Engineer job requisitions"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {resumeData.detectedSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    skill.match
                      ? 'bg-[#e7f7f0] border-[#a3e0c7] text-[#11825c]'
                      : 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]'
                  }`}
                >
                  <div>
                    <b className="block text-xs">{skill.name}</b>
                    <span className="text-[10px] opacity-80">{skill.category}</span>
                  </div>
                  <span className="font-bold text-sm">
                    {skill.match ? '✓' : '✕'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Strengths & Weaknesses Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="✅ Identified Strengths">
              <ul className="space-y-2.5 text-xs text-[#334155]">
                {resumeData.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#15966b] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="⚠️ Critical Gaps to Fix">
              <ul className="space-y-2.5 text-xs text-[#334155]">
                {resumeData.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#dc2626] font-bold">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Actionable AI Suggestions */}
        <div className="space-y-6">
          <Card
            title="Actionable ATS Suggestions"
            subtitle="Follow these to reach 90%+ ATS score"
            action={<Badge variant="info">AI Diagnostics</Badge>}
          >
            <div className="space-y-3.5">
              {resumeData.suggestions.map((sug, idx) => (
                <div key={idx} className="p-3 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-1">
                  <div className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                    <span>💡</span>
                    <span>{sug.title}</span>
                  </div>
                  <p className="text-[11px] text-[#68738a] leading-relaxed">
                    {sug.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#edf0f5]">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => openModal("Resume Optimization Guide", "Google XYZ Formula:\n'Accomplished [X], as measured by [Y], by doing [Z]'.\n\nExample:\n'Optimized PyTorch vision pipeline inference latency by 45% (down to 22ms) by implementing TensorRT quantization and batched GPU execution.'")}
                className="font-bold text-xs"
              >
                Learn Google XYZ Resume Formula
              </Button>
            </div>
          </Card>

          <Card title="Current Resume File">
            <div className="flex items-center gap-3 p-3 bg-[#f8f9fc] rounded-xl border border-[#e5e9f1]">
              <span className="text-2xl">📄</span>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#172033]">{resumeData.fileName}</div>
                <div className="text-[11px] text-[#68738a]">Parsed on {resumeData.parsedAt}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
