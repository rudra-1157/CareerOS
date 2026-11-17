import React from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import Button from '../common/Button';
import { useModal } from '../../context/ModalContext';

const ResourceList = ({ resources = [] }) => {
  const { openModal } = useModal();

  const handleOpenRagModal = () => {
    openModal(
      "RAG Architecture & Document Retrieval",
      "In CareerOS, institutional syllabus documents, lecture notes, and reference materials are chunked, converted to vector embeddings, and indexed in FAISS. When a student asks a query, relevant document chunks are retrieved to ground the response in verified college curriculum."
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Institution Resources</h3>
        </div>
        <div className="space-y-3">
          {resources.map((res, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
              <span className="font-medium text-slate-800 dark:text-slate-200">{res.title}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">{res.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={handleOpenRagModal} className="w-full text-xs">
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
          How RAG Works
        </Button>
      </div>
    </div>
  );
};

export default ResourceList;
