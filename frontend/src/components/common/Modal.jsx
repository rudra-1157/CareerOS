import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import Button from './Button';

const Modal = () => {
  const { modalData, closeModal } = useModal();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalData.isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalData.isOpen, closeModal]);

  if (!modalData.isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-lg shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={closeModal}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2.5 pr-6 tracking-tight">
          {modalData.title}
        </h2>

        <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-line max-h-[60vh] overflow-y-auto">
          {modalData.content}
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" size="sm" onClick={closeModal}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
