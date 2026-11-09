// Every number on screen in the Reinforcement Learning lecture comes from here.
import { rng, softmax, type Mat } from '../../lib/math';

const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

// --- Chapter 1: discounted return -----------------------------------------
export const GAMMA = 0.9;
export const HORIZON = 11; // k = 0..10
export const DISCOUNTS = Array.from({ length: HORIZON }, (_, k) => GAMMA ** k);
/** a reward of 1 on every step: G = sum of gamma^k */
export const RETURN_ALL_ONES = DISCOUNTS.reduce((a, b) => a + b, 0);

// --- Chapter 1: value iteration on a 4x5 grid world ------------------------
export const ROWS = 4;
export const COLS = 5;
export const GOAL: [number, number] = [0, 4];
export const PIT: [number, number] = [1, 4];
export const WALL: [number, number] = [1, 1];
export const GRID_GAMMA = 0.9;
const same = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];
export const isTerminal = (r: number, c: number) => same([r, c], GOAL) || same([r, c], PIT);
export const isWall = (r: number, c: number) => same([r, c], WALL);
export const ACTIONS: { name: string; dr: number; dc: number; glyph: string }[] = [
  { name: 'up', dr: -1, dc: 0, glyph: '↑' },
  { name: 'right', dr: 0, dc: 1, glyph: '→' },
  { name: 'down', dr: 1, dc: 0, glyph: '↓' },
  { name: 'left', dr: 0, dc: -1, glyph: '←' },
];
/** deterministic move; bumping a wall or the edge leaves you in place */
export function step(r: number, c: number, a: number): { r: number; c: number; reward: number } {
  let nr = r + ACTIONS[a].dr;
  let nc = c + ACTIONS[a].dc;
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || isWall(nr, nc)) {
    nr = r;
    nc = c;
  }
  const reward = same([nr, nc], GOAL) ? 1 : same([nr, nc], PIT) ? -1 : 0;
  return { r: nr, c: nc, reward };
}
/** Q(s,a) = r + gamma * V(s') under the current V */
export const qValue = (V: Mat, r: number, c: number, a: number) => {
  const s = step(r, c, a);
  return s.reward + GRID_GAMMA * V[s.r][s.c];
};
function sweep(V: Mat): Mat {
  return V.map((row, r) =>
    row.map((_, c) => (isTerminal(r, c) || isWall(r, c) ? 0 : Math.max(...ACTIONS.map((__, a) => qValue(V, r, c, a))))),
  );
}
export const VI_ITERS = 8;
/** VI_SNAPSHOTS[k] = V after k sweeps (k = 0 is all zeros) */
export const VI_SNAPSHOTS: Mat[] = [Array.from({ length: ROWS }, () => new Array(COLS).fill(0))];
for (let k = 0; k < VI_ITERS; k++) VI_SNAPSHOTS.push(sweep(VI_SNAPSHOTS[k]));
export const V_FINAL = VI_SNAPSHOTS[VI_ITERS];
export const POLICY: (number | null)[][] = V_FINAL.map((row, r) =>
  row.map((_, c) => {
    if (isTerminal(r, c) || isWall(r, c)) return null;
    const qs = ACTIONS.map((__, a) => qValue(V_FINAL, r, c, a));
    return qs.indexOf(Math.max(...qs));
  }),
);
/** the backup shown in detail: one cell's four candidate actions */
export const BACKUP_CELL: [number, number] = [2, 4];
export const BACKUP_ITER = 6; // uses V after 6 sweeps -> V after 7
export const BACKUP_Q = ACTIONS.map((_, a) => {
  const s = step(BACKUP_CELL[0], BACKUP_CELL[1], a);
  return { a, reward: s.reward, next: VI_SNAPSHOTS[BACKUP_ITER][s.r][s.c], q: qValue(VI_SNAPSHOTS[BACKUP_ITER], BACKUP_CELL[0], BACKUP_CELL[1], a) };
});

// --- Chapter 2: TD(0), Q-learning vs SARSA, epsilon-greedy, n-step ---------
export const ALPHA = 0.5;
export const TD = (() => {
  const v = 0.4; // current estimate V(s)
  const reward = 1;
  const vNext = 1.5;
  const target = reward + GAMMA * vNext;
  const err = target - v;
  return { v, reward, vNext, target, err, vNew: v + ALPHA * err };
})();

const gq = rng(11);
/** 3 states x 3 actions, one decimal like the problem's Q-tables */
export const QTABLE: Mat = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => r1(gq() * 3 - 0.5)));
export const Q_S = 0;
export const Q_A = 1;
export const Q_R = 1;
export const Q_NEXT = 2;
export const Q_ARGMAX_NEXT = QTABLE[Q_NEXT].indexOf(Math.max(...QTABLE[Q_NEXT]));
/** SARSA's next action: an exploratory one (not the greedy action) */
export const SARSA_NEXT_A = [0, 1, 2].find((a) => a !== Q_ARGMAX_NEXT && QTABLE[Q_NEXT][a] < QTABLE[Q_NEXT][Q_ARGMAX_NEXT])!;
const update = (nextQ: number) => {
  const target = Q_R + GAMMA * nextQ;
  const err = target - QTABLE[Q_S][Q_A];
  return { nextQ, target, err, newQ: QTABLE[Q_S][Q_A] + ALPHA * err };
};
export const QL = update(QTABLE[Q_NEXT][Q_ARGMAX_NEXT]);
export const SARSA = update(QTABLE[Q_NEXT][SARSA_NEXT_A]);

