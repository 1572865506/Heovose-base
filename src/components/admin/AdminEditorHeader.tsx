"use client";

import React, { ReactNode, memo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminEditorHeaderProps {
  title: string;
  icon: LucideIcon;
  onSave?: () => void;
  isSaving?: boolean;
  saveText?: string;
  customBackUrl?: string;
  middleContent?: ReactNode;
  rightExtraActions?: ReactNode;
  className?: string;
  onBack?: () => void;
}

export const AdminEditorHeader = memo(({
  title,
  icon: Icon,
  onSave,
  isSaving = false,
  saveText = "确认应用修改",
  customBackUrl,
  middleContent,
  rightExtraActions,
  className,
  onBack
}: AdminEditorHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (customBackUrl) {
      router.push(customBackUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between sticky top-[-40px] -mt-10 z-50 bg-card/90 backdrop-blur-xl py-3 border border-border/40 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-2xl px-6 relative mb-8 w-full gap-4",
      className
    )}>
      {/* 左侧：返回 + 标题 */}
      <div className="flex items-center gap-3 shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className="rounded-2xl h-10 w-10 hover:bg-muted/40 hover:text-foreground transition-all duration-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-headline font-bold text-foreground tracking-tight flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0">
            <Icon className="h-4.5 w-4.5" />
          </div>
          <span>{title}</span>
        </h2>
      </div>

      {/* 中间插槽区（常用于分类筛选、唯一标识、状态显示等） */}
      {middleContent && (
        <div className="flex items-center gap-6 flex-1 min-w-0 max-w-2xl justify-center">
          {middleContent}
        </div>
      )}

      {/* 右侧操作区 */}
      <div className="flex items-center gap-4 shrink-0">
        {rightExtraActions}
        {onSave && (
          <Button 
            onClick={onSave} 
            disabled={isSaving} 
            className="h-10 rounded-xl px-6 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isSaving ? "正在同步..." : saveText}
          </Button>
        )}
      </div>
    </div>
  );
});

AdminEditorHeader.displayName = "AdminEditorHeader";
