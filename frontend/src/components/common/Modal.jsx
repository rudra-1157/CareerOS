import React from 'react';
import { useModal } from '../../context/ModalContext';
import Button from './Button';

const Modal = () => {
  const { modalData, closeModal } = useModal();

  if (!modalData.isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5 animate-fadeIn"
      onClick={closeModal}
    >
      <div 
        className="bg-white rounded-[16px] p-6 w-full max-w-[560px] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-5 right-5 border-0 rounded-full w-[30px] height-[30px] flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 cursor-pointer text-xl font-bold transition-all"
          onClick={closeModal}
          aria-label="Close Modal"
        >
          ×
        </button>

        <h2 className="text-[22px] font-[700] text-[#172033] mb-3">
          {modalData.title}
        </h2>

        <p className="text-[#68738a] text-[15px] leading-[1.6] mb-6 whitespace-pre-line">
          {modalData.content}
        </p>

        <div className="flex justify-end">
          <Button variant="primary" onClick={closeModal}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
