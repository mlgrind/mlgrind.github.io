import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel } from '../../components/plot';
import { ALPHA, AVGDL, B, BM25, CANDIDATES, CORPUS, FUSED, IDF, K1, QUERY_TEXT, RERANKED, tfFactor } from './data';

const PW = 640;
const PH = 300;
const TFMAX = 10;
const YMAX = K1 + 1;
const px = (tf: number) => (tf / TFMAX) * PW;
const py = (y: number) => PH - (y / YMAX) * PH;
const curve = (len: number) =>
  Array.from({ length: 101 }, (_, i) => {
    const tf = (i / 100) * TFMAX;
    return `${px(tf).toFixed(1)},${py(tfFactor(tf, len)).toFixed(1)}`;
  }).join(' ');

const Card: React.FC<{ title: string; body: string; color: string; p: number }> = ({ title, body, color, p }) => (
  <div style={{ width: 700, padding: '24px 30px', borderRadius: 18, border: `2px solid ${rgba(color, 0.5)}`, background: rgba(color, 0.08), opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
    <div style={{ fontFamily: F.body, fontSize: 28, fontWeight: 500, color }}>{title}</div>
    <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 22, color: C.text }}>{body}</div>
  </div>
);

export const HybridScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const ragAt = cues.at('puts retrieved passages');
  const denseAt = cues.at('Dense embeddings');
  const blurAt = cues.at('blur rare exact');
  const lexAt = cues.at('Lexical search');
  const bmAt = cues.sentence('BM25 scores');
  const idfAt = cues.at('inverse document frequency');
  const satAt = cues.at('saturates');
  const tenthAt = cues.at('tenth mention');
  const k1At = cues.at('controls that saturation');
  const bAt = cues.at('normalizes for document length');
  const recipeAt = cues.sentence('A common recipe');
  const rerankAt = cues.at('reranks them');
  const chip = ease(frame, cues.sentence("That's RAG"), 20);

  const rer = ease(frame, rerankAt + 20, 24);
  const idfTerms = Object.keys(IDF);

  return (
    <>
      <Layer opacity={windowed(frame, 0, bmAt + 6)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: ease(frame, ragAt, 16) }}>
          {['question', 'retrieve passages', 'prompt + passages', 'LLM answer'].map((t, i) => (
            <React.Fragment key={t}>
              {i > 0 && <span style={{ fontFamily: F.mono, fontSize: 30, color: C.dim }}>→</span>}
              <div style={{ padding: '14px 22px', borderRadius: 14, border: `2px solid ${i === 1 ? C.amber : C.line2}`, fontFamily: F.body, fontSize: 26, color: C.text, background: rgba(i === 1 ? C.amber : C.text, 0.06) }}>{t}</div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 32, color: C.amber, marginTop: 10, opacity: ease(frame, denseAt, 16) }}>query: “{QUERY_TEXT}”</div>
        <div style={{ display: 'flex', gap: 40 }}>
          <Card title="dense (embeddings)" body={`finds: “${CORPUS[2]}”`} color={C.violetLight} p={ease(frame, denseAt + 10, 16)} />
          <Card title="lexical (BM25)" body={`finds: “${CORPUS[3]}”`} color={C.teal} p={ease(frame, lexAt, 16)} />
        </div>
        <div style={{ display: 'flex', gap: 40, fontFamily: F.body, fontSize: 24 }}>
          <div style={{ width: 700, color: C.muted, opacity: ease(frame, denseAt + 20, 16) }}>
            a paraphrase with no “error” or “E42”
            <span style={{ color: C.rose, opacity: ease(frame, blurAt, 16) }}> · but “E42” vs “E43” look alike to it</span>
          </div>
          <div style={{ width: 700, color: C.muted, opacity: ease(frame, lexAt, 16) }}>matches the exact code “E42”</div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, bmAt, recipeAt + 6)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center' }}>
          <Tex size={46}>{'BM25 = Σ_t IDF(t) · f (k_1 + 1) / (f + k_1 (1 − b + b |d| / avgdl))'}</Tex>
        </div>
        <Panel title="IDF of each query term" style={{ position: 'absolute', left: 0, top: 110, width: 560, opacity: ease(frame, idfAt, 18) }}>
          <Bars values={idfTerms.map((t) => IDF[t])} labels={idfTerms} width={490} height={260} max={1} color={(_, i) => (i === 0 ? C.dim : C.teal)} />
          <div style={{ marginTop: 12, fontFamily: F.body, fontSize: 22, color: C.muted }}>“password” is in 3 of 5 docs, so it counts less</div>
        </Panel>
        <Panel title={`term-frequency factor (k1 = ${K1}, b = ${B})`} style={{ position: 'absolute', left: 620, top: 110, width: 760, opacity: ease(frame, satAt - 10, 18) }}>
          <svg width={PW} height={PH + 40} style={{ overflow: 'visible' }}>
            <line x1={0} x2={PW} y1={PH} y2={PH} stroke={C.line2} strokeWidth={2} />
            <line x1={0} x2={PW} y1={py(K1 + 1)} y2={py(K1 + 1)} stroke={C.dim} strokeWidth={2} strokeDasharray="6 8" />
            <text x={PW + 10} y={py(K1 + 1) + 8} fill={C.dim} fontFamily={F.mono} fontSize={22}>
              k1+1
            </text>
            {[0, 2, 4, 6, 8, 10].map((t) => (
              <text key={t} x={px(t)} y={PH + 30} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="middle">
                {t}
              </text>
            ))}
            <polyline points={curve(AVGDL)} fill="none" stroke={C.teal} strokeWidth={5} />
            <polyline points={curve(2 * AVGDL)} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="10 8" opacity={ease(frame, bAt, 16)} />
            <g opacity={ease(frame, tenthAt, 16)}>
              {[1, 10].map((t) => (
                <g key={t}>
                  <circle cx={px(t)} cy={py(tfFactor(t, AVGDL))} r={9} fill={C.teal} />
                  <text x={px(t) + (t === 1 ? 14 : -14)} y={py(tfFactor(t, AVGDL)) - 16} fill={C.teal} fontFamily={F.mono} fontSize={22} textAnchor={t === 1 ? 'start' : 'end'}>
                    f={t}: {tfFactor(t, AVGDL).toFixed(2)}
                  </text>
                </g>
              ))}
            </g>
          </svg>
          <div style={{ display: 'flex', gap: 30, fontFamily: F.body, fontSize: 22, color: C.muted }}>
            <span style={{ color: C.teal, opacity: ease(frame, k1At, 16) }}>average-length doc</span>
            <span style={{ color: C.amber, opacity: ease(frame, bAt, 16) }}>doc twice as long</span>
            <span>x: term count f</span>
          </div>
        </Panel>
      </Layer>

      <Layer opacity={windowed(frame, recipeAt, durationInFrames + 30)}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1680 }}>
          {CORPUS.map((doc, i) => {
            const cand = CANDIDATES.includes(i);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, height: 52, opacity: cand || frame < rerankAt ? 1 : 0.35 }}>
                <span style={{ width: 50, fontFamily: F.mono, fontSize: 24, color: C.muted }}>d{i}</span>
                <span style={{ width: 640, fontFamily: F.mono, fontSize: 23, color: C.text }}>{doc}</span>
                <div style={{ width: 300, height: 26, background: rgba(C.text, 0.04), borderRadius: 6 }}>
                  <div style={{ width: (BM25[i] / Math.max(...BM25)) * 300 * ease(frame, recipeAt + i * 3, 16), height: 26, borderRadius: 6, background: cand ? C.teal : C.dim }} />
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 24, color: C.muted }}>BM25 {BM25[i].toFixed(2)}</span>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 278, opacity: ease(frame, rerankAt, 18) }}>
          <Tex size={36}>{`fused = ${ALPHA} · bm25 / max + ${1 - ALPHA} · cos`}</Tex>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 336, display: 'flex', gap: 40, opacity: ease(frame, rerankAt, 18) }}>
          {[
            { t: 'BM25 candidates', rows: FUSED, p: 1 },
            { t: 'after rerank', rows: RERANKED, p: rer },
          ].map(({ t, rows, p }) => (
            <Panel key={t} title={t} accent={p < 1 ? C.muted : t === 'after rerank' ? C.amber : C.teal} style={{ width: 640, opacity: p }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 150px 130px 150px', rowGap: 8, fontFamily: F.mono, fontSize: 24 }}>
                {['doc', 'bm25/max', 'cos', 'fused'].map((h) => (
                  <span key={h} style={{ color: C.dim, fontSize: 22 }}>{h}</span>
                ))}
                {rows.map((r) => (
                  <React.Fragment key={r.doc}>
                    <span style={{ color: C.text }}>d{r.doc}</span>
                    <span style={{ color: C.teal }}>{r.bm25n.toFixed(2)}</span>
                    <span style={{ color: C.violetLight }}>{r.cos.toFixed(2)}</span>
                    <span style={{ color: C.amber }}>{r.fused.toFixed(2)}</span>
                  </React.Fragment>
                ))}
              </div>
            </Panel>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, top: 636 }}>
          <ProblemChip title="RAG Retrieval: BM25 + Embedding Rerank" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
