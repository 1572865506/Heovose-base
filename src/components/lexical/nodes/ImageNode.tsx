import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import { DecoratorNode, CLICK_COMMAND, COMMAND_PRIORITY_LOW, KEY_DELETE_COMMAND, KEY_BACKSPACE_COMMAND, $getNodeByKey } from 'lexical';
import * as React from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import { Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export interface ImagePayload {
  altText: string;
  caption?: string;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  src: string;
  width?: number;
  alignment?: 'left' | 'center' | 'right';
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const altText = domNode.getAttribute('alt') || '';
    const src = domNode.getAttribute('src') || '';
    const width = domNode.width;
    const height = domNode.height;
    
    // Read alignment from custom data-align attribute or classes
    let alignment: 'left' | 'center' | 'right' = 'center';
    const alignAttr = domNode.getAttribute('data-align');
    if (alignAttr === 'left' || alignAttr === 'center' || alignAttr === 'right') {
      alignment = alignAttr;
    } else if (domNode.classList.contains('align-left')) {
      alignment = 'left';
    } else if (domNode.classList.contains('align-right')) {
      alignment = 'right';
    }

    const node = $createImageNode({ altText, height, src, width, alignment });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    caption?: string;
    height?: number;
    maxWidth?: number;
    showCaption?: boolean;
    src: string;
    width?: number;
    alignment?: 'left' | 'center' | 'right';
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText: string;
  __width: 'auto' | number;
  __height: 'auto' | number;
  __maxWidth: number;
  __showCaption: boolean;
  __caption: string;
  __alignment: 'left' | 'center' | 'right';

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__alignment,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, caption, src, showCaption, alignment } =
      serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
      showCaption,
      alignment: alignment || 'center',
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
    element.setAttribute('data-align', this.__alignment);
    
    // Coherent alignment classes compatible with standard HTML output & Tailwind
    if (this.__alignment === 'left') {
      element.className = 'align-left my-6 mr-auto block';
    } else if (this.__alignment === 'right') {
      element.className = 'align-right my-6 ml-auto block';
    } else {
      element.className = 'align-center my-6 mx-auto block';
    }
    
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'auto' | number,
    height?: 'auto' | number,
    showCaption?: boolean,
    caption?: string,
    alignment?: 'left' | 'center' | 'right',
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || 'auto';
    this.__height = height || 'auto';
    this.__showCaption = showCaption || false;
    this.__caption = caption || '';
    this.__alignment = alignment || 'center';
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption,
      height: this.__height === 'auto' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      alignment: this.__alignment,
      type: 'image',
      version: 1,
      width: this.__width === 'auto' ? 0 : this.__width,
    };
  }

  setWidth(width: number | 'auto'): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  getAlignment(): 'left' | 'center' | 'right' {
    return this.__alignment;
  }

  setAlignment(alignment: 'left' | 'center' | 'right'): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'contents';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  decorate(): React.ReactNode {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          width={this.__width}
          height={this.__height}
          maxWidth={this.__maxWidth}
          alignment={this.__alignment}
          nodeKey={this.__key}
        />
      </Suspense>
    );
  }
}

