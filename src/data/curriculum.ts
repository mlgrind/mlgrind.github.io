import { sections } from './sections';
import type { Progress, Section } from '../types';

export interface CurriculumGroup {
  id: string;
  title: string;
  /** One line under the group title on the home page: what the group covers. */
  blurb: string;
  sectionIds: string[];
}

/**
 * Groups the sections of `sections.ts` into the parts shown in the sidebar and on
 * the home page. Kept separate from `sections.ts` so adding problems or sections
 * there never conflicts with the grouping; `curriculum.test.ts` checks that every
 * section is in exactly one group and that the groups follow section order.
 */
export const curriculumGroups: CurriculumGroup[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'Vectorised NumPy, einsum and the PyTorch API that every later section builds on.',
    sectionIds: ['numpy-fundamentals', 'python-basics', 'einsum', 'pytorch-basics'],
  },
  {
    id: 'classical-ml',
    title: 'Classical ML',
    blurb: 'Clean the data, build the classic learners, then measure them honestly.',
    sectionIds: ['data-preprocessing', 'supervised-learning', 'unsupervised-learning', 'model-evaluation'],
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    blurb: 'Backprop by hand, then the layers, optimizers and tricks that make networks train.',
    sectionIds: ['deep-learning', 'neural-networks', 'optimization', 'cnn', 'sequence-models'],
  },
  {
    id: 'transformers-llms',
    title: 'Transformers & LLMs',
    blurb: 'Attention from scratch, decoding strategies and what is inside a modern LLM.',
    sectionIds: ['transformers', 'llm-generation', 'llm-internals', 'representation-learning'],
  },
  {
    id: 'generative-rl',
    title: 'Generative & RL',
    blurb: 'VAEs, diffusion and flow matching; RL from Bellman backups to PPO, DPO and GRPO.',
    sectionIds: ['generative-models', 'reinforcement-learning', 'post-training'],
  },
  {
    id: 'capstone',
    title: 'Capstone',
    blurb: 'Full models end to end: an MLP, a Transformer, a VAE, a DDPM, a mini GPT and more.',
    sectionIds: ['e2e-implementations'],
  },
];

export interface ResolvedGroup extends CurriculumGroup {
  sections: Section[];
}

/** Groups with their section objects; unknown ids are skipped. */
export const resolvedGroups: ResolvedGroup[] = curriculumGroups.map(group => ({
  ...group,
  sections: group.sectionIds
    .map(id => sections.find(s => s.id === id))
    .filter((s): s is Section => Boolean(s)),
}));

/** The group a section belongs to, if any. */
export function groupOfSection(sectionId: string | undefined): CurriculumGroup | undefined {
  if (!sectionId) return undefined;
  return curriculumGroups.find(group => group.sectionIds.includes(sectionId));
}

/** Number of the section's problems marked completed. */
export function completedInSection(progress: Progress, section: Section): number {
  const entries = progress[section.id];
  if (!entries) return 0;
  return section.problems.filter(id => entries[id]?.status === 'completed').length;
}

/** Completed and total problem counts across a group's sections. */
export function groupProgress(progress: Progress, group: ResolvedGroup): { done: number; total: number } {
  return group.sections.reduce(
    (acc, section) => ({
      done: acc.done + completedInSection(progress, section),
      total: acc.total + section.problems.length,
    }),
    { done: 0, total: 0 },
  );
}
