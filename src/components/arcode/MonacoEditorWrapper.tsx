"use client";

import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useArcodeContext } from '@/hooks/useArcodeContext';

interface MonacoEditorWrapperProps {
  fileId: string;
  initialContent: string;
  language: string;
}

const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({ fileId, initialContent, language }) => {
  const { updateFileContent } = useArcodeContext();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editorInstance;
    // You can configure monaco environment here if needed
    // Example: monaco.languages.typescript.javascriptDefaults.setCompilerOptions(...)
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateFileContent(fileId, value);
    }
  };

  // Update editor content if fileId or initialContent changes externally (e.g., switching tabs)
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== initialContent) {
      editorRef.current.setValue(initialContent);
    }
  }, [fileId, initialContent]);

  return (
    <Editor
      height="100%"
      language={language}
      value={initialContent}
      theme="vs" // or "vs-dark"
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: true },
        fontSize: 13,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true, // Important for resizable panels
      }}
    />
  );
};

export default MonacoEditorWrapper;
