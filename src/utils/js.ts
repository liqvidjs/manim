/** Utilities for things which are easy in Python but not so easy in JS */

import {ORIGIN} from "../constants";

/** Add vectors */
export function $add(...vectors: Pt3[]): Pt3;
export function $add(...vectors: Vector[]) {
  return vectors.reduce((a, b) => a.map((ai, i) => ai + b[i], ORIGIN));
}

/** Subtract vectors */
export function $sub(a: Pt3, b: Pt3) {
  return $add(a, $scale(b, -1));
}

export type Pt3 = [number, number, number];
export type Vec3 = [number, number, number];
export type Matrix3 = [Vec3, Vec3, Vec3];
export type Vector = number[];
export type Matrix = number[][];

/** Scale a vector. */
export function $scale<V extends Vec3 | Vector>(v: V, a: number): V {
  return v.map(vi => vi * a) as V;
}

/** Matrix multiplication */
export function $mult(a: Matrix3, b: Matrix3) {
  const c = $zero(3);
  for (let i = 0; i < 3; ++i) {
    for (let j = 0; j < 3; ++j) {
      for (let k = 0; k < 3; ++k) {
        c[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return c;
}

/**
 * Normalize a vector.
 * @throws If v is the zero vector.
 */
export function $normalize<V extends Vec3 | Vector>(v: V): V {
  const norm = Math.hypot(...v);
  if (norm === 0) {
    throw new Error("Cannot normalize zero vector");
  }
  return $scale(v, 1/norm);
}

/** Identity matrix. */
export function $identity(n: 3): Matrix3;
export function $identity(n: number) {
  const m = [];
  for (let i = 0; i < n; ++i) {
    const row = new Array(n).fill(0);
    row[i] = 1;
    m.push(row);
  }
  return m as Matrix;
}

/** Matrix inversion. */
export function $invert(m: Matrix3) {
  const [a, b, c] = m[0],
        [d, e, f] = m[1],
        [g, h, i] = m[2];
  
  // minors
  const ma = e*i - f*h;
  const mb = f*g - d*i;
  const mc = d*h - e*g;

  // determinant
  const det = a*ma + b*mb + c*mc;

  if (det === 0) {
    return $zero(3);
  }

  // adjugate
  const adj: Matrix3 = [
    [ma, mb, mc],
    [c*h-b*i, a*i-c*g, b*g-a*h],
    [b*f-c*e, c*d-a*f, a*e-b*d]
  ];
  return adj.map(row => row.map(entry => entry/det)) as Matrix3;
}

/** Zero matrix. */
export function $zero(n: 3): Matrix3;
export function $zero(n: number) {
  const m = [];
  for (let i = 0; i < n; ++i) {
    m.push(new Array(n).fill(0));
  }
  return m as Matrix;
}