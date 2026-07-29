import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center font-medium transition-colors focus:outline-none';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs rounded-md gap-1',
    md: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    lg: 'px-3 py-1.5 text-sm rounded-lg gap-2',
  };

  const variantStyles = {
    default: 'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    primary: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
    glow: 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]',
  };

  return (
    <span
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
