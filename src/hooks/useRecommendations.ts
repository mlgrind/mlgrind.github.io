import { useMemo } from 'react';
import { Progress, Recommendation } from '../types';
import { sections } from '../data/sections';
import { getProblemById } from '../data/problems';

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14];

export function useRecommendations(progress: Progress, limit = 3): Recommendation[] {
  return useMemo(() => {
    const recommendations: Recommendation[] = [];
    const now = Date.now();

    // P1: Continue in-progress problems (most recent first)
    const inProgress: { problemId: string; sectionId: string; timestamp: number }[] = [];
    for (const [sectionId, sectionProgress] of Object.entries(progress)) {
      for (const [problemId, p] of Object.entries(sectionProgress)) {
        if (p.status === 'in_progress' && p.lastAttempt) {
          inProgress.push({ problemId, sectionId, timestamp: new Date(p.lastAttempt).getTime() });
        }
      }
    }
    inProgress.sort((a, b) => b.timestamp - a.timestamp);
    for (const item of inProgress.slice(0, 2)) {
      const problem = getProblemById(item.problemId);
      if (problem) {
        recommendations.push({
          type: 'continue',
          problemId: item.problemId,
          sectionId: item.sectionId,
          title: problem.title,
          reason: 'Pick up where you left off',
          priority: 1,
        });
      }
    }

    // P2: Next problem in most recently active section
    const sectionActivity = new Map<string, number>();
    for (const [sectionId, sectionProgress] of Object.entries(progress)) {
      let latest = 0;
      for (const p of Object.values(sectionProgress)) {
        if (p.lastAttempt) {
          latest = Math.max(latest, new Date(p.lastAttempt).getTime());
        }
      }
      if (latest > 0) sectionActivity.set(sectionId, latest);
    }
    const recentSections = [...sectionActivity.entries()].sort((a, b) => b[1] - a[1]);
    for (const [sectionId] of recentSections) {
      const section = sections.find(s => s.id === sectionId);
      if (!section) continue;
      const nextProblemId = section.problems.find(pid => {
        const p = progress[sectionId]?.[pid];
        return !p || p.status === 'not_started';
      });
      if (nextProblemId) {
        const problem = getProblemById(nextProblemId);
        if (problem && !recommendations.some(r => r.problemId === nextProblemId)) {
          recommendations.push({
            type: 'next',
            problemId: nextProblemId,
            sectionId,
            title: problem.title,
            reason: `Next in ${section.title}`,
            priority: 2,
          });
          break;
        }
      }
    }

    // P3: Spaced review — completed problems that are "due" for review
    const completedProblems: { problemId: string; sectionId: string; daysSince: number }[] = [];
    for (const [sectionId, sectionProgress] of Object.entries(progress)) {
      for (const [problemId, p] of Object.entries(sectionProgress)) {
        if (p.status === 'completed' && p.lastAttempt) {
          const daysSince = (now - new Date(p.lastAttempt).getTime()) / (1000 * 60 * 60 * 24);
          if (REVIEW_INTERVALS_DAYS.some(d => daysSince >= d)) {
            completedProblems.push({ problemId, sectionId, daysSince });
          }
        }
      }
    }
    completedProblems.sort((a, b) => b.daysSince - a.daysSince);
    for (const item of completedProblems.slice(0, 1)) {
      const problem = getProblemById(item.problemId);
      if (problem && !recommendations.some(r => r.problemId === item.problemId)) {
        const days = Math.floor(item.daysSince);
        recommendations.push({
          type: 'review',
          problemId: item.problemId,
          sectionId: item.sectionId,
          title: problem.title,
          reason: `Completed ${days}d ago — reinforce your understanding`,
          priority: 3,
        });
      }
    }

    // P4: Weak area — sections started but below 50%
    for (const section of sections) {
      const sp = progress[section.id];
      if (!sp) continue;
      const completed = Object.values(sp).filter(p => p.status === 'completed').length;
      const started = Object.values(sp).length;
      if (started > 0 && completed / section.problems.length < 0.5) {
        const nextProblemId = section.problems.find(pid => {
          const p = sp[pid];
          return !p || p.status !== 'completed';
        });
        if (nextProblemId && !recommendations.some(r => r.problemId === nextProblemId)) {
          const problem = getProblemById(nextProblemId);
          if (problem) {
            recommendations.push({
              type: 'weak_area',
              problemId: nextProblemId,
              sectionId: section.id,
              title: problem.title,
              reason: `${section.title} is below 50% — keep building`,
              priority: 4,
            });
            break;
          }
        }
      }
    }

    // P5: New territory — first unstarted section in curriculum order
    for (const section of sections) {
      if (!progress[section.id] || Object.keys(progress[section.id]).length === 0) {
        recommendations.push({
          type: 'new_territory',
          sectionId: section.id,
          title: section.title,
          reason: 'Start a new section',
          priority: 5,
        });
        break;
      }
    }

    // Sort by priority, take limit
    recommendations.sort((a, b) => a.priority - b.priority);
    return recommendations.slice(0, limit);
  }, [progress, limit]);
}
