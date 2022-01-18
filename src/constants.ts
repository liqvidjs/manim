import {Pt3, $add} from "./utils/js";

// Geometry: directions

/** The center of the coordinate system. */
export const ORIGIN: Pt3 = [0, 0, 0];

/** One unit step in the positive Y direction. */
export const UP: Pt3 = [0, 1, 0];

/** One unit step in the negative Y direction. */
export const DOWN: Pt3 = [0, -1, 0];

/** One unit step in the positive X direction. */
export const RIGHT: Pt3 = [1, 0, 0];

/** One unit step in the negative X direction. */
export const LEFT: Pt3 = [-1, 0, 0];

/** One unit step in the negative Z direction. */
export const IN: Pt3 = [0, 0, -1];

/** One unit step in the positive Z direction. */
export const OUT: Pt3 = [0, 0, 1];

// Geometry: useful abbreviations for diagonals
/** One step up plus one step left. */
export const UL: Pt3 = $add(LEFT, UP);

/** One step up plus one step right. */
export const UR: Pt3 = $add(RIGHT, UP);

/** One step down plus one step left. */
export const DL: Pt3 = $add(LEFT, DOWN);

/** One step down plus one step right. */
export const DR: Pt3 = $add(RIGHT, DOWN);

// Geometry
export const START_X = 30;
export const START_Y = 20;
export const DEFAULT_DOT_RADIUS = 0.08;
export const DEFAULT_SMALL_DOT_RADIUS = 0.04;
export const DEFAULT_DASH_LENGTH = 0.05;
export const DEFAULT_ARROW_TIP_LENGTH = 0.35;

// Default buffers (padding)
export const SMALL_BUFF = 0.1;
export const MED_SMALL_BUFF = 0.25;
export const MED_LARGE_BUFF = 0.5;
export const LARGE_BUFF = 1;
export const DEFAULT_MOBJECT_TO_EDGE_BUFFER = MED_LARGE_BUFF;
export const DEFAULT_MOBJECT_TO_MOBJECT_BUFFER = MED_SMALL_BUFF;

// Misc
export const DEFAULT_POINT_DENSITY_2D = 25;
export const DEFAULT_POINT_DENSITY_1D = 10;
export const DEFAULT_STROKE_WIDTH = .04;
export const DEFAULT_FONT_SIZE = 48;

// Mathematical constants

/** The ratio of the circumference of a circle to its diameter. */
export const PI = Math.PI;

/** The ratio of the circumference of a circle to its radius. */
export const TWOPI = 2 * Math.PI;

/** The exchange rate between radians and degrees. */
export const DEGREES = TWOPI / 360;