/** epsilon-greedy: with probability eps a uniformly random action, else the argmax */
export const EPS = 0.2;
export const EG_DRAWS = 1000;
export const EG_COUNTS = (() => {
  const g = rng(2024);
  const q = QTABLE[Q_NEXT];
  const counts = [0, 0, 0];
  for (let i = 0; i < EG_DRAWS; i++) {
    const explore = g() < EPS;
    const a = explore ? Math.floor(g() * q.length) : q.indexOf(Math.max(...q));
    counts[a]++;
  }
  return counts;
})();
/** the exact probabilities: 1 - eps + eps/n for the greedy action, eps/n otherwise */
export const EG_PROBS = QTABLE[Q_NEXT].map((_, a) => (a === Q_ARGMAX_NEXT ? 1 - EPS + EPS / 3 : EPS / 3));

/** n-step return from t = 0 on a short trajectory */
export const NS_REWARDS = [0, 1, 0, 2, 1, 0];
export const NS_VALUES = [1.2, 1.5, 0.9, 1.8, 0.7, 0.3, 0];
export const nStep = (n: number) => {
  let g = 0;
  for (let k = 0; k < n; k++) if (k < NS_REWARDS.length) g += GAMMA ** k * NS_REWARDS[k];
  if (n < NS_VALUES.length) g += GAMMA ** n * NS_VALUES[n];
  return g;
};
export const NS_N = [1, 3, 6];
export const NS_G = NS_N.map(nStep);

// --- Chapter 3: REINFORCE and GAE ------------------------------------------
export const THETA = [0.6, 0.2, -0.3];
export const PI = softmax(THETA);
export const PG_ACTION = 1;
export const PG_REWARDS = [0, 1, 2];
export const PG_G = PG_REWARDS.reduce((g, r, k) => g + GAMMA ** k * r, 0);
export const GRAD_LOGPI = PI.map((p, a) => (a === PG_ACTION ? 1 : 0) - p);
export const PG_LR = 0.5;
export const THETA_NEW = THETA.map((t, a) => t + PG_LR * PG_G * GRAD_LOGPI[a]);
export const PI_NEW = softmax(THETA_NEW);

export const GAE_GAMMA = 0.99;
export const GAE_LAMBDA = 0.95;
const gg = rng(77);
export const GAE_T = 6;
export const GAE_R = Array.from({ length: GAE_T }, () => r1(gg() * 2 - 0.4));
export const GAE_V = [...Array.from({ length: GAE_T }, () => r1(gg() * 2)), 0];
export const GAE_DELTA = GAE_R.map((r, t) => r + GAE_GAMMA * GAE_V[t + 1] - GAE_V[t]);
export function gae(lam: number): number[] {
  const out = new Array(GAE_T).fill(0);
  let a = 0;
  for (let t = GAE_T - 1; t >= 0; t--) {
    a = GAE_DELTA[t] + GAE_GAMMA * lam * a;
    out[t] = a;
  }
  return out;
}
export const GAE_A0 = gae(0);
export const GAE_A = gae(GAE_LAMBDA);
export const GAE_A1 = gae(1);

// --- Chapter 4: PPO clip ---------------------------------------------------
export const PPO_EPS = 0.2;
export const clip = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const ppoTerm = (ratio: number, adv: number) => Math.min(ratio * adv, clip(ratio, 1 - PPO_EPS, 1 + PPO_EPS) * adv);
export const PPO_OLD = [0.3, 0.5, 0.2, 0.4];
export const PPO_NEW = [0.45, 0.35, 0.22, 0.3];
export const PPO_ADV = [1.0, -0.5, 2.0, -1.5];
export const PPO_RATIO = PPO_NEW.map((p, i) => p / PPO_OLD[i]);
export const PPO_CLIPPED = PPO_RATIO.map((r) => clip(r, 1 - PPO_EPS, 1 + PPO_EPS));
export const PPO_SURR1 = PPO_RATIO.map((r, i) => r * PPO_ADV[i]);
export const PPO_SURR2 = PPO_CLIPPED.map((r, i) => r * PPO_ADV[i]);
export const PPO_MIN = PPO_SURR1.map((s, i) => Math.min(s, PPO_SURR2[i]));
export const PPO_OBJ = mean(PPO_MIN);

// --- Chapter 5: RLHF -------------------------------------------------------
export { sigmoid };
export const RM_CHOSEN = [2.1, 0.8, 1.5, -0.2];
export const RM_REJECTED = [0.4, 1.1, -0.5, -1.0];
export const RM_MARGIN = RM_CHOSEN.map((c, i) => c - RM_REJECTED[i]);
export const RM_LOSSES = RM_MARGIN.map((m) => -Math.log(sigmoid(m)));
export const RM_LOSS = mean(RM_LOSSES);

export const KL_BETA = 0.1;
export const KL_POLICY = [-12.4, -20.1, -8.7, -15.0];
export const KL_REF = [-14.0, -19.6, -11.2, -15.3];
export const KL_REWARD = [1.2, 0.4, 0.9, -0.3];
export const KL = KL_POLICY.map((p, i) => r2(p - KL_REF[i]));
export const KL_ADV = KL_REWARD.map((r, i) => r - KL_BETA * KL[i]);
export const KL_PENALTY = KL_BETA * mean(KL);

export const DPO_BETA = 0.1;
export const DPO = (() => {
  const logpW = [-14.2, -9.8, -21.5];
  const refW = [-15.0, -10.1, -20.9];
  const logpL = [-16.1, -12.0, -19.0];
  const refL = [-15.2, -11.4, -19.8];
  const dW = logpW.map((v, i) => v - refW[i]);
  const dL = logpL.map((v, i) => v - refL[i]);
  const logits = dW.map((w, i) => DPO_BETA * (w - dL[i]));
  const losses = logits.map((z) => -Math.log(sigmoid(z)));
  return { dW, dL, logits, losses, loss: mean(losses) };
})();
