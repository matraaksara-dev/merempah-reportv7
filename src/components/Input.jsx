import React from 'react';

/**
 * Reusable Input Component dengan integrasi style Tailwind.
 */
export function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  error = '',
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2.5 bg-slate-900/60 border rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200
          ${error 
            ? 'border-rose-500/50 focus:ring-rose-500/30' 
            : 'border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/20'
          }`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-400 mt-1">{error}</span>
      )}
    </div>
  );
}
