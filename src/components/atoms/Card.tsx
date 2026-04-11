import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false }: CardProps) {
  return (
    <div
      className={`
        bg-slate-900/80 border border-slate-800/60 rounded-2xl
        backdrop-blur-sm transition-all duration-300
        ${glow ? 'shadow-[0_0_40px_rgba(20,184,166,0.08)] hover:shadow-[0_0_60px_rgba(20,184,166,0.15)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}