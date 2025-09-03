
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title: string;
  icon: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`bg-[rgba(20,40,20,0.7)] border border-[rgba(74,222,128,0.2)] rounded-2xl p-4 md:p-6 backdrop-blur-md shadow-lg hover:border-[rgba(74,222,128,0.5)] hover:shadow-[0_8px_30px_rgba(74,222,128,0.1)] hover:-translate-y-0.5 transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-green-400">{icon}</div>
        <h2 className="text-md md:text-lg font-semibold text-green-400">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
};