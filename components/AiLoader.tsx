import React from 'react';

export const AiLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-24 text-green-400">
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-grow-stem" />
        <path d="M12 11C12 11 15 9 17 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-unfurl-leaf-right" style={{ transformOrigin: '12px 11px' }} />
        <path d="M12 11C12 11 9 9 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="animate-unfurl-leaf-left" style={{ transformOrigin: '12px 11px' }} />
    </svg>
    <p className="mt-2 text-sm text-green-400/80 animate-pulse">Analizando cultivo...</p>
  </div>
);
