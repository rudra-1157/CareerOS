import React from 'react';
import { FileText, GitBranch, BarChart3, Map, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useModal } from '../../context/ModalContext';

const IntelligenceGrid = ({ data }) => {
  const { openModal } = useModal();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Resume Analysis */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resume Analysis</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs my-2 leading-relaxed">
            {data.resume.subtitle}
          </p>
          <Badge variant="success">
            {data.resume.badge}
          </Badge>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openModal(data.resume.modalTitle, data.resume.modalText)}
            className="w-full text-xs"
          >
            View Analysis
          </Button>
        </div>
      </div>

      {/* GitHub Intelligence */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">GitHub Intelligence</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs my-2 leading-relaxed">
            {data.github.subtitle}
          </p>
          <Badge variant="success">
            {data.github.badge}
          </Badge>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => openModal(data.github.modalTitle, data.github.modalText)}
            className="w-full text-xs"
          >
            View Analysis
          </Button>
        </div>
      </div>

      {/* Skill Gap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skill Gap Matrix</h3>
          </div>
          <div className="space-y-1.5 my-2 text-xs text-slate-700 dark:text-slate-300">
            {data.skillGap.items.map((item, idx) => (
              <p key={idx} className="m-0 flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">{item.skill}</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">{item.priority}</span>
              </p>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => openModal(data.skillGap.modalTitle, data.skillGap.modalText)}
            className="w-full text-xs"
          >
            Analyze Gaps
          </Button>
        </div>
      </div>

      {/* Personalized Roadmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personalized Roadmap</h3>
          </div>
          <div className="space-y-1 my-2 text-xs text-slate-600 dark:text-slate-300">
            {data.roadmap.items.map((stepStr, idx) => (
              <p key={idx} className="m-0 py-0.5 truncate">
                {stepStr}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => openModal(data.roadmap.modalTitle, data.roadmap.modalText)}
            className="w-full text-xs"
          >
            View Roadmap
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceGrid;