function ImageComponent({
  src,
  altText,
  width,
  height,
  maxWidth,
  alignment,
  nodeKey,
}: {
  src: string;
  altText: string;
  width: 'auto' | number;
  height: 'auto' | number;
  maxWidth: number;
  alignment: 'left' | 'center' | 'right';
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState(false);
  const [localWidth, setLocalWidth] = useState<number | 'auto'>(width);
  const imageRef = useRef<HTMLImageElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Sync local width if external width changes
  useEffect(() => {
    setLocalWidth(width);
  }, [width]);

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node !== null) {
            node.remove();
          }
        });
      }
      return false;
    },
    [editor, isSelected, nodeKey],
  );

  const onResizeStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsResizing(true);
    
    const startX = event.clientX;
    const startWidth = imageRef.current?.offsetWidth || 0;
    let currentWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      currentWidth = Math.max(100, startWidth + deltaX);
      setLocalWidth(currentWidth); // Fast local update
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Final sync to Lexical (Heavy update once)
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setWidth(currentWidth);
        }
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [editor, nodeKey]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;
          if (event.target === imageRef.current) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, onDelete, setSelected]);

  // Native HTML5 Drag and Drop Handlers for dragging node within contenteditable
  const onDragStart = (event: React.DragEvent) => {
    if (isResizing) {
      event.preventDefault();
      return;
    }
    event.stopPropagation(); // Prevent Lexical core from intercepting and blocking drag
    event.dataTransfer.setData('application/x-lexical-drag', nodeKey);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnd = (event: React.DragEvent) => {
    // Drop/Move is handled by DragDropNodePlugin in LexicalEditor
  };

  return (
    <div 
      className={cn(
        "relative group my-6 outline-none flex",
        alignment === 'left' && "justify-start",
        alignment === 'center' && "justify-center",
        alignment === 'right' && "justify-end"
      )}
    >
      <div className="relative inline-block">
        <img
          src={getAssetUrl(src)}
          alt={altText}
          ref={imageRef}
          draggable={true}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          style={{
            height: height === 0 ? 'auto' : height,
            maxWidth: '100%',
            width: localWidth === 0 ? 'auto' : localWidth,
          }}
          className={cn(
            "rounded-2xl border transition-all duration-300 block cursor-pointer",
            isSelected 
              ? "ring-4 ring-primary ring-offset-4 border-primary scale-[1.01] shadow-2xl" 
              : "border-white/20 shadow-lg group-hover:scale-[1.01]"
          )}
        />
        
        {isSelected && (
          <>
            {/* Top Toolbar: Alignment & Deletion buttons */}
            <div className="absolute top-4 right-4 flex gap-2 animate-in fade-in zoom-in duration-200 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
              {/* Align Left */}
              <button
                type="button"
                onClick={() => {
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isImageNode(node)) {
                      node.setAlignment('left');
                    }
                  });
                }}
                className={cn(
                  "p-2 text-white rounded-xl transition-colors hover:bg-white/10",
                  alignment === 'left' ? "bg-primary text-white" : "text-white/60"
                )}
                title="左对齐"
              >
                <AlignLeft className="h-4 w-4" />
              </button>

              {/* Align Center */}
              <button
                type="button"
                onClick={() => {
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isImageNode(node)) {
                      node.setAlignment('center');
                    }
                  });
                }}
                className={cn(
                  "p-2 text-white rounded-xl transition-colors hover:bg-white/10",
                  alignment === 'center' ? "bg-primary text-white" : "text-white/60"
                )}
                title="居中对齐"
              >
                <AlignCenter className="h-4 w-4" />
              </button>

              {/* Align Right */}
              <button
                type="button"
                onClick={() => {
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isImageNode(node)) {
                      node.setAlignment('right');
                    }
                  });
                }}
                className={cn(
                  "p-2 text-white rounded-xl transition-colors hover:bg-white/10",
                  alignment === 'right' ? "bg-primary text-white" : "text-white/60"
                )}
                title="右对齐"
              >
                <AlignRight className="h-4 w-4" />
              </button>

              {/* Separator */}
              <div className="w-px bg-white/10 self-stretch my-1" />

              {/* Delete Image */}
              <button
                type="button"
                onClick={() => {
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if (node !== null) node.remove();
                  });
                }}
                className="p-2 bg-red-500 text-white rounded-xl shadow-xl hover:bg-red-600 transition-colors"
                title="删除图片"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={onResizeStart}
              className={cn(
                "absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full cursor-nwse-resize shadow-lg border-2 border-white flex items-center justify-center transition-transform hover:scale-125 z-10",
                isResizing && "scale-125 ring-4 ring-primary/20"
              )}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60" />
            </div>
          </>
        )}
        
        {!isSelected && (
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 800,
  src,
  width,
  showCaption,
  caption,
  alignment,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(
    src,
    altText,
    maxWidth,
    width,
    height,
    showCaption,
    caption,
    alignment,
    key,
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
