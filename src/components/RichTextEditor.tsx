"use client";

import React, { forwardRef } from 'react';
import LexicalEditor from './lexical/LexicalEditor';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageClick?: () => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = forwardRef<any, RichTextEditorProps>((props, ref) => {
  return <LexicalEditor {...props} ref={ref} />;
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;