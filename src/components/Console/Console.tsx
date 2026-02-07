import { useRef, useEffect, useState } from 'react';
import { TestCase, TestResult } from '../../types';

interface ConsoleProps {
  output: string[];
  isLoading?: boolean;
  testCases?: TestCase[];
  onTestCasesChange?: (testCases: TestCase[]) => void;
  problemId?: string;
  resetKey?: number;
  testResults?: TestResult[];
}

function formatTestCasesForEditing(testCases: TestCase[]): string {
  const visibleTests = testCases.filter(tc => !tc.hidden);
  if (visibleTests.length === 0) return '';
  return visibleTests.map((tc, idx) => (
    `# Test ${idx + 1}: ${tc.description}\n` +
    `input: ${tc.input}\n` +
    `expected: ${tc.expected}`
  )).join('\n\n');
}

function parseTestCasesFromText(text: string, originalTestCases: TestCase[]): TestCase[] {
  const hiddenTests = originalTestCases.filter(tc => tc.hidden);

  if (!text.trim()) {
    return hiddenTests;
  }

  const blocks = text.split(/\n\n+/).filter(b => b.trim());

  const parsedTests: TestCase[] = blocks.map((block, idx) => {
    const lines = block.split('\n');
    let description = `Test ${idx + 1}`;
    let input = '';
    let expected = '';

    for (const line of lines) {
      if (line.startsWith('# Test')) {
        const match = line.match(/# Test \d+: (.+)/);
        if (match) description = match[1];
      } else if (line.startsWith('input:')) {
        input = line.replace('input:', '').trim();
      } else if (line.startsWith('expected:')) {
        expected = line.replace('expected:', '').trim();
      }
    }

    return {
      id: String(idx + 1),
      description,
      input,
      expected,
      hidden: false
    };
  }).filter(tc => tc.input && tc.expected);

  return [...parsedTests, ...hiddenTests];
}

export default function Console({
  output,
  isLoading = false,
  testCases,
  onTestCasesChange,
  problemId,
  resetKey = 0,
  testResults
}: ConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'output' | 'results'>('tests');
  const [testCaseText, setTestCaseText] = useState('');
  const lastProblemIdRef = useRef<string | undefined>(undefined);
  const lastResetKeyRef = useRef<number>(0);

  const visibleTestCount = testCases?.filter(tc => !tc.hidden).length ?? 0;
  const hiddenCount = testCases?.filter(tc => tc.hidden).length ?? 0;

  // Reset test case text when problem changes, reset button is clicked, or initial load
  useEffect(() => {
    if (testCases && testCases.length > 0) {
      const problemChanged = problemId !== lastProblemIdRef.current;
      const resetClicked = resetKey !== lastResetKeyRef.current;
      const visibleTests = testCases.filter(tc => !tc.hidden);
      const needsInitialLoad = testCaseText === '' && visibleTests.length > 0;

      if (problemChanged || resetClicked || needsInitialLoad) {
        setTestCaseText(formatTestCasesForEditing(testCases));
        lastProblemIdRef.current = problemId;
        lastResetKeyRef.current = resetKey;
        if (problemChanged) {
          setActiveTab('tests');
        }
      }
    }
  }, [testCases, problemId, resetKey, testCaseText]);

  // Switch to results tab when test results arrive
  useEffect(() => {
    if (testResults && testResults.length > 0) {
      setActiveTab('results');
    }
  }, [testResults]);

  // Switch to output tab when there's new output (only if not showing results)
  useEffect(() => {
    if (output.length > 0 && (!testResults || testResults.length === 0)) {
      setActiveTab('output');
    }
  }, [output, testResults]);

  useEffect(() => {
    if (activeTab === 'output') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, activeTab]);

  const handleTestCaseTextChange = (newText: string) => {
    setTestCaseText(newText);
    if (onTestCasesChange && testCases) {
      const parsed = parseTestCasesFromText(newText, testCases);
      onTestCasesChange(parsed);
    }
  };

  const showTestsTab = testCases && visibleTestCount > 0;
  const passedCount = testResults?.filter(r => r.passed).length ?? 0;
  const totalCount = testResults?.length ?? 0;
  const visibleResults = testResults?.filter(r => !r.hidden) ?? [];

  return (
    <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-500 rounded-lg h-full flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-900">
        <div className="flex">
          {showTestsTab && (
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
                activeTab === 'tests'
                  ? 'text-primary-600 dark:text-primary-300 bg-white dark:bg-dark-800 border-t border-l border-r border-gray-200 dark:border-dark-500 -mb-px'
                  : 'text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100'
              }`}
            >
              Tests ({visibleTestCount})
            </button>
          )}
          <button
            onClick={() => setActiveTab('output')}
            className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
              activeTab === 'output'
                ? 'text-primary-600 dark:text-primary-300 bg-white dark:bg-dark-800 border-t border-l border-r border-gray-200 dark:border-dark-500 -mb-px'
                : 'text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100'
            }`}
          >
            Output
          </button>
          {testResults && testResults.length > 0 && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
                activeTab === 'results'
                  ? 'text-primary-600 dark:text-primary-300 bg-white dark:bg-dark-800 border-t border-l border-r border-gray-200 dark:border-dark-500 -mb-px'
                  : 'text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100'
              }`}
            >
              Results ({passedCount}/{totalCount})
            </button>
          )}
        </div>
        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-dark-200">Running...</span>
          </div>
        )}
      </div>

      {activeTab === 'tests' && showTestsTab ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <textarea
            value={testCaseText}
            onChange={(e) => handleTestCaseTextChange(e.target.value)}
            className="flex-1 p-4 font-mono text-sm bg-dark-900 text-dark-200 resize-none focus:outline-none"
            placeholder="# Test 1: Description&#10;input: your_function(args)&#10;expected: expected_result"
            spellCheck={false}
          />
          {hiddenCount > 0 && (
            <div className="px-4 py-2 bg-dark-800 text-dark-300 text-xs border-t border-dark-500">
              + {hiddenCount} hidden test{hiddenCount > 1 ? 's' : ''} (not editable)
            </div>
          )}
        </div>
      ) : activeTab === 'results' && testResults && testResults.length > 0 ? (
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-500 flex items-center justify-between bg-gray-50 dark:bg-dark-900">
            <span className="font-medium text-gray-900 dark:text-dark-100 text-sm">Test Results</span>
            <span
              className={`text-sm font-medium font-mono ${
                passedCount === totalCount ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
              }`}
            >
              {passedCount}/{totalCount} passed
            </span>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-dark-500">
            {visibleResults.map(result => (
              <div key={result.id} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      result.passed
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {result.passed ? '\u2713' : '\u2717'}
                  </span>
                  <span className="text-gray-700 dark:text-dark-100 text-sm font-medium">
                    Test {result.id}: {result.description}
                  </span>
                </div>

                {!result.passed && (
                  <div className="ml-7 space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-dark-300">Expected: </span>
                      <span className="text-green-600 dark:text-green-400 font-mono">{result.expected}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-dark-300">Actual: </span>
                      <span className="text-red-600 dark:text-red-400 font-mono">{result.actual}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {testResults.some(r => r.hidden) && (
              <div className="p-4 text-gray-500 dark:text-dark-300 text-sm italic">
                + {testResults.filter(r => r.hidden).length} hidden test(s)
                {testResults.filter(r => r.hidden && r.passed).length ===
                testResults.filter(r => r.hidden).length ? (
                  <span className="text-green-600 dark:text-green-400 ml-2">(all passed)</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 ml-2">
                    ({testResults.filter(r => r.hidden && !r.passed).length} failed)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-dark-900 rounded-b-lg">
          {output.length === 0 ? (
            <div className="text-dark-300 italic">
              Output will appear here when you run your code...
            </div>
          ) : (
            output.map((line, index) => (
              <div
                key={index}
                className={`py-0.5 ${
                  line.startsWith('[Error]')
                    ? 'text-red-400'
                    : line.includes('PASSED')
                    ? 'text-green-400'
                    : line.includes('FAILED')
                    ? 'text-red-400'
                    : 'text-dark-200'
                }`}
              >
                {line.startsWith('Test') ? (
                  <span>
                    {line.includes('PASSED') ? '\u2713 ' : line.includes('FAILED') ? '\u2717 ' : ''}
                    {line}
                  </span>
                ) : (
                  <span>&gt; {line}</span>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
