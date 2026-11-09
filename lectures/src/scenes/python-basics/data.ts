// Every number on screen in the Python Basics lecture comes from here.
import { matmul, rng, type Mat } from '../../lib/math';

const randint = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

// --- Chapter 1: list + list vs array + array --------------------------------------
const r1 = rng(35); // seeds picked so the small examples have distinct values
export const LA = Array.from({ length: 3 }, () => randint(r1, 1, 9));
export const LB = Array.from({ length: 3 }, () => randint(r1, 1, 9));
export const CONCAT = [...LA, ...LB];
export const ELEMSUM = LA.map((v, i) => v + LB[i]);

// --- Chapter 2: array sum --------------------------------------------------------
const r2 = rng(5);
export const SUM_ARR = Array.from({ length: 8 }, () => randint(r2, -9, 9));
export const CUMSUM = SUM_ARR.reduce<number[]>((acc, v) => [...acc, (acc.length ? acc[acc.length - 1] : 0) + v], []);
export const TOTAL = CUMSUM[CUMSUM.length - 1];

// --- Chapter 3: shopping lists @ price lists ---------------------------------------
export const SHOPPERS = ['Ana', 'Ben', 'Cy'];
export const ITEMS = ['apples', 'bread', 'milk'];
export const STORES = ['store A', 'store B'];
const r3 = rng(1);
/** quantities: shoppers x items */
export const QTY: Mat = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => randint(r3, 0, 4)));
/** prices: items x stores */
export const PRICE: Mat = Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => randint(r3, 1, 6)));
export const BILL = matmul(QTY, PRICE);
// 2x2 pitfall: @ versus *
const r3b = rng(31);
export const MA: Mat = Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => randint(r3b, 1, 5)));
export const MB: Mat = Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => randint(r3b, 1, 5)));
export const M_AT = matmul(MA, MB);
export const M_STAR = MA.map((row, i) => row.map((v, j) => v * MB[i][j]));

// --- Chapter 4: + delivery fee per store -----------------------------------------------
const r4 = rng(1);
export const FEE = Array.from({ length: 2 }, () => randint(r4, 2, 6));
export const BILL_FEE = BILL.map((row) => row.map((v, j) => v + FEE[j]));
