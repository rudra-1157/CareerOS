import React from 'react';
import { Button } from '../common/Badge';
import { useModal } from '../../context/ModalContext';

const ResourceList = ({ resources = [] }) => {
  const { openModal } = useModal();

  const handleOpenRagModal = () => {
    openModal(
      "RAG Demo",
      "In the full system, PDFs/PPTs are chunked, converted to embeddings and stored in a vector database. Relevant chunks are retrieved before the LLM generates an answer."
    );
  };

  return (
    <div className="bg-white border border-[#e6eaf2] rounded-[15px] p-[20px] shadow-[0_4px_18px_rgba(31,45,75,0.05)] flex flex-col justify-between h-full">
      <div>
        <h3 className="text-[17px] font-[700] text-[#172033] mb-4">Institution Resources</h3>
        <div className="space-y-3">
          {resources.map((res, idx) => (
            <p key={idx} className="m-0 text-[14px] text-[#172033] flex items-center gap-2">
              <span>{res.icon}</span>
              <span>{res.title} — <span className="text-[#68738a]">{res.count}</span></span>
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#f0f3f8]">
        <Button variant="secondary" onClick={handleOpenRagModal} className="w-full sm:w-auto">
          How RAG works
        </Button>
      </div>
    </div>
  );
};

export default ResourceList;
