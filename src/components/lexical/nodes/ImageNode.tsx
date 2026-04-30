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
import { Trash2 } from 'lucide-react';

export interface ImagePayload {
  altText: string;
  caption?: string;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  src: string;
  width?: number;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ altText, height, src, width });
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
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, maxWidth, caption, src, showCaption } =
      serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      src,
      width,
      showCaption,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText);
    element.setAttribute('width', this.__width.toString());
    element.setAttribute('height', this.__height.toString());
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
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption,
      height: this.__height === 'auto' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'auto' ? 0 : this.__width,
    };
  }

  setWidth(width: number | 'auto'): void {
    const writable = this.getWritable();
    writable.__width = width;
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
  nodeKey,
}: {
  src: string;
  altText: string;
  width: 'auto' | number;
  height: 'auto' | number;
  maxWidth: number;
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

  return (
    <div className="relative group my-6 outline-none flex justify-center">
      <div className="relative inline-block">
        <img
          src={src}
          alt={altText}
          ref={imageRef}
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
            <div className="absolute top-4 right-4 flex gap-2 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => {
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if (node !== null) node.remove();
                  });
                }}
                className="p-2 bg-red-500 text-white rounded-xl shadow-xl hover:bg-red-600 transition-colors"
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
    key,
  );
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
