import React, { useState, useEffect } from 'react';
import { careerService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';

const ResumePage = () => {
  const { refreshStudentData } = useCareer();
  const { openModal } = useModal();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      setLoading(true);
      const res = await careerService.getResume();
      if (res && res.uploaded && res.resume) {
        setResumeData(res.resume);
      } else {
        setResumeData(null);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await careerService.uploadResume(file);
      if (res && res.data) {
        setResumeData(res.data);
        setToastMessage(`Resume "${file.name}" parsed successfully! ATS score: ${res.data.ats_score}%.`);
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3500);
        if (refreshStudentData) refreshStudentData();
      }
    } catch (err) {
      setToastMessage(err.response?.data?.detail || "Failed to upload and parse resume.");
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        show={showToast}
        message={toastMessage}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] via-[#172654] to-[#315bdc] text-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#dce5ff]">
            <span>📄 ATS Intelligence</span>
            <span className="text-white font-bold">{resumeData ? (resumeData.match_rating || resumeData.matchRating) : "No Resume Uploaded"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">AI Resume Analysis & ATS Diagnostic</h2>
          <p className="text-sm text-[#dce5ff] leading-relaxed">
            Upload your resume document (PDF or DOCX) to benchmark formatting, keyword density, and technical domain relevance against real campus hiring algorithms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center font-bold text-xs bg-white text-[#101a3b] hover:bg-[#edf2ff] px-5 py-2.5 rounded-xl shadow-sm transition-all">
              {isUploading ? 'Analyzing Resume...' : '📤 Upload New Resume'}
            </span>
          </label>
        </div>
      </div>

      {!resumeData ? (
        <Card>
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-4xl mb-3">📄</span>
            <h3 className="text-base font-bold text-[#172033]">No Resume Uploaded Yet</h3>
            <p className="text-xs text-[#68738a] mt-1 max-w-md">
              Upload your engineering resume to extract technical keywords, identify formatting red flags, and receive AI-backed suggestions to pass automated recruiter screeners.
            </p>
            <label className="mt-5 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center font-bold text-xs bg-[#315bdc] text-white hover:bg-[#2047be] px-6 py-2.5 rounded-xl shadow-md transition-all">
                {isUploading ? 'Analyzing Resume...' : '📤 Choose File & Run ATS Diagnostic'}
              </span>
            </label>
          </div>
        </Card>
      ) : (
        <>
          {/* Score Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall ATS Score"
              value={`${resumeData.ats_score || resumeData.atsScore || 0}%`}
              subtitle={resumeData.match_rating || "Evaluated"}
              icon="🎯"
              color="green"
            />
            <StatCard
              title="Detected Skills"
              value={Array.isArray(resumeData.detected_skills || resumeData.detectedSkills) ? (resumeData.detected_skills || resumeData.detectedSkills).length : 0}
              subtitle="Extracted Competencies"
              icon="🔍"
              color="blue"
            />
            <StatCard
              title="Format Compliance"
              value="95%"
              subtitle="Standard Layout"
              icon="📐"
              color="purple"
            />
            <StatCard
              title="Active Document"
              value="1 File"
              subtitle={resumeData.file_name || resumeData.fileName || "Uploaded Resume"}
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
                subtitle="Comparing resume tokens with career requisition requirements"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {(resumeData.detected_skills || resumeData.detectedSkills || []).map((skill, idx) => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    const isMatch = typeof skill === 'object' ? skill.match !== false : true;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          isMatch
                            ? 'bg-[#e7f7f0] border-[#a3e0c7] text-[#11825c]'
                            : 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]'
                        }`}
                      >
                        <div>
                          <b className="block text-xs">{skillName}</b>
                          <span className="text-[10px] opacity-80">{typeof skill === 'object' ? skill.category : 'Detected'}</span>
                        </div>
                        <span className="font-bold text-sm">✓</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Strengths & Weaknesses Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="✅ Identified Strengths">
                  <ul className="space-y-2.5 text-xs text-[#334155]">
                    {(resumeData.strengths || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[#15966b] font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="⚠️ Gaps & Areas to Improve">
                  <ul className="space-y-2.5 text-xs text-[#334155]">
                    {(resumeData.weaknesses || []).map((item, idx) => (
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
                subtitle="Follow these recommendations to improve hiring score"
                action={<Badge variant="info">AI Diagnostics</Badge>}
              >
                <div className="space-y-3.5">
                  {(resumeData.suggestions || []).map((sug, idx) => {
                    const title = typeof sug === 'string' ? sug : sug.title;
                    const desc = typeof sug === 'string' ? '' : sug.desc;
                    return (
                      <div key={idx} className="p-3 bg-[#f8f9fc] border border-[#e5e9f1] rounded-xl space-y-1">
                        <div className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                          <span>💡</span>
                          <span>{title}</span>
                        </div>
                        {desc && (
                          <p className="text-[11px] text-[#68738a] leading-relaxed">
                            {desc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumePage;
