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
import { TestResult, TestCase, Language } from '../types';
import SuccessBanner from '../components/SuccessBanner/SuccessBanner';
import { useDarkMode } from '../hooks/useDarkMode';
import ShareChallenge from '../components/Share/ShareChallenge';
import { track, trackOnce } from '../lib/analytics';
import { functionNameOf } from '../lib/pythonProgram';
import { readStorage, writeStorage } from '../lib/storage';
import { useAIFeedback } from '../hooks/useAIFeedback';

// The solution track (NumPy or PyTorch) is remembered across problems.
const LANGUAGE_KEY = 'ml-lab-language';
const LANGUAGES: Language[] = ['numpy', 'pytorch'];
const LANGUAGE_LABELS: Record<Language, string> = { numpy: 'NumPy', pytorch: 'PyTorch' };

export default function ProblemPage() {
  const { sectionId, problemId } = useParams<{ sectionId: string; problemId: string }>();
  const { getProblemProgress, saveProblemCode, updateProblemStatus, storageError, syncError } = useProgress();
  const { isLoading, isReady, output, runTests, clearOutput, stop, error, retry } = usePyodide();

  const problem = problemId ? getProblemById(problemId) : undefined;
  const section = sections.find(s => s.id === sectionId);
  const activeProblemRef = useRef(problem?.id);
  activeProblemRef.current = problem?.id;

  const [language, setLanguage] = useState<Language>(() =>
    readStorage(LANGUAGE_KEY) === 'pytorch' ? 'pytorch' : 'numpy'
  );
  // Problems without a PyTorch track always use NumPy.
  const activeLanguage: Language = language === 'pytorch' && problem?.pytorch ? 'pytorch' : 'numpy';
  // Starter code, solution, tests and hints of the active track.
  const variant = activeLanguage === 'pytorch' && problem?.pytorch ? problem.pytorch : problem;
  const variantHints = (activeLanguage === 'pytorch' && problem?.pytorch?.hints) || problem?.hints || [];

  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [editableTestCases, setEditableTestCases] = useState<TestCase[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [showShortcutHint, setShowShortcutHint] = useState(
    () => !readStorage('ml-lab-shortcut-hint-dismissed')
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const wasCompletedRef = useRef(false);
  const [descriptionTab, setDescriptionTab] = useState<'description' | 'examples' | 'hints'>('description');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');
  const { isDark } = useDarkMode();
  const { feedback: aiFeedback, isLoading: aiFeedbackLoading, error: aiFeedbackError, requestFeedback, clearFeedback } = useAIFeedback();

  // `getProblemProgress` is re-created on every progress write. Keep it in a ref so
  // the loader effect below can read the latest value without listing it as a
  // dependency -- otherwise saving progress (which happens right after a passing
  // run) would re-run the effect and wipe the test results the user just earned.
  const getProblemProgressRef = useRef(getProblemProgress);
  useEffect(() => {
    getProblemProgressRef.current = getProblemProgress;
  }, [getProblemProgress]);

  // Load saved code or starter code. Runs only when navigating to another
  // problem or switching between the NumPy and PyTorch tracks.
  const loadedProblemRef = useRef<string | null>(null);
  useEffect(() => {
    stop();
    setIsRunning(false);
    if (problem && variant && sectionId) {
      const problemKey = `${sectionId}/${problem.id}`;
      const isNewProblem = loadedProblemRef.current !== problemKey;
      loadedProblemRef.current = problemKey;
      if (isNewProblem) {
        track('exercise_opened', { problem_id: problem.id, section_id: sectionId });
        // A language switch keeps the left panel where it is.
        setDescriptionTab('description');
      }
      const savedProgress = getProblemProgressRef.current(sectionId, problem.id);
      const savedCode = activeLanguage === 'numpy' ? savedProgress.code : savedProgress.codes[activeLanguage];
      setCode(savedCode ?? variant.starterCode);
      setEditableTestCases(variant.testCases);
      setTestResults([]);
      setResetKey(k => k + 1);
      clearOutput();
      clearFeedback();
      // Track prior completion so we only celebrate the first solve.
      wasCompletedRef.current = savedProgress.status === 'completed';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem?.id, sectionId, activeLanguage]);

  // Auto-dismiss shortcut hint after 10 seconds
  useEffect(() => {
    if (showShortcutHint) {
      const timer = setTimeout(() => {
        setShowShortcutHint(false);
        writeStorage('ml-lab-shortcut-hint-dismissed', 'true');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showShortcutHint]);

  const dismissShortcutHint = useCallback(() => {
    setShowShortcutHint(false);
    writeStorage('ml-lab-shortcut-hint-dismissed', 'true');
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    if (problem && sectionId) saveProblemCode(sectionId, problem.id, newCode, activeLanguage);
  }, [problem, sectionId, saveProblemCode, activeLanguage]);

  const handleLanguageChange = useCallback((next: Language) => {
    if (next === activeLanguage || isRunning) return;
    writeStorage(LANGUAGE_KEY, next);
    setLanguage(next);
  }, [activeLanguage, isRunning]);

  const handleReset = useCallback(() => {
    if (problem && variant) {
      const hasChanges = code !== variant.starterCode;
      if (!hasChanges || window.confirm('Reset your code? Your changes will be lost.')) {
        setCode(variant.starterCode);
        if (sectionId) saveProblemCode(sectionId, problem.id, variant.starterCode, activeLanguage);
        setTestResults([]);
        setEditableTestCases(variant.testCases);
        setResetKey(k => k + 1);
        clearOutput();
      }
    }
  }, [problem, variant, code, clearOutput, sectionId, saveProblemCode, activeLanguage]);

  const handleRunTests = useCallback(async () => {
    if (!problem || !variant || !isReady || !sectionId || isRunning) return;

    const analytics = { problem_id: problem.id, section_id: sectionId };
    track('code_run', { ...analytics, language: activeLanguage });
    trackOnce('first_run', analytics);
    setIsRunning(true);
    setTestResults([]);

    try {
      const functionName = functionNameOf(variant.starterCode);
      const results = await runTests(code, editableTestCases, functionName, activeLanguage);
      if (activeProblemRef.current !== problem.id) return;
      setTestResults(results);

      const allPassed = results.length > 0 && results.every(r => r.passed);
      if (allPassed) {
        track('exercise_passed', { ...analytics, language: activeLanguage });
        trackOnce('first_pass', analytics);
        updateProblemStatus(sectionId, problem.id, 'completed', activeLanguage);
        if (!wasCompletedRef.current) {
          setShowCelebration(true);
          wasCompletedRef.current = true;
        }
      }
    } finally {
      if (activeProblemRef.current === problem.id) setIsRunning(false);
    }
  }, [problem, variant, isReady, sectionId, code, editableTestCases, runTests, updateProblemStatus, isRunning, activeLanguage]);

  const handleRequestAIFeedback = useCallback(() => {
    if (!problem) return;
    requestFeedback({
      code,
      problemTitle: activeLanguage === 'pytorch' ? `${problem.title} (PyTorch track)` : problem.title,
      problemDescription: problem.description.slice(0, 2000),
      testResults,
    });
  }, [problem, code, testResults, requestFeedback, activeLanguage]);

  if (!problem || !variant || !section || problem.section !== sectionId) {
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

  const languageToggle = problem.pytorch ? (
    <div
      role="group"
      aria-label="Solution language"
      className="flex items-center p-0.5 bg-gray-200 dark:bg-dark-700 border border-gray-300 dark:border-dark-500 rounded-lg shrink-0"
    >
      {LANGUAGES.map(lang => (
        <button
          key={lang}
          type="button"
          aria-pressed={activeLanguage === lang}
          onClick={() => handleLanguageChange(lang)}
          disabled={isRunning}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed ${
            activeLanguage === lang
              ? 'bg-white dark:bg-dark-500 text-gray-900 dark:text-dark-100 shadow-sm'
              : 'text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100'
          }`}
        >
          {LANGUAGE_LABELS[lang]}
        </button>
      ))}
    </div>
  ) : null;

  const trackNotes = activeLanguage === 'pytorch' && problem.pytorch ? (
    <div className="px-4 py-1.5 text-xs break-words border-b border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-900">
      <p className="text-gray-600 dark:text-dark-200">
        <span className="font-medium text-gray-800 dark:text-dark-100">PyTorch track:</span>
        {' '}runs on an in-browser, NumPy-backed subset of the torch API.
        {problem.pytorch.note ? ` ${problem.pytorch.note}` : ''}
      </p>
    </div>
  ) : null;

  const actionBar = (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-500">
      <div className="flex items-center gap-2">
        {languageToggle}
        <button
          onClick={handleRunTests}
          disabled={!isReady || isRunning}
          className="whitespace-nowrap px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            className="whitespace-nowrap px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Next Problem &rarr;
          </Link>
        )}
        <button
          onClick={() => setIsEditorMaximized(!isEditorMaximized)}
          className="whitespace-nowrap px-4 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
          title={isEditorMaximized ? 'Restore layout' : 'Maximize editor'}
        >
          {isEditorMaximized ? '\u229f Restore' : '\u229e Maximize'}
        </button>
        <button
          onClick={handleReset}
          className="whitespace-nowrap px-4 py-1.5 bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full min-h-0 flex flex-col -m-6">
      <SEO
        title={`${problem.title} - ${section.title}`}
        description={`${problemDescriptionText}... Practice this ${problem.difficulty} ML coding problem with instant feedback.`}
        canonical={`/problem/${sectionId}/${problemId}`}
        keywords={`${problem.title}, ${section.title}, machine learning, coding practice, ${problem.difficulty}`}
      />
      <SuccessBanner show={showCelebration} onDismiss={() => setShowCelebration(false)} />
      {syncError && <p role="status" className="p-3 text-amber-700 dark:text-amber-200">Cloud progress could not load. Cloud writes are paused to protect your saved work. Your edits remain on this device; refresh to retry.</p>}
      {storageError && <p role="status" className="p-3 text-amber-700 dark:text-amber-200">Your browser could not save your code. Keep a copy before leaving this page.</p>}
      {error && <div role="alert" className="p-3 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200">{error} <button className="underline" onClick={() => retry()}>Retry Python</button></div>}
      {isRunning && <div className="p-2 bg-gray-100 dark:bg-dark-800"><button onClick={() => stop()} className="px-4 py-2 rounded bg-red-600 text-white">Stop execution</button><span className="ml-3 text-sm text-gray-600 dark:text-dark-200">30-second time limit</span></div>}
      <div className="px-4 py-2 bg-white dark:bg-dark-800"><ShareChallenge title={problem.title} path={`/problem/${sectionId}/${problem.id}`} completed={testResults.length > 0 && testResults.every(result => result.passed)} /></div>
      {/* Problem Header */}
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3 min-w-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-500">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            to={`/section/${sectionId}`}
            className="text-gray-500 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 transition-colors shrink-0"
            title={section.title}
          >
            <span aria-hidden="true">&larr;</span>
            <span className="hidden md:inline"> {section.title}</span>
            <span className="sr-only"> Back to {section.title}</span>
          </Link>
          <span className="text-gray-300 dark:text-dark-500 hidden md:inline">/</span>
          <span className="text-gray-900 dark:text-dark-100 font-medium truncate">{problem.title}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Problem Navigation */}
          <div className="flex items-center gap-1">
            {prevProblemId ? (
              <Link
                to={`/problem/${sectionId}/${prevProblemId}`}
                className="px-2 py-1 text-sm text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 rounded transition-colors"
              >
                <span aria-hidden="true">&larr;</span>
                <span className="hidden sm:inline"> Prev</span>
                <span className="sr-only"> Previous problem</span>
              </Link>
            ) : (
              <span className="px-2 py-1 text-sm text-gray-300 dark:text-dark-400 cursor-default">
                <span aria-hidden="true">&larr;</span>
                <span className="hidden sm:inline"> Prev</span>
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-dark-300 font-mono">
              ({currentIndex + 1}/{section.problems.length})
            </span>
            {nextProblemId ? (
              <Link
                to={`/problem/${sectionId}/${nextProblemId}`}
                className="px-2 py-1 text-sm text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 rounded transition-colors"
              >
                <span className="hidden sm:inline">Next </span>
                <span aria-hidden="true">&rarr;</span>
                <span className="sr-only">Next problem</span>
              </Link>
            ) : (
              <span className="px-2 py-1 text-sm text-gray-300 dark:text-dark-400 cursor-default">
                <span className="hidden sm:inline">Next </span>
                <span aria-hidden="true">&rarr;</span>
              </span>
            )}
          </div>

          <span className="text-gray-300 dark:text-dark-500 hidden sm:inline">|</span>

          {!isReady && (
            <span
              className="text-gray-500 dark:text-dark-200 text-sm flex items-center gap-2"
              title={isLoading ? 'Loading Python...' : 'Python unavailable'}
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shrink-0" />
              <span className="hidden sm:inline">{isLoading ? 'Loading Python...' : 'Python unavailable'}</span>
            </span>
          )}
          {isReady && (
            <span className="text-gray-500 dark:text-dark-200 text-sm flex items-center gap-2" title="Python ready">
              <div className="w-2 h-2 bg-accent-500 rounded-full shrink-0" />
              <span className="hidden sm:inline">Python ready</span>
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
              <Hints
                key={`${problem.id}-${activeLanguage}`}
                hints={variantHints}
                solution={variant.solution}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-900 border-b border-gray-200 dark:border-dark-500">
                <div className="flex items-center gap-2">
                  {languageToggle}
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
              {trackNotes}
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
                  aiFeedback={aiFeedback}
                  aiFeedbackLoading={aiFeedbackLoading}
                  aiFeedbackError={aiFeedbackError}
                  onRequestAIFeedback={handleRequestAIFeedback}
                />
              </div>
            </div>
          )}
        </div>
      ) : isEditorMaximized ? (
        /* Maximized Layout - Editor and Console side by side */
        <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-dark-800">
          {actionBar}
          {trackNotes}

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
                  <Hints
                    key={`${problem.id}-${activeLanguage}`}
                    hints={variantHints}
                    solution={variant.solution}
                    onLoadToEditor={setCode}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Editor and Console */}
          <div className="flex flex-col overflow-hidden bg-white dark:bg-dark-800">
            {actionBar}
            {trackNotes}

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
                  aiFeedback={aiFeedback}
                  aiFeedbackLoading={aiFeedbackLoading}
                  aiFeedbackError={aiFeedbackError}
                  onRequestAIFeedback={handleRequestAIFeedback}
                />
              </div>
            </Split>
          </div>
        </Split>
      )}
    </div>
  );
}
