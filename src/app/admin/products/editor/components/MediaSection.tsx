'use client';

import React, { memo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusCircle, Ban, Trash2, GripVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getAssetUrl } from '@/lib/image-utils';

interface MediaSectionProps {
  galleryUrls: string[];
  onUpdateGallery: (urls: string[]) => void;
  onOpenPicker: () => void;
  onMoveItem: (idx: number, dir: 'left' | 'right') => void;
}

const SortableImageCard = memo(({ url, idx, onDelete, onMove }: { 
  url: string; 
  idx: number; 
  onDelete: (idx: number) => void;
  onMove: (idx: number, dir: 'left' | 'right') => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/card relative aspect-[11/9] rounded-[2rem] bg-card/60 border border-border/30 shadow-sm overflow-hidden transform-gpu",
        !isDragging && "transition-[box-shadow,transform,opacity] duration-500",
        isDragging ? "shadow-2xl scale-105 ring-4 ring-primary/20 opacity-90 cursor-grabbing" : "hover:shadow-2xl hover:-translate-y-1"
      )}
    >
      <Image src={getAssetUrl(url)} alt={`Gallery ${idx}`} fill className="object-cover transition-transform duration-1000 group-hover/card:scale-110 rounded-[2rem]" unoptimized />
      
      {/* 底部交互层 (毛玻璃) */}
      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex flex-col items-center justify-end pb-6 z-10 rounded-[2rem]">
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
            onClick={() => onMove(idx, 'left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
            onClick={() => onMove(idx, 'right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-10 w-10 rounded-xl bg-red-500/20 hover:bg-red-500/40 border-red-500/20 text-red-200 backdrop-blur-md"
            onClick={() => onDelete(idx)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 序号标记 */}
      <div className="absolute top-4 left-4 h-8 w-8 rounded-xl bg-black/50 backdrop-blur-md flex items-center justify-center text-white font-headline font-bold text-[10px] shadow-sm z-20 border border-white/10">
        #{idx + 1}
      </div>

      {/* 拖拽手柄 */}
      <div
        className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-card/80 backdrop-blur-xl flex items-center justify-center text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity z-20 shadow-lg border border-border/30 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
});

SortableImageCard.displayName = 'SortableImageCard';

const MediaSection = memo(({
  galleryUrls,
  onUpdateGallery,
  onOpenPicker,
  onMoveItem
}: MediaSectionProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = galleryUrls.indexOf(active.id as string);
      const newIndex = galleryUrls.indexOf(over.id as string);
      onUpdateGallery(arrayMove(galleryUrls, oldIndex, newIndex));
    }
  };

  return (
    <section className="bg-card/60 backdrop-blur-md rounded-[2.5rem] border border-border/30 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative group overflow-hidden min-h-[400px] flex items-center justify-center">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={galleryUrls}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 w-full">
            {galleryUrls.map((url, idx) => (
              <SortableImageCard
                key={url}
                url={url}
                idx={idx}
                onDelete={(i) => { const n = [...galleryUrls]; n.splice(i, 1); onUpdateGallery(n); }}
                onMove={onMoveItem}
              />
            ))}

            <div
              className={cn(
                "aspect-[11/9] rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-500",
                galleryUrls.length < 10
                  ? "bg-muted/10 border-2 border-dashed border-border/30 cursor-pointer hover:bg-primary/[0.03] hover:border-primary/40 group/add"
                  : "bg-muted/20 border-2 border-border/20 cursor-not-allowed opacity-60"
              )}
              onClick={() => galleryUrls.length < 10 && onOpenPicker()}
            >
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                galleryUrls.length < 10
                  ? "bg-muted/30 border border-border/30 group-hover/add:scale-110 group-hover/add:bg-primary group-hover/add:text-white group-hover/add:border-transparent"
                  : "bg-muted/20 text-muted-foreground/30"
              )}>
                {galleryUrls.length < 10 ? <PlusCircle className="h-7 w-7" /> : <Ban className="h-7 w-7" />}
              </div>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                galleryUrls.length < 10 ? "text-muted-foreground/50" : "text-muted-foreground/30"
              )}>
                {galleryUrls.length < 10 ? "添加矩阵资产" : `已达上限 (${galleryUrls.length}/10)`}
              </p>
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
});

MediaSection.displayName = 'MediaSection';

export default MediaSection;
