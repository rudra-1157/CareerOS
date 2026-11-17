import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Target,
  Search,
  Layout,
  FileCode,
  Lightbulb,
  Award,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { careerService } from '../services/api';
import { useCareer } from '../context/CareerContext';
import { useModal } from '../context/ModalContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Toast from '../components/common/Toast';
import EmptyState from '../components/common/EmptyState';

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
        setToastMessage(`Resume "${file.name}" parsed successfully. ATS score: ${res.data.ats_score}%.`);
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

      {/* ─── Hero Banner ─────────────────────────────────────────────────── */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-800/60 text-xs font-medium text-blue-300">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>ATS Diagnostic Engine</span>
            <span className="text-slate-400">•</span>
            <span>{resumeData ? (resumeData.match_rating || resumeData.matchRating) : "No Resume Configured"}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            AI Resume Analysis & ATS Diagnostic
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Upload your resume document (PDF, DOCX, or TXT) to benchmark keyword density, layout compliance, and competency alignment against campus hiring algorithms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <span className="inline-flex items-center justify-center font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer gap-2">
              <UploadCloud className="w-4 h-4" />
              {isUploading ? 'Analyzing Document...' : 'Upload Resume File'}
            </span>
          </label>
        </div>
      </div>

      {!resumeData ? (
        <Card>
          <EmptyState
            icon={FileText}
            title="No Resume Uploaded Yet"
            description="Upload your engineering resume to extract technical keywords, identify formatting issues, and receive ATS optimization recommendations."
            actionText={isUploading ? "Processing Document..." : "Select File for Diagnostic"}
            onAction={() => document.querySelector('input[type="file"]')?.click()}
          />
        </Card>
      ) : (
        <>
          {/* Score Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall ATS Score"
              value={`${resumeData.ats_score || resumeData.atsScore || 0}%`}
              subtitle={resumeData.match_rating || "Evaluated"}
              icon={Target}
              color="emerald"
            />
            <StatCard
              title="Detected Skills"
              value={Array.isArray(resumeData.detected_skills || resumeData.detectedSkills) ? (resumeData.detected_skills || resumeData.detectedSkills).length : 0}
              subtitle="Extracted Competencies"
              icon={Search}
              color="blue"
            />
            <StatCard
              title="Format Compliance"
              value="95%"
              subtitle="Standard Layout"
              icon={Layout}
              color="indigo"
            />
            <StatCard
              title="Active Document"
              value="1 Document"
              subtitle={resumeData.file_name || resumeData.fileName || "Uploaded Resume"}
              icon={FileCode}
              color="neutral"
            />
          </div>

          {/* Main Grid: Parsed Breakdown vs Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Parsed Skills & Strengths/Weaknesses */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Parsed Skills Keyword Matrix */}
              <Card
                title="Extracted Competencies & Keyword Mapping"
                subtitle="Comparing document tokens with institutional role benchmarks"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {(resumeData.detected_skills || resumeData.detectedSkills || []).map((skill, idx) => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    const isMatch = typeof skill === 'object' ? skill.match !== false : true;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                          isMatch
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                        }`}
                      >
                        <div>
                          <strong className="block text-xs font-semibold">{skillName}</strong>
                          <span className="text-[10px] opacity-75">{typeof skill === 'object' ? skill.category : 'Detected'}</span>
                        </div>
                        {isMatch ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <X className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Strengths & Weaknesses Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Identified Strengths">
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {(resumeData.strengths || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Identified Gaps & Optimization Areas">
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {(resumeData.weaknesses || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
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
                title="Actionable ATS Recommendations"
                subtitle="System suggestions to pass candidate screening filters"
                action={<Badge variant="info" size="sm">Diagnostics</Badge>}
              >
                <div className="space-y-3">
                  {(resumeData.suggestions || []).map((sug, idx) => {
                    const title = typeof sug === 'string' ? sug : sug.title;
                    const desc = typeof sug === 'string' ? '' : sug.desc;
                    return (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{title}</span>
                        </div>
                        {desc && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
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
