import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Readout } from '../../components/plot';
import { BEAM, BEAM_VOCAB, BEAM_WIDTH, GREEDY } from './data';
import { fmt } from '../../lib/math';

const COL_X = [150, 530, 950, 1370];
const NODE_W = 230;
const NODE_H = 66;
const TOP = 110;
const SPAN = 460;

const key = (seq: number[]) => seq.join(',');
const words = (seq: number[]) => seq.map((t) => BEAM_VOCAB[t]).join(' ');

export const BeamScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const greedyAt = cues.at('Greedy decoding');
  const weakAt = cues.at('weak continuation');
  const beamAt = cues.at('Beam search keeps');
  const expandAt = cues.at('expands each beam');
  const scoreAt = cues.at('scores each candidate');
  const keepAt = cues.at('keeps only the top');
  const logAt = cues.sentence('Log probabilities add');
  const lenAt = cues.at('divided by the length');
  const chip = ease(frame, cues.sentence("That's Beam Search"), 20);

  // positions of every node, level by level
  const pos = new Map<string, { x: number; y: number }>();
  pos.set('', { x: COL_X[0], y: TOP + SPAN / 2 - NODE_H / 2 });
  BEAM.levels.forEach((lvl, l) => {
    const sorted = [...lvl].sort((a, b) => {
      const pa = pos.get(key(a.seq.slice(0, -1)))!.y;
      const pb = pos.get(key(b.seq.slice(0, -1)))!.y;
      return pa - pb || a.seq[l] - b.seq[l];
    });
    const n = sorted.length;
    const gapY = Math.min(170, SPAN / Math.max(1, n - 1));
    const h = gapY * (n - 1);
    sorted.forEach((node, i) => pos.set(key(node.seq), { x: COL_X[l + 1], y: TOP + (SPAN - h) / 2 + i * gapY - NODE_H / 2 }));
  });

  // greedy phase uses level 1 only; then beam search reveals levels in sequence
  const levelAt = [beamAt, expandAt + 40, keepAt + 20];
  const keptAt = (l: number) => levelAt[l] + 30;
  const greedyKeys = GREEDY.seq.map((_, i) => key(GREEDY.seq.slice(0, i + 1)));
  const bestKeys = BEAM.best.seq.map((_, i) => key(BEAM.best.seq.slice(0, i + 1)));
  const greedyP = ease(frame, greedyAt, 20);
  const bestP = ease(frame, logAt - 20, 20);

  const nodes: React.ReactNode[] = [];
  const edges: React.ReactNode[] = [];
  BEAM.levels.forEach((lvl, l) => {
    lvl.forEach((node) => {
      const k = key(node.seq);
      const p = pos.get(k)!;
      const parent = pos.get(key(node.seq.slice(0, -1)))!;
      const show = l === 0 ? Math.max(ease(frame, greedyAt - 10, 16), ease(frame, levelAt[0], 16)) : ease(frame, levelAt[l], 18);
      const pruned = !node.kept && frame > keptAt(l);
      const isGreedy = greedyKeys.includes(k);
      const isBest = bestKeys.includes(k);
      const accent = isBest && bestP > 0 ? C.teal : isGreedy && greedyP > 0 && (frame < beamAt + 10 || bestP > 0) ? C.amber : node.kept && frame > keptAt(l) ? C.violetLight : C.line2;
      const dim = pruned ? 0.3 : 1;
      edges.push(
        <line
          key={`e${k}`}
          x1={parent.x + NODE_W}
          y1={parent.y + NODE_H / 2}
          x2={p.x}
          y2={p.y + NODE_H / 2}
          stroke={accent === C.line2 ? C.dim : accent}
          strokeWidth={accent === C.line2 ? 2 : 4}
          opacity={show * dim}
        />,
      );
      nodes.push(
        <div
          key={k}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: NODE_W,
            height: NODE_H,
            borderRadius: 12,
            border: `2px solid ${accent}`,
            background: rgba(C.panel2, 0.95),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 18px',
            opacity: show * dim,
          }}
        >
          <span style={{ fontFamily: F.mono, fontSize: 28, color: C.text }}>{BEAM_VOCAB[node.seq[node.seq.length - 1]]}</span>
          <span style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, opacity: l === 0 || frame > scoreAt ? 1 : 0 }}>{fmt(node.score, 2)}</span>
        </div>,
      );
    });
  });

  // greedy only follows its own path; show it on top of level 1 during the greedy sentence
  const greedyOnly = windowed(frame, greedyAt, beamAt + 6);

  return (
    <Layer opacity={windowed(frame, 0, durationInFrames + 30)}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: 50 }}>
        <Tex size={46}>{`score = Σ log p,  beam width = ${BEAM_WIDTH}`}</Tex>
        <span style={{ opacity: ease(frame, lenAt, 16) }}>
          <Tex size={46} color={C.violetLight}>{`score / L^α`}</Tex>
        </span>
      </div>
      <svg width={1680} height={700} style={{ position: 'absolute', inset: 0 }}>
        {edges}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: COL_X[0],
          top: pos.get('')!.y,
          width: NODE_W - 40,
          height: NODE_H,
          borderRadius: 12,
          border: `2px solid ${C.line2}`,
          background: rgba(C.panel2, 0.95),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F.mono,
          fontSize: 26,
          color: C.muted,
        }}
      >
        start
      </div>
      {nodes}

      <div style={{ position: 'absolute', left: 150, top: 630, display: 'flex', gap: 70, alignItems: 'center' }}>
        <Readout size={30} color={C.amber} style={{ opacity: Math.max(greedyOnly, ease(frame, weakAt, 16)) }}>
          greedy “{words(GREEDY.seq)}” {fmt(GREEDY.score, 2)}
        </Readout>
        <Readout size={30} color={C.teal} style={{ opacity: bestP }}>
          beam “{words(BEAM.best.seq)}” {fmt(BEAM.best.score, 2)}
        </Readout>
      </div>
      <div style={{ position: 'absolute', right: 0, top: 0, opacity: windowed(frame, logAt, lenAt + 10) }}>
        <Readout size={28} color={C.muted}>
          Π p = e^{fmt(BEAM.best.score, 2)} = {Math.exp(BEAM.best.score).toFixed(3)}
        </Readout>
      </div>
      <div style={{ position: 'absolute', right: 0, top: -6, opacity: chip }}>
        <ProblemChip title="Beam Search Decoding" progress={chip} />
      </div>
    </Layer>
  );
};
