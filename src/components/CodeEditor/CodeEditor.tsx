import Editor from '@monaco-editor/react';
import { useCallback } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export default function CodeEditor({ value, onChange, height = '400px' }: CodeEditorProps) {
  const handleChange = useCallback((newValue: string | undefined) => {
    onChange(newValue || '');
  }, [onChange]);

  return (
    <div className="border border-dark-700 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="python"
        theme="vs-dark"
        value={value}
        onChange={handleChange}
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
