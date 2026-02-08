import { Progress, ProblemStatus } from '../types';

const STATUS_PRIORITY: Record<ProblemStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
};

export function mergeProgress(local: Progress, cloud: Progress): Progress {
  const merged: Progress = {};

  const allSections = new Set([...Object.keys(local), ...Object.keys(cloud)]);

  for (const sectionId of allSections) {
    const localSection = local[sectionId] || {};
    const cloudSection = cloud[sectionId] || {};

    merged[sectionId] = {};

    const allProblems = new Set([...Object.keys(localSection), ...Object.keys(cloudSection)]);

    for (const problemId of allProblems) {
      const localProblem = localSection[problemId];
      const cloudProblem = cloudSection[problemId];

      if (!localProblem) {
        merged[sectionId][problemId] = cloudProblem;
      } else if (!cloudProblem) {
        merged[sectionId][problemId] = localProblem;
      } else {
        const localPriority = STATUS_PRIORITY[localProblem.status] ?? 0;
        const cloudPriority = STATUS_PRIORITY[cloudProblem.status] ?? 0;

        if (localPriority > cloudPriority) {
          merged[sectionId][problemId] = localProblem;
        } else if (cloudPriority > localPriority) {
          merged[sectionId][problemId] = cloudProblem;
        } else {
          // Same status — pick the one with a more recent lastAttempt
          const localTime = localProblem.lastAttempt ? new Date(localProblem.lastAttempt).getTime() : 0;
          const cloudTime = cloudProblem.lastAttempt ? new Date(cloudProblem.lastAttempt).getTime() : 0;
          merged[sectionId][problemId] = cloudTime > localTime ? cloudProblem : localProblem;
        }
      }
    }
  }

  return merged;
}
