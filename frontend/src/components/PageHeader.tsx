import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  label,
  title,
  subtitle,
  className,
}) => {
  return (
    <div className={cn('space-y-1 mb-8 text-left', className)}>
      <span className="block text-xs font-semibold uppercase tracking-[0.32em] text-orange-600 mb-3">
        {label}
      </span>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 text-base text-slate-500 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageHeader;
