import Editor, { OnMount } from '@monaco-editor/react';
import { useCallback, useRef, useEffect, useState } from 'react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  onRun?: () => void;
  darkMode?: boolean;
}

export default function CodeEditor({ value, onChange, height = '400px', onRun, darkMode }: CodeEditorProps) {
  const [editorReady, setEditorReady] = useState(false);
  const [editorError, setEditorError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import('../../lib/monaco').then(() => { if (!cancelled) setEditorReady(true); })
      .catch(() => { if (!cancelled) setEditorError(true); });
    return () => { cancelled = true; };
  }, []);
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

  if (!editorReady) return <div role="status" className="p-4 text-gray-500 dark:text-dark-200">{editorError ? 'The editor could not load. Refresh to retry; your saved code is preserved.' : 'Loading editor…'}</div>;

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
          editContext: false,
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
