// Geometry: directions

/** The center of the coordinate system. */
export const ORIGIN = [0, 0, 0];

/** One unit step in the positive Y direction. */
export const UP = [0, 1, 0];

/** One unit step in the negative Y direction. */
export const DOWN = [0, -1, 0];

/** One unit step in the positive X direction. */
export const RIGHT = [1, 0, 0];

/** One unit step in the negative X direction. */
export const LEFT = [-1, 0, 0];

/** One unit step in the negative Z direction. */
export const IN = [0, 0, -1];

/** One unit step in the positive Z direction. */
export const OUT = [0, 0, 1];

// Geometry: useful abbreviations for diagonals
/** One step up plus one step left. */
export const UL = [-1, 1, 0];

/** One step up plus one step right. */
export const UR = [1, 1, 0];

/** One step down plus one step left. */
export const DL = [-1, -1, 0];

/** One step down plus one step right. */
export const DR = [1, -1, 0];

// Mathematical constants

/** The ratio of the circumference of a circle to its diameter. */
export const PI = Math.PI;

/** The ratio of the circumference of a circle to its radius. */
export const TWOPI = 2 * Math.PI;

/** The exchange rate between radians and degrees. */
export const DEGREES = TWOPI / 360;
