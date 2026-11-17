import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  FileText, 
  Users, 
  Building2, 
  Database, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  Server,
  Activity
} from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();
  const [adminData, setAdminData] = useState({
    stats: {
      total_enrolled_students: 1240,
      total_faculty_members: 48,
      system_health: '99.98%',
      rag_indexed_docs: 184,
      partner_companies: 32,
      active_placements: 89,
    },
    department_metrics: [
      { department: 'Computer Science & Engineering', students: 480, readiness: '78%', faculty: 18, status: 'Optimal' },
      { department: 'Information Technology', students: 320, readiness: '75%', faculty: 12, status: 'Optimal' },
      { department: 'AI & Data Science', students: 240, readiness: '82%', faculty: 10, status: 'High Growth' },
      { department: 'Electronics & Telecomm.', students: 200, readiness: '69%', faculty: 8, status: 'Needs Review' },
    ],
    rag_status: {
      vector_store: 'FAISS Index Active',
      embeddings_model: 'text-embedding-004',
      curriculum_docs_indexed: 184,
      last_synced: '10 minutes ago',
    },
    system_audit_logs: [
      { event: 'Curriculum RAG Sync', actor: 'Admin NV', status: 'Success', time: '18:20' },
      { event: 'Batch 2026 Student Onboarding', actor: 'System', status: 'Completed (420 Users)', time: '14:00' },
      { event: 'Company Portal Verification Key Updated', actor: 'Admin NV', status: 'Success', time: 'Yesterday' },
    ],
  });

  const [toast, setToast] = useState('');
  const [isSyncingRag, setIsSyncingRag] = useState(false);

  useEffect(() => {
    adminService.getDashboard().then((res) => {
      if (res) setAdminData(res);
    });
  }, []);

  const handleSyncRag = () => {
    setIsSyncingRag(true);
    setTimeout(() => {
      setIsSyncingRag(false);
      setToast('FAISS Vector Store successfully re-indexed 184 institutional documents.');
      setTimeout(() => setToast(''), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-medium text-slate-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Institutional Command Center • Administrator</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Institutional Overview • {currentUser?.name || 'Dr. Neha Varma'}
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            {currentUser?.degree || 'Dean of Academic & Career Systems'} • {currentUser?.department || 'Institutional Directorate'}
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handleSyncRag}
            disabled={isSyncingRag}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRag ? 'animate-spin' : ''}`} />
            <span>{isSyncingRag ? 'Syncing Embeddings...' : 'Sync Curriculum RAG'}</span>
          </button>
          <button
            onClick={() => {
              setToast('Institution accreditation audit log downloaded.');
              setTimeout(() => setToast(''), 3000);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Audit Report
          </button>
        </div>
      </div>

      {/* High-Level Institutional Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Students</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.total_enrolled_students}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Active enrolled</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Faculty</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.total_faculty_members}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">4 departments</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">System Health</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{adminData.stats.system_health}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">All services online</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">RAG Docs</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.rag_indexed_docs}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">In Vector Store</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Companies</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.partner_companies}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Recruitment partners</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Placements</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{adminData.stats.active_placements}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">Final interview stage</div>
        </div>
      </div>

      {/* Departmental Metrics & RAG Engine Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Departmental Readiness & Health" subtitle="Placement readiness indices and faculty distribution">
            <div className="space-y-3">
              {adminData.department_metrics.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{dept.department}</h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {dept.students} Students • {dept.faculty} Faculty Mentors
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Placement Ready</div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{dept.readiness}</div>
                    </div>
                    <Badge variant={dept.status === 'Optimal' ? 'success' : dept.status === 'High Growth' ? 'info' : 'warning'}>
                      {dept.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Institutional Audit Logs */}
          <Card title="Administrative Audit Trail" subtitle="Immutable system and role action events">
            <div className="space-y-2.5">
              {adminData.system_audit_logs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <strong className="font-semibold text-slate-900 dark:text-white">{log.event}</strong>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">by {log.actor}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{log.status}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: RAG Engine & System Configuration */}
        <div className="space-y-6">
          {/* Institutional RAG Status */}
          <Card title="RAG Vector Engine" subtitle="Syllabus & Curriculum Index">
            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Vector Store:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{adminData.rag_status.vector_store}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Embeddings:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{adminData.rag_status.embeddings_model}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Indexed Docs:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{adminData.rag_status.curriculum_docs_indexed} Documents</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Last Synced:</span>
                <span className="text-slate-600 dark:text-slate-300">{adminData.rag_status.last_synced}</span>
              </div>
            </div>

            <button
              onClick={handleSyncRag}
              disabled={isSyncingRag}
              className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {isSyncingRag ? 'Syncing In Progress...' : 'Force Embeddings Refresh'}
            </button>
          </Card>

          {/* Quick Administration Controls */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold mb-1">Admin Operations</h3>
            <p className="text-xs text-slate-400 mb-4">Institutional controls & configuration</p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setToast('Onboarding wizard launched for Batch 2027.');
                  setTimeout(() => setToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer border border-slate-700/60"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Bulk Onboard Student Batch
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setToast('Recruiter partner access key generated.');
                  setTimeout(() => setToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer border border-slate-700/60"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Issue Recruiter Access Key
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setToast('System backup archived to secure storage.');
                  setTimeout(() => setToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer border border-slate-700/60"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  Backup Institutional Database
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
