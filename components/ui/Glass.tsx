import React from 'react';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high'; // Kept for API compatibility, but mapped to solid styles
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassProps> = ({ 
  children, 
  className = '', 
  hoverEffect = false,
  ...props 
}) => {
  // Linear style: Solid white background, subtle border, tight radius (md), minimal shadow
  const baseClasses = "bg-surface rounded-md border border-border shadow-card transition-all duration-200";
  
  const hoverClasses = hoverEffect 
    ? "hover:border-slate-300 hover:shadow-subtle cursor-pointer" 
    : "";

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const base = "px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Black background, white text, subtle hover lift
    primary: "bg-primary text-white hover:bg-slate-800 shadow-sm active:translate-y-px",
    // Transparent, dark text, hover light grey
    ghost: "bg-transparent text-secondary hover:text-primary hover:bg-slate-100",
    // White bg, border, dark text
    outline: "bg-white border border-border text-primary hover:bg-slate-50 shadow-sm"
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode, color?: string }> = ({ children, color = 'bg-slate-100 text-slate-600' }) => (
  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border border-transparent ${color}`}>
    {children}
  </span>
);