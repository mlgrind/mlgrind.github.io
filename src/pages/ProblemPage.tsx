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
import CompactShare from '../components/Share/CompactShare';
import DifficultyBadge from '../components/ProblemView/DifficultyBadge';
import CompanyTags from '../components/CompanyTags/CompanyTags';
import MenuButton from '../components/Menu/MenuButton';
import { menuItemClass } from '../components/Menu/menuItemClass';
import { useShareChallenge } from '../hooks/useShareChallenge';
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

  // The learner's explicit choice from the toggle, if they ever made one.
  const [chosenLanguage, setChosenLanguage] = useState<Language | null>(() => {
    const stored = readStorage(LANGUAGE_KEY);
    return stored === 'pytorch' || stored === 'numpy' ? stored : null;
  });
  // Without a choice, the section decides (PyTorch Basics opens in PyTorch),
  // unless the learner already has NumPy work on this problem.
  const savedNumpyWork = (() => {
    if (!problem || !sectionId) return false;
    const saved = getProblemProgress(sectionId, problem.id);
    return saved.code !== undefined || saved.solvedIn.includes('numpy');
  })();
  const language: Language =
    chosenLanguage ?? (savedNumpyWork ? 'numpy' : section?.defaultLanguage ?? 'numpy');
  // Problems without a PyTorch track always use NumPy.
  const activeLanguage: Language = language === 'pytorch' && problem?.pytorch ? 'pytorch' : 'numpy';
  // Starter code, solution, tests, hints and examples of the active track.
  const variant = activeLanguage === 'pytorch' && problem?.pytorch ? problem.pytorch : problem;
  const variantHints = (activeLanguage === 'pytorch' && problem?.pytorch?.hints) || problem?.hints || [];
  const variantExamples = (activeLanguage === 'pytorch' && problem?.pytorch?.examples) || problem?.examples || [];

  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [editableTestCases, setEditableTestCases] = useState<TestCase[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const wasCompletedRef = useRef(false);
  const [descriptionTab, setDescriptionTab] = useState<'description' | 'examples' | 'hints'>('description');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');
  const { isDark } = useDarkMode();
  const share = useShareChallenge(`/problem/${sectionId}/${problemId}`, true);
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
    setChosenLanguage(next);
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

  const allPassed = testResults.length > 0 && testResults.every(r => r.passed);
  const runTitle = 'Run tests (Shift+Enter)';

  const pythonStatus = (
    <span
      className="text-gray-500 dark:text-dark-200 text-xs flex items-center gap-2 whitespace-nowrap"
      title={isReady ? 'Python ready' : isLoading ? 'Loading Python...' : 'Python unavailable'}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${isReady ? 'bg-accent-500' : 'bg-yellow-500 animate-pulse'}`} />
      <span className={isReady ? 'sr-only' : 'hidden sm:inline'}>
        {isReady ? 'Python ready' : isLoading ? 'Loading Python...' : 'Python unavailable'}
      </span>
    </span>
  );

  const navIconClass =
    'inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors';
  const navIcon = (d: string) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );

  // Title row: H1 + difficulty, then prev / position / next and Share.
  const titleRow = (
    <div className="flex items-start gap-3 min-w-0">
      <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 min-w-0 pt-0.5">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-100 min-w-0 break-words">{problem.title}</h1>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <div className="flex items-center gap-1 shrink-0">
      <nav aria-label="Problem navigation" className="flex items-center gap-1">
        {prevProblemId ? (
          <Link to={`/problem/${sectionId}/${prevProblemId}`} aria-label="Previous problem" title="Previous problem" className={navIconClass}>
            {navIcon('M15 6l-6 6 6 6')}
          </Link>
        ) : (
          <span aria-hidden="true" className={`${navIconClass} opacity-30 pointer-events-none`}>{navIcon('M15 6l-6 6 6 6')}</span>
        )}
        <span className="text-xs text-gray-400 dark:text-dark-300 font-mono whitespace-nowrap">
          {currentIndex + 1} / {section.problems.length}
        </span>
        {nextProblemId ? (
          <Link to={`/problem/${sectionId}/${nextProblemId}`} aria-label="Next problem" title="Next problem" className={navIconClass}>
            {navIcon('M9 6l6 6-6 6')}
          </Link>
        ) : (
          <span aria-hidden="true" className={`${navIconClass} opacity-30 pointer-events-none`}>{navIcon('M9 6l6 6-6 6')}</span>
        )}
      </nav>
      <CompactShare title={problem.title} message={share.message} onCopy={share.copy} completed={allPassed} />
      </div>
    </div>
  );

  const overflowMenu = (withMaximize: boolean) => (
    <MenuButton
      label="More actions"
      title="More actions"
      buttonClassName="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-dark-500 text-gray-600 dark:text-dark-200 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-100 dark:hover:bg-dark-600 aria-expanded:bg-gray-100 dark:aria-expanded:bg-dark-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors"
      trigger={
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      }
    >
      {close => (
        <>
          {withMaximize && (
            <button
              role="menuitem"
              type="button"
              className={menuItemClass}
              onClick={() => {
                close();
                setIsEditorMaximized(m => !m);
              }}
            >
              <span aria-hidden="true" className="w-4 text-center">{isEditorMaximized ? '\u229f' : '\u229e'}</span>
              {isEditorMaximized ? 'Restore layout' : 'Maximize editor'}
            </button>
          )}
          <button
            role="menuitem"
            type="button"
            className={menuItemClass}
            onClick={() => {
              close();
              handleReset();
            }}
          >
            <span aria-hidden="true" className="w-4 text-center">&#8634;</span>
            Reset code
          </button>
          <button
            role="menuitem"
            type="button"
            className={menuItemClass}
            onClick={() => {
              close();
              share.copy();
            }}
          >
            <span aria-hidden="true" className="w-4 text-center">&#8599;</span>
            Copy share link
          </button>
        </>
      )}
    </MenuButton>
  );

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

  const runButton = (
    <button
      onClick={handleRunTests}
      disabled={!isReady || isRunning}
      title={runTitle}
      aria-keyshortcuts="Shift+Enter"
      className="whitespace-nowrap px-4 py-1.5 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isRunning ? 'Running...' : 'Run Tests'}
    </button>
  );

  const nextAfterPass = allPassed && nextProblemId ? (
    <Link
      to={`/problem/${sectionId}/${nextProblemId}`}
      className="whitespace-nowrap px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
    >
      Next Problem &rarr;
    </Link>
  ) : null;

  const actionBar = (withMaximize: boolean) => (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-dark-500">
      {languageToggle}
      {runButton}
      <div className="flex-1" />
      {pythonStatus}
      {nextAfterPass}
      {overflowMenu(withMaximize)}
    </div>
  );

  return (
    <div className="h-[calc(100%+3rem)] min-h-0 flex flex-col -m-6">
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
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-dark-800">
          <div className="px-4 pt-3.5 pb-2.5 space-y-1.5 min-w-0">
            <p className="text-xs text-gray-500 dark:text-dark-300 break-words">
              <Link to={`/section/${sectionId}`} className="hover:text-gray-900 dark:hover:text-dark-100">{section.title}</Link>
              {' '}&middot; {currentIndex + 1} of {section.problems.length}
            </p>
            <div className="flex items-center gap-2.5 min-w-0">
              <h1 className="flex-1 min-w-0 text-lg font-semibold text-gray-900 dark:text-dark-100 break-words">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <CompanyTags key={problem.id} problemId={problem.id} />
          </div>
          {/* Problem | Code segmented control */}
          <div role="tablist" aria-label="View" className="flex mx-4 p-0.5 rounded-lg bg-gray-100 dark:bg-dark-700 border border-gray-200 dark:border-dark-500">
            {(['problem', 'code'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mobileTab === tab}
                onClick={() => setMobileTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mobileTab === tab
                    ? 'bg-white dark:bg-dark-500 text-gray-900 dark:text-dark-100 shadow-sm'
                    : 'text-gray-500 dark:text-dark-200 hover:text-gray-700 dark:hover:text-dark-100'
                }`}
              >
                {tab === 'problem' ? 'Problem' : 'Code'}
              </button>
            ))}
          </div>

          {mobileTab === 'problem' ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <ProblemDescription problem={problem} hideTitle />
                <Examples examples={variantExamples} />
                <Hints
                  key={`${problem.id}-${activeLanguage}`}
                  hints={variantHints}
                  solution={variant.solution}
                />
              </div>
              {/* Sticky bottom bar */}
              <div className="flex items-center gap-2.5 px-4 pt-2.5 pb-4 border-t border-gray-200 dark:border-dark-500 bg-gray-50 dark:bg-dark-900">
                <button
                  type="button"
                  onClick={() => setMobileTab('code')}
                  className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors"
                >
                  Start coding
                </button>
                <div className="rounded-xl border border-gray-200 dark:border-dark-500 p-1.5">
                  <CompactShare title={problem.title} message={share.message} onCopy={share.copy} completed={allPassed} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2 px-4 py-2 mt-3 bg-gray-50 dark:bg-dark-900 border-y border-gray-200 dark:border-dark-500">
                {languageToggle}
                {runButton}
                <div className="flex-1" />
                {pythonStatus}
                {allPassed && nextProblemId && (
                  <Link
                    to={`/problem/${sectionId}/${nextProblemId}`}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    Next &rarr;
                  </Link>
                )}
                {overflowMenu(false)}
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
          <div className="px-6 py-3 border-b border-gray-200 dark:border-dark-500">{titleRow}</div>
          {actionBar(true)}
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
            {/* Title row, with the company interview tags right below it */}
            <div className="px-6 pt-4 pb-3 bg-white dark:bg-dark-800 space-y-2.5">
              {titleRow}
              <CompanyTags key={problem.id} problemId={problem.id} />
            </div>
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
                <ProblemDescription problem={problem} hideTitle />
              )}
              {descriptionTab === 'examples' && (
                <div>
                  <Examples examples={variantExamples} />
                </div>
              )}
              {descriptionTab === 'hints' && (
                <div>
                  <Hints
                    key={`${problem.id}-${activeLanguage}`}
                    hints={variantHints}
                    solution={variant.solution}
                    onLoadToEditor={handleCodeChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Editor and Console */}
          <div className="flex flex-col overflow-hidden bg-white dark:bg-dark-800">
            {actionBar(true)}
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
