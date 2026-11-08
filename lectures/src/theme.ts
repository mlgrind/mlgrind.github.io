// The ML Grind dark palette and type stack (see ../../tailwind.config.js and
// ../../src/index.css), so lectures feel native to the site.
export const C = {
  bg: '#0c0f14',
  bgDeep: '#080a0e',
  panel: '#13161d',
  panel2: '#191d26',
  line: '#22272f',
  line2: '#2e3440',
  text: '#e8ecf4',
  muted: '#8b95a8',
  dim: '#5a6478',
  violet: '#7c6cf2',
  violetLight: '#b3a6ff',
  violetDeep: '#4837b5',
  teal: '#00c9a7',
  tealLight: '#4ddcbf',
  rose: '#ff6b81',
  amber: '#f5b454',
};

/** One colour per attention head / sinusoid. */
export const HEAD = ['#b3a6ff', '#00c9a7', '#f5b454', '#ff8fa3'];

export const F = {
  display: '"Instrument Serif", Georgia, serif',
  body: '"DM Sans", -apple-system, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
};

export const W = 1920;
export const H = 1080;

/** The stage: the area between the header and the captions. */
export const STAGE = { top: 150, bottom: 850, left: 120, right: 1800 };

export const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
