import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';

interface AdminFormSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminFormSection({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className
}: AdminFormSectionProps) {
  return (
    <GlassCard className={cn("p-0 overflow-hidden", className)}>
      <div className="p-8 border-b border-border/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/5">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-primary/70 shrink-0" />}
            <span>{title}</span>
          </h3>
          {subtitle && (
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest pl-6">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      <div className="p-8 space-y-6">
        {children}
      </div>
    </GlassCard>
  );
}
