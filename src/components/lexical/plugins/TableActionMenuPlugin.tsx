"use client";

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical';
import {
  $isTableCellNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableNodeFromLexicalNodeOrThrow,
  $mergeCells,
  $unmergeCell,
  $isTableSelection,
  TableCellNode,
} from '@lexical/table';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

export default function TableActionMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [tableCellNode, setTableCellNode] = useState<TableCellNode | null>(null);

  const updateTableCellNode = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const cell = $getNearestNodeOfType(anchorNode, TableCellNode);
      setTableCellNode(cell);
    } else {
      setTableCellNode(null);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.getEditorState().read(() => {
          updateTableCellNode();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTableCellNode();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
    );
  }, [editor, updateTableCellNode]);

  if (!isEditable || !tableCellNode) {
    return null;
  }

  const domElement = editor.getElementByKey(tableCellNode.getKey());
  if (!domElement) {
    return null;
  }

  const rect = domElement.getBoundingClientRect();

  return createPortal(
    <div
      className="fixed z-[10001] pointer-events-none"
      style={{
        top: rect.top,
        left: rect.left + rect.width - 25,
      }}
    >
      <div className="pointer-events-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-5 w-5 rounded-full bg-white/90 shadow-md border border-slate-200 hover:bg-white text-slate-600 p-0"
            >
              <Settings2 className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-[10002] rounded-xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/90 min-w-[160px]">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs py-2">行列操作</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[10003] rounded-xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/90">
                  <DropdownMenuItem onClick={() => editor.update(() => $insertTableRowAtSelection(false))} className="text-xs py-2">在上方插入行</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.update(() => $insertTableRowAtSelection(true))} className="text-xs py-2">在下方插入行</DropdownMenuItem>
                  <div className="h-px bg-slate-200 my-1" />
                  <DropdownMenuItem onClick={() => editor.update(() => $insertTableColumnAtSelection(false))} className="text-xs py-2">在左侧插入列</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.update(() => $insertTableColumnAtSelection(true))} className="text-xs py-2">在右侧插入列</DropdownMenuItem>
                  <div className="h-px bg-slate-200 my-1" />
                  <DropdownMenuItem onClick={() => editor.update(() => $deleteTableRowAtSelection())} className="text-xs py-2 text-red-600">删除当前行</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.update(() => $deleteTableColumnAtSelection())} className="text-xs py-2 text-red-600">删除当前列</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs py-2">对齐方式</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[10003] rounded-xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/90">
                  <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">垂直对齐</div>
                  <DropdownMenuItem onClick={() => editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      const cell = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                      if (cell) cell.setVerticalAlign('top');
                    }
                  })} className="text-xs py-2">顶部对齐</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      const cell = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                      if (cell) cell.setVerticalAlign('middle');
                    }
                  })} className="text-xs py-2">居中对齐</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                      const cell = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                      if (cell) cell.setVerticalAlign('bottom');
                    }
                  })} className="text-xs py-2">底部对齐</DropdownMenuItem>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">水平对齐</div>
                  <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} className="text-xs py-2">左对齐</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} className="text-xs py-2">居中对齐</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')} className="text-xs py-2">右对齐</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs py-2">合并与尺寸</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[10003] rounded-xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/90">
                  <DropdownMenuItem onClick={() => editor.update(() => {
                    const selection = $getSelection();
                    if ($isTableSelection(selection)) {
                      $mergeCells(selection.getNodes().filter($isTableCellNode));
                    }
                  })} className="text-xs py-2">合并单元格</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.update(() => $unmergeCell())} className="text-xs py-2">拆分单元格</DropdownMenuItem>
                  <div className="h-px bg-slate-200 my-1" />
                  <DropdownMenuItem onClick={() => {
                    const width = prompt('请输入单元格宽度 (单位 px):');
                    if (width) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          const cell = $getNearestNodeOfType(selection.anchor.getNode(), TableCellNode);
                          if (cell) cell.setWidth(parseInt(width));
                        }
                      });
                    }
                  }} className="text-xs py-2">设置单元格宽度</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <div className="h-px bg-slate-200 my-1" />
            <DropdownMenuItem onClick={() => editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const tableNode = $getTableNodeFromLexicalNodeOrThrow(anchorNode);
                if (tableNode) tableNode.remove();
              }
            })} className="text-xs py-2 text-red-600 font-bold">删除整个表格</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>,
    document.body
  );
}
