import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import { fmt } from '../../lib/math';
import { DOCS_UNIT, DOC_NAMES, IVF_CENTERS, IVF_FOUND_NN, IVF_POINTS, IVF_PROBE, IVF_QUERY, IVF_SCORED, IVF_TRUE_NN, ORDER, SEARCH_SCORES, TOPK } from './data';

const S = 560;
const sx = (x: number) => S / 2 + x * (S / 1.8);
const sy = (y: number) => S / 2 - y * (S / 1.8);

export const SearchScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const docsAt = cues.at('Embed your documents');
  const qAt = cues.at('When a query arrives');
  const mmAt = cues.at('single matrix multiply');
  const sortAt = cues.at('sort the scores');
  const tieAt = cues.at('breaking exact ties');
  const exactAt = cues.sentence('This brute-force search');
  const annAt = cues.at('approximate nearest');
  const skipAt = cues.at('skip most documents');
  const chip = ease(frame, cues.sentence("You'll build the exact"), 20);

  const sorted = ease(frame, sortAt, 20);
  const rank = (i: number) => ORDER.indexOf(i);
  const approx = ease(frame, annAt, 20);

  return (
    <>
      <Layer opacity={windowed(frame, 0, exactAt + 6)}>
        <Panel title="stored documents (unit vectors)" style={{ position: 'absolute', left: 0, top: 0, width: 560, opacity: ease(frame, docsAt, 18) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DOC_NAMES.map((d, i) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: ease(frame, docsAt + i * 3, 12) }}>
                <span style={{ width: 50, fontFamily: F.mono, fontSize: 24, color: C.muted }}>{d}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {DOCS_UNIT[i].map((v, k) => (
                    <div key={k} style={{ width: 70, height: 38, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 22, color: C.text, background: rgba(v >= 0 ? C.violet : C.teal, 0.08 + 0.5 * Math.abs(v)) }}>
                      {fmt(v, 2)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <div style={{ position: 'absolute', left: 610, top: 30, opacity: ease(frame, qAt, 16) }}>
          <Tex size={44}>{'scores = q · D^T'}</Tex>
          <div style={{ marginTop: 8, fontFamily: F.body, fontSize: 24, color: C.muted, opacity: ease(frame, mmAt, 16) }}>one matrix multiply, every document</div>
        </div>
        <div style={{ position: 'absolute', left: 610, top: 150, opacity: ease(frame, mmAt, 16) }}>
          <Bars
            values={SEARCH_SCORES}
            labels={DOC_NAMES}
            width={620}
            height={330}
            max={1}
            zeroAt={0.78}
            reveal={(i) => ease(frame, mmAt + i * 3, 14)}
            color={(_, i) => (sorted > 0.5 && rank(i) < TOPK ? C.teal : C.violet)}
            alpha={(i) => (sorted > 0.5 && rank(i) >= TOPK ? 0.4 : 1)}
          />
        </div>
        <Panel title={`top ${TOPK}, best first`} accent={C.teal} style={{ position: 'absolute', left: 1275, top: 140, width: 405, opacity: sorted }}>
          {ORDER.slice(0, TOPK).map((d, r) => (
            <Readout key={d} size={32} style={{ marginBottom: 12 }}>
              {r + 1}. {DOC_NAMES[d]}  {fmt(SEARCH_SCORES[d], 3)}
            </Readout>
          ))}
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.amber, marginTop: 8, opacity: ease(frame, tieAt, 16) }}>
            d2 and d5 tie exactly: lower index first
          </div>
        </Panel>
      </Layer>

      <Layer opacity={windowed(frame, exactAt, durationInFrames + 30)}>
        <svg width={S} height={S} style={{ position: 'absolute', left: 80, top: 20, overflow: 'visible' }}>
          {IVF_POINTS.map((p, i) => {
            const scored = approx < 0.5 || p.c === IVF_PROBE;
            const isNN = i === IVF_TRUE_NN;
            return (
              <circle
                key={i}
                cx={sx(p.v[0])}
                cy={sy(p.v[1])}
                r={isNN && approx > 0.5 ? 12 : 9}
                fill={HEAD[p.c]}
                opacity={scored ? 0.95 : 0.18}
                stroke={isNN && approx > 0.5 ? '#fff' : 'none'}
                strokeWidth={3}
              />
            );
          })}
          {IVF_CENTERS.map((c, i) => (
            <g key={i} opacity={approx}>
              <line x1={sx(c[0]) - 14} y1={sy(c[1]) - 14} x2={sx(c[0]) + 14} y2={sy(c[1]) + 14} stroke={C.text} strokeWidth={4} />
              <line x1={sx(c[0]) - 14} y1={sy(c[1]) + 14} x2={sx(c[0]) + 14} y2={sy(c[1]) - 14} stroke={C.text} strokeWidth={4} />
            </g>
          ))}
          <g>
            <rect x={sx(IVF_QUERY[0]) - 12} y={sy(IVF_QUERY[1]) - 12} width={24} height={24} fill={C.amber} transform={`rotate(45 ${sx(IVF_QUERY[0])} ${sy(IVF_QUERY[1])})`} />
            <text x={sx(IVF_QUERY[0]) + 20} y={sy(IVF_QUERY[1]) + 34} fill={C.amber} fontFamily={F.mono} fontSize={24}>
              query
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 760, top: 40, width: 900, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <Panel title="exact (brute force)">
            <Readout size={34}>scores {IVF_POINTS.length} of {IVF_POINTS.length} vectors</Readout>
          </Panel>
          <Panel title="approximate (cluster index, probe the nearest cluster)" accent={C.teal} style={{ opacity: approx }}>
            <Readout size={34} color={C.teal}>
              scores {IVF_SCORED} of {IVF_POINTS.length} vectors
            </Readout>
            <div style={{ marginTop: 10, fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, skipAt, 16) }}>
              true nearest neighbour found: {IVF_FOUND_NN === IVF_TRUE_NN ? 'yes' : 'no'} · near the cluster edges it can miss, which is the lost recall
            </div>
          </Panel>
          <div style={{ height: 70 }}>
            <ProblemChip title="Cosine Top-k Embedding Search" progress={chip} />
          </div>
        </div>
      </Layer>
    </>
  );
};
