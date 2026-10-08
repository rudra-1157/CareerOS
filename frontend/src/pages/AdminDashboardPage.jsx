import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      setToast('FAISS Vector Store successfully re-indexed 184 institutional documents!');
      setTimeout(() => setToast(''), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#10b981] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <span>✓</span> {toast}
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1633] via-[#15234c] to-[#1e3470] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            🛡️ Institutional Command Center • Administrator
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Institutional Overview • {currentUser?.name || 'Dr. Neha Varma'}
          </h2>
          <p className="text-blue-100/80 text-sm mt-1 max-w-xl">
            {currentUser?.degree || 'Dean of Academic & Career Systems'} • {currentUser?.department || 'Institutional Directorate'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSyncRag}
            disabled={isSyncingRag}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>{isSyncingRag ? '🔄' : '⚡'}</span>
            <span>{isSyncingRag ? 'Syncing Embeddings...' : 'Sync Curriculum RAG'}</span>
          </button>
          <button
            onClick={() => {
              setToast('Institution accreditation audit log downloaded.');
              setTimeout(() => setToast(''), 3000);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            📋 Audit Report
          </button>
        </div>
      </div>

      {/* High-Level Institutional Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Students</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{adminData.stats.total_enrolled_students}</div>
          <div className="text-[11px] text-[#10b981] font-semibold mt-1">Active enrolled</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Faculty</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{adminData.stats.total_faculty_members}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">4 departments</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">System Health</div>
          <div className="text-2xl font-extrabold text-[#10b981] mt-1">{adminData.stats.system_health}</div>
          <div className="text-[11px] text-[#10b981] font-semibold mt-1">All services online</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">RAG Docs</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{adminData.stats.rag_indexed_docs}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">In Vector Store</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Companies</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{adminData.stats.partner_companies}</div>
          <div className="text-[11px] text-[#10b981] font-semibold mt-1">Recruitment partners</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Placements</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">{adminData.stats.active_placements}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">In final interview stage</div>
        </div>
      </div>

      {/* Departmental Metrics & RAG Engine Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#e3e8f3] shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-[#172033]">Departmental Readiness & Health</h3>
                <p className="text-xs text-[#68738a]">Placement readiness indices and faculty distribution</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                Audited Today
              </span>
            </div>

            <div className="space-y-3">
              {adminData.department_metrics.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#eaf0fa] hover:border-indigo-200 transition-colors bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">{dept.department}</h4>
                    <div className="text-xs text-[#68738a] mt-1">
                      {dept.students} Students • {dept.faculty} Faculty Mentors
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-[#68738a]">Placement Ready</div>
                      <div className="text-sm font-bold text-blue-700">{dept.readiness}</div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        dept.status === 'Optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dept.status === 'High Growth'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {dept.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Audit Logs */}
          <div className="bg-white p-5 rounded-2xl border border-[#e3e8f3] shadow-xs">
            <h3 className="text-base font-bold text-[#172033] mb-1">Administrative Audit Trail</h3>
            <p className="text-xs text-[#68738a] mb-4">Immutable system and role action events</p>

            <div className="space-y-2.5">
              {adminData.system_audit_logs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <span className="font-semibold text-gray-900">{log.event}</span>
                      <span className="text-gray-500 ml-2">by {log.actor}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-medium">{log.status}</span>
                    <span className="text-gray-400 font-mono">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: RAG Engine & System Configuration */}
        <div className="space-y-6">
          {/* Institutional RAG Status */}
          <div className="bg-white p-5 rounded-2xl border border-[#e3e8f3] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">⚡</span>
              <div>
                <h3 className="text-sm font-bold text-[#172033]">RAG Vector Engine</h3>
                <p className="text-[11px] text-[#68738a]">Syllabus & Curriculum Index</p>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-gray-100">
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Vector Store:</span>
                <span className="font-semibold text-gray-800">{adminData.rag_status.vector_store}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Embeddings:</span>
                <span className="font-mono text-gray-800">{adminData.rag_status.embeddings_model}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Indexed Syllabus Docs:</span>
                <span className="font-semibold text-emerald-600">{adminData.rag_status.curriculum_docs_indexed} Documents</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Last Synced:</span>
                <span className="text-gray-600">{adminData.rag_status.last_synced}</span>
              </div>
            </div>

            <button
              onClick={handleSyncRag}
              disabled={isSyncingRag}
              className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              {isSyncingRag ? 'Syncing In Progress...' : 'Force Embeddings Refresh'}
            </button>
          </div>

          {/* Quick Administration Controls */}
          <div className="bg-gradient-to-br from-[#101a3b] to-[#1e2f5e] text-white p-5 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold mb-1">Admin Operations</h3>
            <p className="text-xs text-blue-200/80 mb-4">Institutional controls & configuration</p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setToast('Onboarding wizard launched for Batch 2027.');
                  setTimeout(() => setToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer"
              >
                <span>👥 Bulk Onboard Student Batch</span>
                <span>→</span>
              </button>
              <button
                onClick={() => {
                  setToast('Recruiter partner access key generated.');
                  setTimeout(() => setToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer"
              >
                <span>🏢 Issue Recruiter Access Key</span>
                <span>→</span>
              </button>
              <button
                onClick={() => {
                  setToast('System backup archived to secure storage.');
                  setTimeout(() => setToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer"
              >
                <span>💾 Backup Institutional Database</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
