import Editor, { OnMount } from '@monaco-editor/react';
import { useCallback, useRef, useEffect } from 'react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  onRun?: () => void;
}

export default function CodeEditor({ value, onChange, height = '400px', onRun }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const onRunRef = useRef(onRun);

  // Keep the ref updated with latest onRun callback
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const handleChange = useCallback((newValue: string | undefined) => {
    onChange(newValue || '');
  }, [onChange]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Add Shift+Enter keybinding to run tests
    editor.addAction({
      id: 'run-tests',
      label: 'Run Tests',
      keybindings: [monaco.KeyMod.Shift | monaco.KeyCode.Enter],
      run: () => {
        if (onRunRef.current) {
          onRunRef.current();
        }
      },
    });
  }, []);

  return (
    <div className="h-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <Editor
        height={height}
        defaultLanguage="python"
        theme="light"
        value={value}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}
