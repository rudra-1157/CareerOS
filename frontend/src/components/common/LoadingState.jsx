import React from 'react';

const LoadingState = ({
  message = 'Loading data...',
  rows = 3,
  type = 'skeleton' // 'spinner' | 'skeleton'
}) => {
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-10 h-10 border-4 border-[#edf2ff] border-t-[#315bdc] rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-[#68738a]">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 items-center p-3 bg-[#f8f9fc] rounded-xl border border-[#edf0f5]">
          <div className="rounded-full bg-[#e2e8f0] h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-[#e2e8f0] rounded w-3/4"></div>
            <div className="h-3 bg-[#e2e8f0] rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
