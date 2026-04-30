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

  useEffect(() => {
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
  }, [editor, initialHtml]);

  const lastHtmlRef = useRef(initialHtml);

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
