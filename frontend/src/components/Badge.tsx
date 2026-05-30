import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  className = '' 
}) => {
  const styles = {
    primary: 'bg-orange-50 text-orange-700 border-orange-200/50',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/50',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/50',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
