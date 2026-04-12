import { useState, useCallback } from 'react';
import { TestResult } from '../types';

const WORKER_URL = import.meta.env.VITE_AI_FEEDBACK_URL || 'https://mlgrind-ai-feedback.itzsid.workers.dev';

interface UseAIFeedbackReturn {
  feedback: string | null;
  isLoading: boolean;
  error: string | null;
  requestFeedback: (params: {
    code: string;
    problemTitle: string;
    problemDescription: string;
    testResults: TestResult[];
  }) => Promise<void>;
  clearFeedback: () => void;
}

export function useAIFeedback(): UseAIFeedbackReturn {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  const requestFeedback = useCallback(async (params: {
    code: string;
    problemTitle: string;
    problemDescription: string;
    testResults: TestResult[];
  }) => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: params.code,
          problemTitle: params.problemTitle,
          problemDescription: params.problemDescription,
          testResults: params.testResults.map(r => ({
            passed: r.passed,
            description: r.description,
            expected: r.expected,
            actual: r.actual,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get feedback');
      }

      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI feedback');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { feedback, isLoading, error, requestFeedback, clearFeedback };
}
