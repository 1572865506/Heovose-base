"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { CodeNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { 
  DROP_COMMAND,
  DRAGOVER_COMMAND,
  $getNodeByKey,
  $insertNodes,
  $getRoot,
  $getNearestNodeFromDOMNode,
  COMMAND_PRIORITY_HIGH,
  EditorState
} from 'lexical';

import { LexicalTheme } from './LexicalTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ImagesPlugin, { INSERT_IMAGE_COMMAND } from './plugins/ImagesPlugin';
import TableActionMenuPlugin from './plugins/TableActionMenuPlugin';
import { ImageNode } from './nodes/ImageNode';
import HtmlPlugin from './plugins/HtmlPlugin';
import { Button } from '@/components/ui/button';
import { Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LexicalEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageClick?: () => void;
  placeholder?: string;
  className?: string;
}

const dragDropStyle = `
  /* Smooth transition for block elements when they slide down */
  [contenteditable="true"] > * {
    transition: margin-top 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  /* Pushes target block down to create space for the placeholder */
  .drag-drop-target {
    margin-top: 180px !important;
    position: relative !important;
  }
  
  /* Renders a beautiful dashed blue outline box in the created gap */
  .drag-drop-target::before {
    content: '释放以将图片放置在此处';
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    position: absolute;
    top: -170px;
    left: 0;
    right: 0;
    height: 160px;
    border: 2px dashed rgba(59, 130, 246, 0.5);
    background-color: rgba(59, 130, 246, 0.04);
    border-radius: 16px;
    z-index: 10;
    pointer-events: none;
    box-shadow: inset 0 0 12px rgba(59, 130, 246, 0.08);
    animation: glow-pulse-border 1.5s infinite ease-in-out;
  }
  
  @keyframes glow-pulse-border {
    0% { border-color: rgba(59, 130, 246, 0.4); background-color: rgba(59, 130, 246, 0.02); }
    50% { border-color: rgba(59, 130, 246, 0.8); background-color: rgba(59, 130, 246, 0.06); }
    100% { border-color: rgba(59, 130, 246, 0.4); background-color: rgba(59, 130, 246, 0.02); }
  }
`;

const LexicalEditor = forwardRef<any, LexicalEditorProps>(({ 
  content, 
  onChange, 
  onImageClick, 
  placeholder = "Enter text...", 
  className 
}, ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialConfig = React.useMemo(() => ({
    namespace: `HeovoseEditor-${Math.random().toString(36).substring(7)}`,
    theme: LexicalTheme,
    onError: (error: Error) => {
      console.error(error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      ImageNode,
      CodeNode,
      HorizontalRuleNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
  }), []);

  // Expose editor methods to parent (like Tiptap)
  useImperativeHandle(ref, () => ({
    editor: {
      commands: {
        setImage: ({ src }: { src: string }) => {
          if (editorInstance) {
            editorInstance.dispatchCommand(INSERT_IMAGE_COMMAND, {
              src,
              altText: 'Product image',
            });
          }
        },
        setContent: (html: string) => {
          // Handled by HtmlPlugin's initialHtml if needed, 
          // but for dynamic updates we might need a command
        }
      }
    }
  }));

  // Fullscreen Esc key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Prevent body scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const onEditorChange = useCallback((html: string) => {
    onChange(html);
  }, [onChange]);

  const editorUI = (
    <div className={cn(
      "border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col group relative shadow-sm transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-[9999] rounded-none border-none h-screen w-screen" : className
    )}>
      <style dangerouslySetInnerHTML={{ __html: dragDropStyle }} />
      
      <ToolbarPlugin 
        onImageClick={onImageClick} 
        isFullscreen={isFullscreen} 
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} 
      />

      {isFullscreen && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-[10000] rounded-2xl shadow-2xl bg-slate-900 text-white hover:bg-slate-800 gap-2 px-4 h-12 border-none transition-all active:scale-95 animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <Minimize2 className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">退出全屏编辑</span>
        </Button>
      )}

      <div className={cn(
        "flex-1 overflow-y-auto scrollbar-minimal relative transition-colors duration-500",
        isFullscreen ? "bg-slate-100/50 p-4 md:p-12" : "bg-white min-h-[500px]"
      )}>
        <div className={cn(
          "transition-all duration-500 ease-in-out",
          isFullscreen ? "max-w-[1200px] mx-auto bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-2xl min-h-full w-full border border-slate-200/50" : "h-full w-full"
        )}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="outline-none min-h-full p-8 max-w-none text-[14px] leading-relaxed font-body prose prose-lg dark:prose-invert" 
                spellCheck={false}
              />
            }
            placeholder={
              <div className="absolute top-8 left-8 text-slate-300 pointer-events-none text-xs italic">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>

      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <HorizontalRulePlugin />
      <TablePlugin hasCellMerge={true} />
      <TableActionMenuPlugin />
      <ImagesPlugin />
      <HtmlPlugin initialHtml={content} onHtmlChange={onEditorChange} />
      <DragDropNodePlugin />
      <CharCountPlugin onChange={setCharCount} />
      
      {/* Capturing editor instance for imperative handle */}
      <EditorCapturePlugin onInstance={setEditorInstance} />

      <div className={cn(
        "px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0 h-8",
        !isFullscreen && "rounded-b-2xl"
      )}>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">
            Lexical Framework • Hardware Optimized
          </span>
          {isFullscreen && (
            <span className="text-[9px] font-bold text-[#36578D]/60 uppercase tracking-widest animate-pulse">
              Press ESC to exit fullscreen
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase">
          {charCount} chars
        </span>
      </div>
    </div>
  );

  if (!isMounted) return null;
  
  const editorComposer = (
    <LexicalComposer initialConfig={initialConfig}>
      {editorUI}
    </LexicalComposer>
  );

  return isFullscreen ? createPortal(editorComposer, document.body) : editorComposer;
});

