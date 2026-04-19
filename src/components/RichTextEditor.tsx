
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
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
  Link as LinkIcon,
  Eraser
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageClick?: () => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor, onImageClick }: { editor: any, onImageClick?: () => void }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/20 border-b border-border/40 sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center gap-1 pr-2 border-r border-border/40">
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
          title="插入库素材"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 pl-2">
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="h-8 w-8 opacity-40 hover:opacity-100"
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, onImageClick, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto border border-border/20 shadow-lg my-6 mx-auto block',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-full p-6 text-[13px] leading-relaxed',
          'prose-headings:font-headline prose-headings:text-primary prose-headings:mb-4 prose-headings:mt-8',
          'prose-p:mb-4 prose-p:text-muted-foreground/80',
          'prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg',
          'prose-li:text-muted-foreground/80'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content when it changes externally (e.g. from state reset)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={cn("border border-border/40 rounded-xl overflow-hidden bg-white flex flex-col group", className)}>
      <MenuBar editor={editor} onImageClick={onImageClick} />
      <div className="flex-1 overflow-y-auto bg-muted/5 min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
      <div className="px-3 py-1 border-t border-border/10 bg-muted/20 flex justify-between items-center shrink-0 h-6">
        <span className="text-[9px] font-mono text-muted-foreground opacity-40 uppercase tracking-tighter">
          Editor: Tiptap v2 • {editor?.storage.starterKit ? 'Rich Text Mode' : 'Standard'}
        </span>
        <span className="text-[9px] font-bold text-primary/30 uppercase">
          {content.length} characters
        </span>
      </div>
    </div>
  );
}
