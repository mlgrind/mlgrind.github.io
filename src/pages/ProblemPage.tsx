import { useState, useEffect, useCallback } from 'react';
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
import TestResults from '../components/TestRunner/TestResults';
import { TestResult } from '../types';

export default function ProblemPage() {
  const { sectionId, problemId } = useParams<{ sectionId: string; problemId: string }>();
  const { getProblemProgress, saveProblemCode, updateProblemStatus } = useProgress();
  const { isLoading, isReady, output, runTests, clearOutput } = usePyodide();

  const problem = problemId ? getProblemById(problemId) : undefined;
  const section = sections.find(s => s.id === sectionId);

  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Load saved code or starter code
  useEffect(() => {
    if (problem && sectionId) {
      const savedProgress = getProblemProgress(sectionId, problem.id);
      setCode(savedProgress.code || problem.starterCode);
    }
  }, [problem, sectionId, getProblemProgress]);

  // Auto-save code
  useEffect(() => {
    if (code && problem && sectionId && code !== problem.starterCode) {
      const timer = setTimeout(() => {
        saveProblemCode(sectionId, problem.id, code);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code, problem, sectionId, saveProblemCode]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleReset = useCallback(() => {
    if (problem) {
      setCode(problem.starterCode);
      setTestResults([]);
      clearOutput();
    }
  }, [problem, clearOutput]);

  const extractFunctionName = (starterCode: string): string => {
    const match = starterCode.match(/def\s+(\w+)\s*\(/);
    return match ? match[1] : 'solution';
  };

  const handleRunTests = useCallback(async () => {
    if (!problem || !isReady || !sectionId) return;

    setIsRunning(true);
    setTestResults([]);

    try {
      const functionName = extractFunctionName(problem.starterCode);
      const results = await runTests(code, problem.testCases, functionName);
      setTestResults(results);

      // Check if all tests passed
      const allPassed = results.every(r => r.passed);
      if (allPassed) {
        updateProblemStatus(sectionId, problem.id, 'completed');
      }
    } finally {
      setIsRunning(false);
    }
  }, [problem, isReady, sectionId, code, runTests, updateProblemStatus]);

  if (!problem || !section) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Problem Not Found</h1>
        <Link to="/" className="text-primary-400 hover:text-primary-300">
          Return to Home
        </Link>
      </div>
    );
  }

  // Find next problem in section
  const currentIndex = section.problems.indexOf(problem.id);
  const nextProblemId = section.problems[currentIndex + 1];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -m-6">
      {/* Problem Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <Link
            to={`/section/${sectionId}`}
            className="text-dark-400 hover:text-white transition-colors"
          >
            ← {section.title}
          </Link>
          <span className="text-dark-600">/</span>
          <span className="text-white font-medium">{problem.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {!isReady && (
            <span className="text-dark-400 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              {isLoading ? 'Loading Python...' : 'Python ready'}
            </span>
          )}
          {isReady && (
            <span className="text-dark-400 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Python ready
            </span>
          )}
        </div>
      </div>

      {/* Main Content - Split Pane */}
      <Split
        className="flex flex-1 overflow-hidden"
        sizes={[40, 60]}
        minSize={300}
        gutterSize={8}
        gutterAlign="center"
      >
        {/* Left Panel - Problem Description */}
        <div className="overflow-auto p-6 bg-dark-900">
          <ProblemDescription problem={problem} />
          <Examples examples={problem.examples} />
          <Hints hints={problem.hints} solution={problem.solution} />
        </div>

        {/* Right Panel - Editor and Console */}
        <div className="flex flex-col overflow-hidden bg-dark-850">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-dark-800 border-b border-dark-700">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={!isReady || isRunning}
                className="px-4 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? 'Running...' : 'Run Tests'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 bg-dark-700 text-dark-200 text-sm font-medium rounded-md hover:bg-dark-600 transition-colors"
              >
                Reset
              </button>
            </div>

            {testResults.length > 0 && testResults.every(r => r.passed) && nextProblemId && (
              <Link
                to={`/problem/${sectionId}/${nextProblemId}`}
                className="px-4 py-1.5 bg-green-500/20 text-green-400 text-sm font-medium rounded-md hover:bg-green-500/30 transition-colors"
              >
                Next Problem →
              </Link>
            )}
          </div>

          {/* Editor and Results */}
          <Split
            className="flex-1 overflow-hidden"
            direction="vertical"
            sizes={[60, 40]}
            minSize={100}
            gutterSize={8}
          >
            {/* Code Editor */}
            <div className="overflow-hidden p-4">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                height="100%"
              />
            </div>

            {/* Console and Test Results */}
            <div className="overflow-auto p-4 space-y-4">
              <TestResults results={testResults} isRunning={isRunning} />
              <Console output={output} isLoading={isRunning} />
            </div>
          </Split>
        </div>
      </Split>
    </div>
  );
}
