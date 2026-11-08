import { Progress, ProblemProgress, ProblemStatus } from '../types';
import { sanitizeCodes, sanitizeSolvedIn } from './storage';

const STATUS_PRIORITY: Record<ProblemStatus, number> = {
  not_started: 0,
  in_progress: 1,
  completed: 2,
};

function timeOf(problem: ProblemProgress): number {
  return problem.lastAttempt ? new Date(problem.lastAttempt).getTime() : 0;
}

/**
 * The PyTorch track's fields merge on their own: saved code per language
 * follows the more recent lastAttempt (falling back to whichever side has
 * it), and solvedIn is the union of both sides.
 */
function withMergedTracks(
  winner: ProblemProgress,
  local: ProblemProgress,
  cloud: ProblemProgress,
  cloudIsNewer: boolean,
): ProblemProgress {
  const base: ProblemProgress = { ...winner };
  delete base.codes;
  delete base.solvedIn;
  const localCodes = sanitizeCodes(local.codes);
  const cloudCodes = sanitizeCodes(cloud.codes);
  const [newer, older] = cloudIsNewer ? [cloudCodes, localCodes] : [localCodes, cloudCodes];
  const pytorch = newer?.pytorch ?? older?.pytorch;
  const solvedIn = sanitizeSolvedIn([
    ...(sanitizeSolvedIn(local.solvedIn) ?? []),
    ...(sanitizeSolvedIn(cloud.solvedIn) ?? []),
  ]);
  return {
    ...base,
    ...(pytorch !== undefined ? { codes: { pytorch } } : {}),
    ...(solvedIn ? { solvedIn } : {}),
  };
}

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

        const cloudIsNewer = timeOf(cloudProblem) > timeOf(localProblem);
        let winner: ProblemProgress;
        if (localPriority > cloudPriority) {
          winner = localProblem;
        } else if (cloudPriority > localPriority) {
          winner = cloudProblem;
        } else {
          // Same status — pick the one with a more recent lastAttempt
          winner = cloudIsNewer ? cloudProblem : localProblem;
        }
        merged[sectionId][problemId] = withMergedTracks(winner, localProblem, cloudProblem, cloudIsNewer);
      }
    }
  }

  return merged;
}
