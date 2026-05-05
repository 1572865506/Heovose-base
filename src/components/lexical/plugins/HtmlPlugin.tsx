import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $insertNodes, $getRoot } from 'lexical';
import { useEffect, useRef } from 'react';

interface HtmlPluginProps {
  initialHtml?: string;
  onHtmlChange?: (html: string) => void;
}

export default function HtmlPlugin({ initialHtml, onHtmlChange }: HtmlPluginProps) {
  const [editor] = useLexicalComposerContext();

  const isFirstRender = useRef(true);
  const lastHtmlRef = useRef(initialHtml);

  useEffect(() => {
    if (initialHtml === undefined) return;
    
    // Only update if the incoming initialHtml is different from what we last handled
    // and if it's either the first render or a significant external change
    if (initialHtml !== lastHtmlRef.current || isFirstRender.current) {
      isFirstRender.current = false;
      
      // Use a timeout to push the update to the next task queue,
      // avoiding the "flushSync inside lifecycle" error.
      setTimeout(() => {
        editor.update(() => {
          const currentHtml = $generateHtmlFromNodes(editor);
          if (initialHtml !== currentHtml) {
            const parser = new DOMParser();
            const dom = parser.parseFromString(initialHtml || '', 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            $getRoot().clear();
            $insertNodes(nodes);
            lastHtmlRef.current = initialHtml;
          }
        });
      }, 0);
    }
  }, [editor, initialHtml]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }: any) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        if (onHtmlChange && html !== lastHtmlRef.current) {
          lastHtmlRef.current = html;
          onHtmlChange(html);
        }
      });
    });
  }, [editor, onHtmlChange]);

  return null;
}
