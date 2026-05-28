"use client";

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  className
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 w-full", className)}>
      <div className="space-y-1">
        <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] pl-14">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
