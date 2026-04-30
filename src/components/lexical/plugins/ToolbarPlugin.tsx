import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $getRoot,
  $isRangeSelection,
  $createParagraphNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { mergeRegister } from '@lexical/utils';
import React, { useCallback, useEffect, useState } from 'react';
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
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
  Minimize2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface ToolbarPluginProps {
  onImageClick?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function ToolbarPlugin({
  onImageClick,
  isFullscreen,
  onToggleFullscreen
}: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isHeadingNode(element)) {
          setBlockType(element.getTag());
        } else {
          setBlockType(element.getType());
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  return (
    <div className={cn(
      "flex items-center bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-10 transition-all duration-500",
      isFullscreen ? "h-16 px-4 shadow-sm" : "min-h-[48px] px-2 py-1 rounded-t-2xl"
    )}>
      <div className={cn(
        "flex items-center gap-0.5 w-full overflow-x-auto scrollbar-none",
        isFullscreen ? "max-w-5xl mx-auto" : "flex-wrap"
      )}>
        {/* History */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-slate-200/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            disabled={!canUndo}
            className="h-8 w-8 text-slate-600 hover:bg-slate-100/50"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            disabled={!canRedo}
            className="h-8 w-8 text-slate-600 hover:bg-slate-100/50"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Block Type */}
        <div className="flex items-center gap-1 px-2 border-r border-slate-200/60">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100/50">
                <Type className="h-3.5 w-3.5 text-[#36578D]" />
                {blockType === 'h1' ? 'H1 Headline' : 
                 blockType === 'h2' ? 'H2 Title' : 
                 blockType === 'h3' ? 'H3 Subtitle' : 'Paragraph'}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl border-white/20 shadow-2xl backdrop-blur-xl bg-white/90">
              <DropdownMenuItem onClick={() => formatHeading('h1')} className="text-xs font-headline font-bold py-2">H1 Main Headline</DropdownMenuItem>
              <DropdownMenuItem onClick={() => formatHeading('h2')} className="text-xs font-headline font-bold py-2">H2 Section Title</DropdownMenuItem>
              <DropdownMenuItem onClick={() => formatHeading('h3')} className="text-xs font-headline font-bold py-2">H3 Subsection</DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () => $createParagraphNode());
                }
              })} className="text-xs py-2">Normal Text</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Basic Styles */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-200/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            className={cn("h-8 w-8 hover:bg-slate-100/50", isBold && 'bg-[#5F33CC]/10 text-[#5F33CC]')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            className={cn("h-8 w-8 hover:bg-slate-100/50", isItalic && 'bg-[#5F33CC]/10 text-[#5F33CC]')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
            className={cn("h-8 w-8 hover:bg-slate-100/50", isUnderline && 'bg-[#5F33CC]/10 text-[#5F33CC]')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists & Alignment */}
        <div className="flex items-center gap-0.5 px-2 border-r border-slate-200/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={formatBulletList}
            className={cn("h-8 w-8 hover:bg-slate-100/50", blockType === 'bullet' && 'bg-[#36578D]/10 text-[#36578D]')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={formatNumberedList}
            className={cn("h-8 w-8 hover:bg-slate-100/50", blockType === 'number' && 'bg-[#36578D]/10 text-[#36578D]')}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={formatQuote}
            className={cn("h-8 w-8 ml-1 hover:bg-slate-100/50", blockType === 'quote' && 'bg-[#5F33CC]/10 text-[#5F33CC]')}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r border-slate-200/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
            className="h-8 w-8 hover:bg-slate-100/50"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
            className="h-8 w-8 hover:bg-slate-100/50"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
            className="h-8 w-8 hover:bg-slate-100/50"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Images & Media */}
        <div className="flex items-center gap-1 px-2 border-r border-slate-200/60">
          <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' })}
          className="h-8 w-8 text-slate-600 hover:bg-slate-100/50"
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onImageClick}
          className="h-8 w-8 text-purple-600 hover:bg-purple-50"
          title="Insert Image from Library"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        </div>

        {/* Fullscreen */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className={cn(
              "h-8 w-8 transition-all duration-300",
              isFullscreen ? "bg-[#36578D] text-white rounded-lg shadow-lg" : "text-slate-400 hover:text-[#36578D]"
            )}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
