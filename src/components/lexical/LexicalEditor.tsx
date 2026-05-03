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
    // Simple char count from HTML (could be more precise with Lexical state)
    setCharCount(html.replace(/<[^>]*>/g, '').length);
  }, [onChange]);

  const editorUI = (
    <div className={cn(
      "border border-slate-200 rounded-2xl overflow-hidden bg-white flex flex-col group relative shadow-sm transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-[9999] rounded-none border-none h-screen w-screen" : className
    )}>
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
          isFullscreen ? "max-w-5xl mx-auto bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-2xl min-h-full w-full border border-slate-200/50" : "h-full w-full"
        )}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="outline-none min-h-full p-8 max-w-none text-[12px] leading-relaxed font-body" 
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

LexicalEditor.displayName = 'LexicalEditor';

export default LexicalEditor;
