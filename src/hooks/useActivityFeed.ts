import { useMemo } from 'react';
import { Progress, ActivityItem } from '../types';
import { sections } from '../data/sections';
import { getProblemById } from '../data/problems';

export function useActivityFeed(progress: Progress, limit = 8): ActivityItem[] {
  return useMemo(() => {
    const items: ActivityItem[] = [];

    const sectionMap = new Map(sections.map(s => [s.id, s]));

    for (const [sectionId, sectionProgress] of Object.entries(progress)) {
      const section = sectionMap.get(sectionId);
      if (!section) continue;

      let completedCount = 0;
      const totalProblems = section.problems.length;

      for (const [problemId, problemProgress] of Object.entries(sectionProgress)) {
        if (!problemProgress.lastAttempt) continue;

        const problem = getProblemById(problemId);
        const title = problem?.title ?? problemId;

        if (problemProgress.status === 'completed') {
          completedCount++;
          items.push({
            type: 'completed',
            problemId,
            sectionId,
            title,
            timestamp: problemProgress.lastAttempt,
          });
        } else if (problemProgress.status === 'in_progress') {
          items.push({
            type: 'started',
            problemId,
            sectionId,
            title,
            timestamp: problemProgress.lastAttempt,
          });
        }
      }

      // Section milestones
      if (completedCount > 0 && totalProblems > 0) {
        const pct = Math.round((completedCount / totalProblems) * 100);
        if (pct >= 100) {
          const latestTimestamp = Object.values(sectionProgress)
            .filter(p => p.status === 'completed' && p.lastAttempt)
            .map(p => p.lastAttempt!)
            .sort()
            .pop();
          if (latestTimestamp) {
            items.push({
              type: 'section_milestone',
              sectionId,
              title: section.title,
              timestamp: latestTimestamp,
              detail: 'Section completed!',
            });
          }
        } else if (pct >= 50) {
          const sortedAttempts = Object.values(sectionProgress)
            .filter(p => p.status === 'completed' && p.lastAttempt)
            .map(p => p.lastAttempt!)
            .sort();
          // Use the timestamp of the problem that crossed the 50% mark
          const midIndex = Math.ceil(totalProblems / 2) - 1;
          const milestoneTimestamp = sortedAttempts[Math.min(midIndex, sortedAttempts.length - 1)];
          if (milestoneTimestamp) {
            items.push({
              type: 'section_milestone',
              sectionId,
              title: section.title,
              timestamp: milestoneTimestamp,
              detail: '50% complete',
            });
          }
        }
      }
    }

    // Sort by timestamp descending, take limit
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items.slice(0, limit);
  }, [progress, limit]);
}
