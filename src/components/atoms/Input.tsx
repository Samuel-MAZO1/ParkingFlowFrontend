import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-sm text-slate-100
            placeholder:text-slate-600 outline-none transition-all duration-200
            focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60
            ${error ? 'border-red-500/60 focus:ring-red-500/30' : 'border-slate-700/60'}
            ${leftIcon ? 'pl-9' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}