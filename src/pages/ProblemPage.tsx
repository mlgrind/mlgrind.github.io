import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Split from 'react-split';
import { getProblemById } from '../data/problems';
import { sections } from '../data/sections';
import { useProgress } from '../context/ProgressContext';
import { usePyodide } from '../hooks/usePyodide';
import CodeEditor from '../components/CodeEditor/CodeEditor';
import Console from '../components/Console/Console';
import ProblemDescription from '../components/ProblemView/ProblemDescription';
import Examples from '../components/ProblemView/Examples';
import Hints from '../components/ProblemView/Hints';
import SEO from '../components/SEO/SEO';
import { TestResult, TestCase } from '../types';
import SuccessBanner from '../components/SuccessBanner/SuccessBanner';
import { useDarkMode } from '../hooks/useDarkMode';

export default function ProblemPage() {
  const { sectionId, problemId } = useParams<{ sectionId: string; problemId: string }>();
  const { getProblemProgress, saveProblemCode, updateProblemStatus } = useProgress();
  const { isLoading, isReady, output, runTests, clearOutput } = usePyodide();

  const problem = problemId ? getProblemById(problemId) : undefined;
  const section = sections.find(s => s.id === sectionId);

  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [editableTestCases, setEditableTestCases] = useState<TestCase[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => !localStorage.getItem('ml-lab-shortcut-hint-dismissed')
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const wasCompletedRef = useRef(false);
  const [descriptionTab, setDescriptionTab] = useState<'description' | 'examples' | 'hints'>('description');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');
  const { isDark } = useDarkMode();

  // Load saved code or starter code
  useEffect(() => {
    if (problem && sectionId) {
      const savedProgress = getProblemProgress(sectionId, problem.id);
      setCode(savedProgress.code || problem.starterCode);
      setEditableTestCases(problem.testCases);
      setDescriptionTab('description');
    }
  }, [problem, sectionId, getProblemProgress]);

  // Track if problem was already completed to prevent repeat celebrations
  useEffect(() => {
    if (problem && sectionId) {
      const savedProgress = getProblemProgress(sectionId, problem.id);
      wasCompletedRef.current = savedProgress.status === 'completed';
    }
  }, [problem?.id, sectionId, getProblemProgress]);

  // Auto-save code
  useEffect(() => {
    if (code && problem && sectionId && code !== problem.starterCode) {
      const timer = setTimeout(() => {
        saveProblemCode(sectionId, problem.id, code);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code, problem, sectionId, saveProblemCode]);

  // Auto-dismiss shortcut hint after 10 seconds
  useEffect(() => {
    if (showShortcutHint) {
      const timer = setTimeout(() => {
        setShowShortcutHint(false);
        localStorage.setItem('ml-lab-shortcut-hint-dismissed', 'true');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showShortcutHint]);

  const dismissShortcutHint = useCallback(() => {
    setShowShortcutHint(false);
    localStorage.setItem('ml-lab-shortcut-hint-dismissed', 'true');
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleReset = useCallback(() => {
    if (problem) {
      const hasChanges = code !== problem.starterCode;
      if (!hasChanges || window.confirm('Reset your code? Your changes will be lost.')) {
        setCode(problem.starterCode);
        setTestResults([]);
        setEditableTestCases(problem.testCases);
        setResetKey(k => k + 1);
        clearOutput();
      }
    }
  }, [problem, code, clearOutput]);

  const extractFunctionName = (starterCode: string): string => {
    const matches = [...starterCode.matchAll(/def\s+(\w+)\s*\(/g)];
    return matches.length > 0 ? matches[matches.length - 1][1] : 'solution';
  };

  const handleRunTests = useCallback(async () => {
    if (!problem || !isReady || !sectionId) return;

    setIsRunning(true);
    setTestResults([]);

    try {
      const functionName = extractFunctionName(problem.starterCode);
      const results = await runTests(code, editableTestCases, functionName);
      setTestResults(results);

      const allPassed = results.every(r => r.passed);
      if (allPassed) {
        updateProblemStatus(sectionId, problem.id, 'completed');
        if (!wasCompletedRef.current) {
          setShowCelebration(true);
          wasCompletedRef.current = true;
        }
      }
    } finally {
      setIsRunning(false);
    }
  }, [problem, isReady, sectionId, code, editableTestCases, runTests, updateProblemStatus]);

  if (!problem || !section) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-4">Problem Not Found</h1>
        <Link to="/" className="text-primary-500 hover:text-primary-400">
          Return to Home
        </Link>
      </div>
    );
  }

  // Find prev/next problems in section
  const currentIndex = section.problems.indexOf(problem.id);
  const prevProblemId = currentIndex > 0 ? section.problems[currentIndex - 1] : undefined;
  const nextProblemId = section.problems[currentIndex + 1];

  // Create description from first paragraph of problem description
  const problemDescriptionText = problem.description
    .replace(/[#*`]/g, '')
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 2)
    .join(' ')
    .substring(0, 155);

  const shortcutHintEl = showShortcutHint ? (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-dark-800 dark:bg-dark-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-dark-800 dark:bg-dark-600 rotate-45" />
      <span>Pro tip: </span>
      <span className="font-medium">Shift+Enter</span>
      <span> runs tests</span>
      <button
        onClick={dismissShortcutHint}
        className="ml-2 text-gray-400 hover:text-white underline"
      >
        Got it
      </button>
    </div>
  ) : null;

  const actionBar = (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-500">
      <div className="flex items-center gap-2">
        <button
          onClick={handleRunTests}
          disabled={!isReady || isRunning}
          className="px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
        <span className="text-xs text-gray-400 dark:text-dark-300">or</span>
        <div className="relative">
          <div className="flex items-center gap-1 text-gray-500 dark:text-dark-200">
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-dark-600 border border-gray-300 dark:border-dark-500 rounded shadow-sm">Shift</kbd>
            <span className="text-xs">+</span>
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-dark-600 border border-gray-300 dark:border-dark-500 rounded shadow-sm">Enter</kbd>
          </div>
          {shortcutHintEl}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {testResults.length > 0 && testResults.every(r => r.passed) && nextProblemId && (
          <Link
            to={`/problem/${sectionId}/${nextProblemId}`}
            className="px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Next Problem &rarr;
          </Link>
        )}
        <button
          onClick={() => setIsEditorMaximized(!isEditorMaximized)}
          className="px-4 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
          title={isEditorMaximized ? 'Restore layout' : 'Maximize editor'}
        >
          {isEditorMaximized ? '\u229f Restore' : '\u229e Maximize'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -m-6">
      <SEO
        title={`${problem.title} - ${section.title}`}
        description={`${problemDescriptionText}... Practice this ${problem.difficulty} ML coding problem with instant feedback.`}
        canonical={`/problem/${sectionId}/${problemId}`}
        keywords={`${problem.title}, ${section.title}, machine learning, coding practice, ${problem.difficulty}`}
      />
      <SuccessBanner show={showCelebration} onDismiss={() => setShowCelebration(false)} />
      {/* Problem Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-500">
        <div className="flex items-center gap-3">
          <Link
            to={`/section/${sectionId}`}
            className="text-gray-500 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 transition-colors"
          >
            &larr; {section.title}
          </Link>
          <span className="text-gray-300 dark:text-dark-500">/</span>
          <span className="text-gray-900 dark:text-dark-100 font-medium">{problem.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Problem Navigation */}
          <div className="flex items-center gap-1">
            {prevProblemId ? (
              <Link
                to={`/problem/${sectionId}/${prevProblemId}`}
                className="px-2 py-1 text-sm text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 rounded transition-colors"
              >
                &larr; Prev
              </Link>
            ) : (
              <span className="px-2 py-1 text-sm text-gray-300 dark:text-dark-400 cursor-default">&larr; Prev</span>
            )}
            <span className="text-xs text-gray-400 dark:text-dark-300 font-mono">
              ({currentIndex + 1}/{section.problems.length})
            </span>
            {nextProblemId ? (
              <Link
                to={`/problem/${sectionId}/${nextProblemId}`}
                className="px-2 py-1 text-sm text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 rounded transition-colors"
              >
                Next &rarr;
              </Link>
            ) : (
              <span className="px-2 py-1 text-sm text-gray-300 dark:text-dark-400 cursor-default">Next &rarr;</span>
            )}
          </div>

          <span className="text-gray-300 dark:text-dark-500">|</span>

          {!isReady && (
            <span className="text-gray-500 dark:text-dark-200 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              {isLoading ? 'Loading Python...' : 'Python ready'}
            </span>
          )}
          {isReady && (
            <span className="text-gray-500 dark:text-dark-200 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full" />
              Python ready
            </span>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-dark-800">
          {/* Mobile Tab Switcher */}
          <div className="flex border-b border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-900">
            <button
              onClick={() => setMobileTab('problem')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors ${
                mobileTab === 'problem'
                  ? 'text-primary-600 dark:text-primary-300 border-b-2 border-primary-500 bg-white dark:bg-dark-800'
                  : 'text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100'
              }`}
            >
              Problem
            </button>
            <button
              onClick={() => setMobileTab('code')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-center transition-colors ${
                mobileTab === 'code'
                  ? 'text-primary-600 dark:text-primary-300 border-b-2 border-primary-500 bg-white dark:bg-dark-800'
                  : 'text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100'
              }`}
            >
              Code
            </button>
          </div>

          {mobileTab === 'problem' ? (
            <div className="flex-1 overflow-y-auto p-4">
              <ProblemDescription problem={problem} />
              <Examples examples={problem.examples} />
              <Hints hints={problem.hints} solution={problem.solution} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Action Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-500">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunTests}
                    disabled={!isReady || isRunning}
                    className="px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isRunning ? 'Running...' : 'Run Tests'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                  >
                    Reset
                  </button>
                </div>
                {testResults.length > 0 && testResults.every(r => r.passed) && nextProblemId && (
                  <Link
                    to={`/problem/${sectionId}/${nextProblemId}`}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    Next &rarr;
                  </Link>
                )}
              </div>
              {/* Editor */}
              <div className="flex-[3] overflow-hidden p-2">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  height="100%"
                  onRun={handleRunTests}
                  darkMode={isDark}
                />
              </div>
              {/* Console */}
              <div className="flex-[2] overflow-auto p-2 space-y-2 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-dark-500">
                <Console
                  output={output}
                  isLoading={isRunning}
                  testCases={editableTestCases}
                  onTestCasesChange={setEditableTestCases}
                  problemId={problemId}
                  resetKey={resetKey}
                  testResults={testResults}
                />
              </div>
            </div>
          )}
        </div>
      ) : isEditorMaximized ? (
        /* Maximized Layout - Editor and Console side by side */
        <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-dark-800">
          {actionBar}

          <Split
            className="flex flex-1 overflow-hidden"
            sizes={[60, 40]}
            minSize={200}
            gutterSize={8}
            gutterAlign="center"
          >
            <div className="h-full overflow-hidden p-4">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                height="100%"
                onRun={handleRunTests}
                darkMode={isDark}
              />
            </div>

            <div className="overflow-auto p-4 bg-gray-50 dark:bg-dark-900">
              <Console
                output={output}
                isLoading={isRunning}
                testCases={editableTestCases}
                onTestCasesChange={setEditableTestCases}
                problemId={problemId}
                resetKey={resetKey}
                testResults={testResults}
              />
            </div>
          </Split>
        </div>
      ) : (
        /* Normal Layout - Problem description on left, Editor/Console stacked on right */
        <Split
          className="flex flex-1 overflow-hidden"
          sizes={[40, 60]}
          minSize={300}
          gutterSize={8}
          gutterAlign="center"
        >
          {/* Left Panel - Tabbed Problem Description */}
          <div className="problem-panel flex flex-col overflow-hidden bg-gray-50 dark:bg-dark-900 min-w-0">
            {/* Tab Bar */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-800 px-4 shrink-0">
              <button
                onClick={() => setDescriptionTab('description')}
                className={`whitespace-nowrap shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  descriptionTab === 'description'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-300'
                    : 'border-transparent text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100 hover:border-gray-300 dark:hover:border-dark-400'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setDescriptionTab('examples')}
                className={`whitespace-nowrap shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  descriptionTab === 'examples'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-300'
                    : 'border-transparent text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100 hover:border-gray-300 dark:hover:border-dark-400'
                }`}
              >
                Examples
              </button>
              <button
                onClick={() => setDescriptionTab('hints')}
                className={`whitespace-nowrap shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  descriptionTab === 'hints'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-300'
                    : 'border-transparent text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100 hover:border-gray-300 dark:hover:border-dark-400'
                }`}
              >
                Hints & Solution
              </button>
            </div>
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
              {descriptionTab === 'description' && (
                <ProblemDescription problem={problem} />
              )}
              {descriptionTab === 'examples' && (
                <div>
                  <Examples examples={problem.examples} />
                </div>
              )}
              {descriptionTab === 'hints' && (
                <div>
                  <Hints hints={problem.hints} solution={problem.solution} onLoadToEditor={setCode} />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Editor and Console */}
          <div className="flex flex-col overflow-hidden bg-white dark:bg-dark-800">
            {actionBar}

            <Split
              className="flex-1 overflow-hidden"
              direction="vertical"
              sizes={[60, 40]}
              minSize={100}
              gutterSize={8}
            >
              <div className="h-full overflow-hidden p-4">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  height="100%"
                  onRun={handleRunTests}
                  darkMode={isDark}
                />
              </div>

              <div className="overflow-auto p-4 bg-gray-50 dark:bg-dark-900">
                <Console
                  output={output}
                  isLoading={isRunning}
                  testCases={editableTestCases}
                  onTestCasesChange={setEditableTestCases}
                  problemId={problemId}
                  resetKey={resetKey}
                  testResults={testResults}
                />
              </div>
            </Split>
          </div>
        </Split>
      )}
    </div>
  );
}
