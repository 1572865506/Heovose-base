"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CascaderOption {
  id: string;
  name: string;
  parentId?: string | null;
  [key: string]: any;
}

interface CascaderSelectProps {
  options: CascaderOption[];
  value?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  getDisplayName?: (option: CascaderOption) => string;
  className?: string;
  triggerClassName?: string;
  allowSelectParent?: boolean;
}

export function CascaderSelect({
  options,
  value,
  onSelect,
  placeholder = "请选择分类",
  getDisplayName,
  className,
  triggerClassName,
  allowSelectParent = true,
}: CascaderSelectProps) {
  const [open, setOpen] = useState(false);
  const [expandedPath, setExpandedPath] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = useCallback(
    (opt: CascaderOption) => (getDisplayName ? getDisplayName(opt) : opt.name),
    [getDisplayName]
  );

  const getChildren = useCallback(
    (parentId: string | null): CascaderOption[] => {
      if (parentId === null) {
        return options.filter(
          (c) => !c.parentId || !options.some((o) => o.id === c.parentId)
        );
      }
      return options.filter((c) => c.parentId === parentId);
    },
    [options]
  );

  const columns = useMemo(() => {
    const cols: { parentId: string | null; items: CascaderOption[] }[] = [];
    const rootItems = getChildren(null);
    cols.push({ parentId: null, items: rootItems });

    for (const expandedId of expandedPath) {
      const children = getChildren(expandedId);
      if (children.length > 0) {
        cols.push({ parentId: expandedId, items: children });
      } else {
        break;
      }
    }
    return cols;
  }, [getChildren, expandedPath]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const selected = options.find((o) => o.id === value);
    if (!selected) return null;
    const path: string[] = [];
    let current: CascaderOption | undefined = selected;
    while (current) {
      path.unshift(displayName(current));
      current = current.parentId
        ? options.find((o) => o.id === current!.parentId)
        : undefined;
    }
    return path.join(" / ");
  }, [value, options, displayName]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedPath([]);
      }
    };
    // 用 setTimeout 延迟绑定，防止当前点击事件被捕获
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleItemHover = useCallback(
    (itemId: string, columnIndex: number) => {
      setExpandedPath((prev) => {
        const newPath = prev.slice(0, columnIndex);
        newPath.push(itemId);
        return newPath;
      });
    },
    []
  );

  const handleItemClick = useCallback(
    (item: CascaderOption, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const children = getChildren(item.id);
      if (children.length === 0 || allowSelectParent) {
        onSelect(item.id);
        setOpen(false);
        setExpandedPath([]);
      }
    },
    [getChildren, allowSelectParent, onSelect]
  );

  const toggleOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => {
      if (prev) setExpandedPath([]);
      return !prev;
    });
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 border rounded-xl bg-white text-left transition-all",
          "hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10",
          open && "border-primary/40 ring-2 ring-primary/10",
          triggerClassName
        )}
      >
        <span className="truncate text-xs font-medium text-slate-700">
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-40 shrink-0 transition-transform duration-200",
            open && "rotate-180 opacity-70"
          )}
        />
      </button>

      {/* 下拉面板 - 纯绝对定位，不使用任何 Portal */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-[9999] flex rounded-2xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden"
          style={{ maxHeight: "320px" }}
          onMouseDown={(e) => {
            // 防止点击面板时触发 Dialog 的外部交互检测
            e.stopPropagation();
          }}
        >
          {columns.map((col, colIndex) => (
            <div
              key={`col-${colIndex}-${col.parentId ?? "root"}`}
              className={cn(
                "min-w-[10rem] max-w-[14rem] flex flex-col overflow-y-auto scrollbar-minimal",
                colIndex > 0 && "border-l border-slate-100"
              )}
            >
              <div className="p-1.5 space-y-0.5">
                {col.items.map((item) => {
                  const hasChildren = getChildren(item.id).length > 0;
                  const isExpanded = expandedPath[colIndex] === item.id;
                  const isSelected = value === item.id;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer select-none transition-colors",
                        isExpanded
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-primary/5 text-slate-700 hover:text-primary",
                        isSelected && !isExpanded && "bg-primary/5 text-primary"
                      )}
                      onMouseEnter={() => handleItemHover(item.id, colIndex)}
                      onClick={(e) => handleItemClick(item, e)}
                    >
                      <span className="truncate flex items-center gap-2">
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary shrink-0" />
                        )}
                        {displayName(item)}
                      </span>
                      {hasChildren && (
                        <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
