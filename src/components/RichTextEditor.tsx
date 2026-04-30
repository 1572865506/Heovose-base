"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  ImageIcon,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run()
      },
    } as any
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageClick?: () => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({
  editor,
  onImageClick,
  isFullscreen,
  onToggleFullscreen
}: {
  editor: any,
  onImageClick?: () => void,
  isFullscreen: boolean,
  onToggleFullscreen: () => void
}) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/20 border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm">
      {/* Font & Size */}
      <div className="flex items-center gap-2 pr-2 border-r border-border/40">
        <Select
          value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
          onValueChange={(val) => editor.chain().focus().setFontFamily(val).run()}
        >
          <SelectTrigger className="h-8 w-[110px] text-[10px] font-bold bg-white border-none shadow-none">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            <SelectItem value="Inter" className="text-xs">Inter (Default)</SelectItem>
            <SelectItem value="Space Grotesk" className="text-xs font-headline">Space Grotesk</SelectItem>
            <SelectItem value="monospace" className="text-xs font-mono">Monospace</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={editor.getAttributes('textStyle').fontSize || '12px'}
          onValueChange={(val) => editor.chain().focus().setFontSize(val).run()}
        >
          <SelectTrigger className="h-8 w-[70px] text-[10px] font-bold bg-white border-none shadow-none">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent className="rounded-lg">
            {['10px', '12px', '14px', '16px', '18px', '20px', '24px'].map(size => (
              <SelectItem key={size} value={size} className="text-xs">{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Basic Styles */}
      <div className="flex items-center gap-1 px-2 border-r border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8", editor.isActive('bold') && 'bg-primary/10 text-primary')}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8", editor.isActive('italic') && 'bg-primary/10 text-primary')}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("h-8 w-8", editor.isActive('underline') && 'bg-primary/10 text-primary')}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1 px-2 border-r border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn("h-8 w-8", editor.isActive({ textAlign: 'left' }) && 'bg-primary/10 text-primary')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn("h-8 w-8", editor.isActive({ textAlign: 'center' }) && 'bg-primary/10 text-primary')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn("h-8 w-8", editor.isActive({ textAlign: 'right' }) && 'bg-primary/10 text-primary')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn("h-8 w-8", editor.isActive({ textAlign: 'justify' }) && 'bg-primary/10 text-primary')}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* Headers & Lists */}
      <div className="flex items-center gap-1 px-2 border-r border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("h-8 w-8", editor.isActive('heading', { level: 3 }) && 'bg-primary/10 text-primary')}
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8", editor.isActive('bulletList') && 'bg-primary/10 text-primary')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8", editor.isActive('orderedList') && 'bg-primary/10 text-primary')}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Blocks & Images */}
      <div className="flex items-center gap-1 px-2 border-r border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("h-8 w-8", editor.isActive('blockquote') && 'bg-primary/10 text-primary')}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onImageClick}
          className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/5"
          title="Insert Image from Gallery"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* History */}
      <div className="flex items-center gap-1 pl-2 pr-2 border-r border-border/40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Fullscreen Toggle */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className={cn(
            "h-8 w-8 transition-colors",
            isFullscreen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
          )}
          title={isFullscreen ? "退出全屏" : "全屏编辑"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="h-8 w-8 opacity-40 hover:opacity-100"
          title="清除所有样式"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const RichTextEditor = forwardRef<any, RichTextEditorProps>(({ content, onChange, onImageClick, placeholder, className }, ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto border border-border/20 shadow-lg my-6 mx-auto block',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-full p-6 text-[12px] leading-relaxed',
          'prose-headings:font-headline prose-headings:text-primary prose-headings:mb-4 prose-headings:mt-8',
          'prose-p:mb-4 prose-p:text-muted-foreground/80',
          'prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg',
          'prose-li:text-muted-foreground/80 prose-ul:list-disc prose-ol:list-decimal'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Expose editor instance to parent
  useImperativeHandle(ref, () => ({
    editor
  }));

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

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

  return (
    <div className={cn(
      "border border-border/40 rounded-2xl overflow-hidden bg-white flex flex-col group relative shadow-sm transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-[200] rounded-none border-none h-screen w-screen" : className
    )}>
      <MenuBar
        editor={editor}
        onImageClick={onImageClick}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {isFullscreen && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-[300] rounded-2xl shadow-2xl bg-slate-900 text-white hover:bg-slate-800 gap-2 px-4 h-12 border-none transition-all active:scale-95 animate-in fade-in slide-in-from-top-4 duration-500"
        >
          <Minimize2 className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">退出全屏编辑</span>
        </Button>
      )}

      <div className={cn(
        "flex-1 overflow-y-auto scrollbar-minimal",
        isFullscreen ? "bg-muted/10 p-12" : "bg-muted/5 min-h-[500px]"
      )}>
        <div className={cn(
          "transition-all duration-500",
          isFullscreen ? "max-w-4xl mx-auto bg-white shadow-2xl rounded-sm min-h-full" : "h-full"
        )}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>

      <div className="px-3 py-1 border-t border-border/10 bg-muted/20 flex justify-between items-center shrink-0 h-6">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-muted-foreground opacity-40 uppercase tracking-tighter">
            Tiptap Editor v2.x • HTML Enabled
          </span>
          {isFullscreen && (
            <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest animate-pulse">
              按 ESC 键可快速退出全屏
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold text-primary/30 uppercase">
          {content.length} chars
        </span>
      </div>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;