// Helper plugin to capture editor instance
function EditorCapturePlugin({ onInstance }: { onInstance: (editor: any) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onInstance(editor);
  }, [editor, onInstance]);
  return null;
}

// Custom plugin to handle decorator node drag and drop
function DragDropNodePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const unregisterDragOver = editor.registerCommand(
      DRAGOVER_COMMAND,
      (event: DragEvent) => {
        const types = event.dataTransfer?.types;
        // Convert DOMStringList/Array safely for all browsers
        const hasCustomDrag = types && Array.from(types).includes('application/x-lexical-drag');
        if (hasCustomDrag) {
          event.preventDefault();
          
          // Draw dynamic drop visual indicator line
          const target = event.target as HTMLElement;
          if (target) {
            const editorElement = editor.getRootElement();
            if (editorElement) {
              let current: HTMLElement | null = target;
              let blockElement: HTMLElement | null = null;
              while (current && current !== editorElement) {
                if (current.parentElement === editorElement) {
                  blockElement = current;
                  break;
                }
                current = current.parentElement;
              }
              
              if (blockElement) {
                // Clear any other indicator lines first
                document.querySelectorAll('.drag-drop-target').forEach(el => el.classList.remove('drag-drop-target'));
                // Set indicator line to the block boundaries we are hovering
                blockElement.classList.add('drag-drop-target');
              }
            }
          }
          
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    const unregisterDrop = editor.registerCommand(
      DROP_COMMAND,
      (event: DragEvent) => {
        const nodeKey = event.dataTransfer?.getData('application/x-lexical-drag');
        if (nodeKey) {
          event.preventDefault();
          
          const targetBlockEl = document.querySelector('.drag-drop-target');
          
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
              if (targetBlockEl) {
                // Use official Lexical API to get nearest node from DOM block element safely
                const targetNode = $getNearestNodeFromDOMNode(targetBlockEl);
                if (targetNode && targetNode !== node && targetNode.getParent() !== null) {
                  node.remove();
                  targetNode.insertBefore(node);
                  return;
                }
              }
              // Fallback
              node.remove();
              $insertNodes([node]);
            }
          });
          
          // Cleanup indicator lines
          document.querySelectorAll('.drag-drop-target').forEach(el => el.classList.remove('drag-drop-target'));
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    );

    // Global cleanup listeners for safety (in case drag cancels)
    const handleDragEndGlobal = () => {
      document.querySelectorAll('.drag-drop-target').forEach(el => el.classList.remove('drag-drop-target'));
    };
    window.addEventListener('dragend', handleDragEndGlobal);
    window.addEventListener('drop', handleDragEndGlobal);

    return () => {
      unregisterDragOver();
      unregisterDrop();
      window.removeEventListener('dragend', handleDragEndGlobal);
      window.removeEventListener('drop', handleDragEndGlobal);
    };
  }, [editor]);
  return null;
}

// Custom plugin to calculate logical character count
function CharCountPlugin({ onChange }: { onChange: (count: number) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }: { editorState: EditorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent();
        onChange(text.trim().length);
      });
    });
  }, [editor, onChange]);
  return null;
}

LexicalEditor.displayName = 'LexicalEditor';

export default LexicalEditor;
