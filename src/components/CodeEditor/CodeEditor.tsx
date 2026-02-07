import Editor, { OnMount } from '@monaco-editor/react';
import { useCallback, useRef, useEffect } from 'react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  onRun?: () => void;
  darkMode?: boolean;
}

export default function CodeEditor({ value, onChange, height = '400px', onRun, darkMode }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const handleChange = useCallback((newValue: string | undefined) => {
    onChange(newValue || '');
  }, [onChange]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

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

  const theme = darkMode ? 'vs-dark' : 'light';

  return (
    <div className="h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      <Editor
        height={height}
        defaultLanguage="python"
        theme={theme}
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
