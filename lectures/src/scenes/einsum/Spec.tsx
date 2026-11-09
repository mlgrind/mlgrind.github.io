import React from 'react';
import { C, F, rgba } from '../../theme';

export const LETTER: Record<string, string> = {
  i: C.violetLight,
  j: C.teal,
  k: C.amber,
  b: '#9aa6bd',
  q: C.violetLight,
  d: C.rose,
  v: C.teal,
  h: '#ff8fa3',
};

/**
 * An einsum spec like "ik,kj->ij" with one colour per letter. Letters that are
 * summed away (absent from the output) get a strike-through as `vanish` goes to 1.
 */
export const Spec: React.FC<{ spec: string; size?: number; vanish?: number; style?: React.CSSProperties; quotes?: boolean }> = ({
  spec,
  size = 44,
  vanish = 0,
  style,
  quotes = true,
}) => {
  const out = spec.split('->')[1] ?? '';
  let afterArrow = false;
  const parts: React.ReactNode[] = [];
  for (let k = 0; k < spec.length; k++) {
    const c = spec[k];
    if (c === '-' && spec[k + 1] === '>') {
      afterArrow = true;
      parts.push(
        <span key={k} style={{ color: C.muted, margin: '0 0.25em' }}>
          →
        </span>,
      );
      k++;
      continue;
    }
    if (c === ',') {
      parts.push(
        <span key={k} style={{ color: C.muted, marginRight: '0.2em' }}>
          ,
        </span>,
      );
      continue;
    }
    const summed = !afterArrow && !out.includes(c);
    parts.push(
      <span
        key={k}
        style={{
          color: LETTER[c] ?? C.text,
          textDecoration: summed && vanish > 0.5 ? 'line-through' : 'none',
          textDecorationColor: C.rose,
          textDecorationThickness: 4,
          opacity: summed ? 1 - 0.45 * vanish : 1,
        }}
      >
        {c}
      </span>,
    );
  }
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: F.mono,
        fontSize: size,
        padding: '8px 22px',
        borderRadius: 14,
        background: rgba(C.panel2, 0.9),
        border: `1px solid ${C.line2}`,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {quotes ? <span style={{ color: C.dim }}>'</span> : null}
      {parts}
      {quotes ? <span style={{ color: C.dim }}>'</span> : null}
    </span>
  );
};
