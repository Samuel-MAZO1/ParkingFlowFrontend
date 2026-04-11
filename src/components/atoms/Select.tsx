import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full bg-slate-800/60 border rounded-xl px-4 py-2.5 text-sm text-slate-100
          outline-none transition-all duration-200 appearance-none cursor-pointer
          focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60
          ${error ? 'border-red-500/60' : 'border-slate-700/60'}
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}