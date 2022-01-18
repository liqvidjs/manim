import {DEFAULT_MOBJECT_TO_MOBJECT_BUFFER} from "..";
import {DOWN, IN, LEFT, ORIGIN, OUT, RIGHT, UP} from "../constants";
import {WHITE, YELLOW_C} from "../utils/color";
import {$add, $scale, $sub, Pt3} from "../utils/js";

let key = 0;

/**
 * Mathematical Object: base class for objects that can be displayed on screen.
 */
export class Mobject {
  key: string;

  /** Color of the mobject. */
  color: string;

  dim: number;

  /** The points of the objects. */
  points: Pt3[];

  /** The contained objects. */
  submobjects: Mobject[];

  constructor({
    color = WHITE,
    dim = 3
  }: {
    color?: string;
    dim?: number;
  } = {}, setters = {}) {
    this.color = color;
    // self.name = self.__class__.__name__ if name is None else name
    this.dim = dim;
    // this.target = target
    // this.z_index = z_index
    // this.point_hash = None
    this.submobjects = [];
    // this.updaters = []
    // this.updating_suspended = False

    for (const key in setters) {
      this[key] = setters[key];
    }

    this.resetPoints();
    this.generatePoints();
    this.initColors();
  }

  /**
   * Add mobjects as submobjects.
   * 
   * The mobjects are added to {@link submobjects}.
   * @param mobjects The mobjects to add.
   * @throws {Error} When a mobject tries to add itself.
   * @throws {TypeError} When trying to add an object that is not an instance of {@link Mobject}.
   */
  add(...mobjects: Mobject[]) {
    for (const m of mobjects) {
      if (!(m instanceof Mobject)) {
        throw new TypeError("All submobjects must be of type Mobject");
      }
      if (m === this) {
        throw new Error("Mobject cannot contain self");
      }
    }
    this.submobjects.push(...mobjects);
    return this;
  }

  applyPointsFunctionAboutPoint(
    func: (p: Pt3) => Pt3,
    {aboutPoint, aboutEdge}: {aboutPoint?: Pt3; aboutEdge?: Pt3;}
  ) {
    if (!aboutPoint) {
      aboutEdge ??= ORIGIN;
      aboutPoint = this.getCriticalPoint(aboutEdge);
    }
    for (const mob of this.familyMembersWithPoints()) {
      mob.points = mob.points.map(p => {
        p = $sub(p, aboutPoint);
        p = func(p);
        p = $add(p, aboutPoint);
        return p;
      });
    }
    return this;
  }

  // Positioning methods
  center() {
    return this.shift($scale(this.getCenter(), -1));
  }

  /** Move this {@link Mobject} next to another's {@link Mobject} or coordinate. */
  nextTo(mobjectOrPoint: Mobject | Pt3, {
    alignedEdge = ORIGIN,
    buff = DEFAULT_MOBJECT_TO_MOBJECT_BUFFER,
    direction = RIGHT,
    submobjectToAlign,
    indexOfSubmobjectToAlign,
    coorMask = [1, 1, 1]
  }: {
    alignedEdge?: Pt3;
    buff?: number;
    coorMask?: Pt3;
    direction?: Pt3;
    submobjectToAlign?: Mobject;
    indexOfSubmobjectToAlign?: number;
  }) {
    let targetPoint: Pt3;

    if (mobjectOrPoint instanceof Mobject) {
      let targetAligner: Mobject;
      if (indexOfSubmobjectToAlign !== undefined) {
        targetAligner = mobjectOrPoint.submobjects[indexOfSubmobjectToAlign];
      } else {
        targetAligner = mobjectOrPoint;
      }
      targetPoint = targetAligner.getCriticalPoint($add(alignedEdge, direction));
    } else {
      targetPoint = mobjectOrPoint;
    }

    // aligner
    let aligner: Mobject;
    if (submobjectToAlign) {
      aligner = submobjectToAlign;
    } else if (indexOfSubmobjectToAlign !== undefined) {
      aligner = this.submobjects[indexOfSubmobjectToAlign];
    } else {
      aligner = this;
    }


    const pointToAlign = aligner.getCriticalPoint($sub(alignedEdge, direction));
    this.shift($add($sub(targetPoint, pointToAlign), $scale(direction, buff)).map((vi, i) => vi * coorMask[i]) as Pt3);
    return this;
  }

  familyMembersWithPoints() {
    return this.getFamily().filter(m => m.hasPoints());
  }

  getFamily(recurse = true) {
    return this.submobjects;
    // sub_families = list(map(Mobject.get_family, self.submobjects))
    // all_mobjects = [self] + list(it.chain(*sub_families))
    // return remove_list_redundancies(all_mobjects)
  }

  /**
   * Initializes the colors.
   * Gets called upon creation. This is an empty method that can be implemented by subclasses.
   */
  initColors() {}

  /**
   * Initializes {@link points} and therefore the shape.
   * Gets called upon creation. This is an empty method that can be implemented by subclasses.
   */
  generatePoints() {}

  /**
   * Picture a box bounding the {@link Mobject}. Such a box has 9 'critical points': 4 corners, 4 edge center, the center.
   * This returns one of them, along the given direction.
   */
  getCriticalPoint(direction: number[]) {
    const result = new Array(this.dim).fill(0) as Pt3;
    const allPoints = this.getPointsDefiningBoundary();

    if (allPoints.length === 0)
      return result;

    for (let dim = 0; dim < this.dim; ++dim) {
      result[dim] = this.getExtremumAlongDim({points: allPoints, dim, key: direction[dim]});
    }
    return result;
  }

  reduceAcrossDimension(pointsFunc: (...vals: number[]) => number, reduceFunc: (...vals: number[]) => number, dim: number) {
    const points = this.getAllPoints();
    if (!points || points.length === 0) {
      // Note, this default means things like empty VGroups will appear to have a center at [0, 0, 0]
      return 0;
    }
    const values = pointsFunc(...points.map(p => p[dim]));
    return values;
    // return reduceFunc(...values);
  }

  getMergedArray(arrayAttr: string) {
    let result = this[arrayAttr] as Pt3[];
    for (const submob of this.submobjects) {
      result = result.concat(submob.getMergedArray(arrayAttr));
    }
    return result;
  }

  getAllPoints() {
    return this.getMergedArray("points") as Pt3[];
  }

  // Getters
  getPointsDefiningBoundary() {
    return this.getAllPoints();
  }

  getNumPoints() {
    return this.points.length;
  }

  getExtremumAlongDim({points, dim = 0, key = 0}: {
    points?: Pt3[];
    dim?: number;
    key?: number;
  } = {}) {
    points ??= this.getPointsDefiningBoundary();
    const values = points.map(p => p[dim]) as Pt3;
    if (key < 0) {
      return Math.min(...values);
    } else if (key === 0) {
      return (Math.min(...values) + Math.max(...values)) / 2;
    } else {
      return Math.max(...values);
    }
  }

  /** Returns the color of the {@link Mobject} */
  getColor() {
    return this.color;
  }

  // Pseudonyms for more general get_critical_point method

  /** Get edge coordinates for certain direction. */
  getEdgeCenter(direction: Pt3) {
    return this.getCriticalPoint(direction);
  }

  /** Get corner coordinates for certain direction. */
  getCorner(direction: Pt3) {
    return this.getCriticalPoint(direction);
  }

  /** Get center coordinates */
  getCenter() {
    return this.getCriticalPoint(new Array(this.dim).fill(0));
  }

  /** Get top coordinates of a box bounding the {@link Mobject}. */
  getTop() {
    return this.getEdgeCenter(UP);
  }

  /** Get bottom coordinates of a box bounding the {@link Mobject}. */
  getBottom() {
    return this.getEdgeCenter(DOWN);
  }

  /** Get right coordinates of a box bounding the {@link Mobject}. */
  getRight() {
    return this.getEdgeCenter(RIGHT);
  }

  /** Get left coordinates of a box bounding the {@link Mobject}. */
  getLeft() {
    return this.getEdgeCenter(LEFT);
  }

  /** Get zenith coordinates of a box bounding a 3D {@link Mobject}. */
  getZenith() {
    return this.getEdgeCenter(OUT);
  }

  /** Get nadir (opposite the zenith) coordinates of a box bounding a 3D {@link Mobject}. */
  getNadir() {
    return this.getEdgeCenter(IN);
  }

  /** Measure the length of an {@link Mobject} in a certain direction. */
  lengthOverDim(dim: number) {
    return this.reduceAcrossDimension(Math.max, Math.max, dim) - this.reduceAcrossDimension(Math.min, Math.min, dim);
  }

  /** Meant to generalize {@link getX}, {@link getY} and {@link getZ} */
  getCoord(dim: number, direction = ORIGIN) {
    return this.getExtremumAlongDim({dim, key: direction[dim]});
  }

  /** Returns x coordinate of the center of the {@link Mobject} */
  getX(direction = ORIGIN) {
    return this.getCoord(0, direction);
  }

  /** Returns y coordinate of the center of the {@link Mobject} */
  getY(direction = ORIGIN) {
    return this.getCoord(1, direction);
  }

  /** Returns z coordinate of the center of the {@link Mobject} */
  getZ(direction = ORIGIN) {
    return this.getCoord(2, direction);
  }

  /** Returns the point, where the stroke that surrounds the {@link Mobject} starts. */
  getStart() {
    this.throwErrorIfNoPoints("getStart");
    return this.points[0];
  }

  /** Returns the point, where the stroke that surrounds the {@link Mobject} ends. */
  getEnd() {
    this.throwErrorIfNoPoints("getEnd");
    return this.points[this.points.length - 1];
  }

  /** Returns starting and ending point of a stroke as a ``tuple``. */
  getStartAndEnd() {
    return [this.getStart(), this.getEnd()];
  }

  pointFromProportion(alpha: number) {
    throw new Error("Please override in a child class.");
  }

  proportionFromPoint(point: Pt3) {
    throw new Error("Please override in a child class.");
  }

  /** Check if {@link Mobject} contains points. */
  hasPoints() {
    return this.points.length > 0;
  }

  /** Check if {@link Mobject} *does not* contains points. */
  hasNoPoints() {
    return !this.hasPoints();
  }

  /**
   * Sets {@link points} to be an empty array.
   */
  resetPoints() {
    this.points = [];
  }

  /**
   * Rotates the {@link Mobject} about a certain point.
   */
  rotate(angle: number, axis = OUT, aboutPoint = ORIGIN) {
    throw new Error("Not implemented");
    // const rotMatrix = rotationMatrix(angle, axis);
    // self.apply_points_function_about_point(
    //     lambda points: np.dot(points, rot_matrix.T), about_point, **kwargs
    // )
    // return self
    // return this;
  }

  /**
   * Rotates the Mobject about the {@link ORIGIN}, which is at [0,0,0].
   */
  rotateAboutOrigin(angle: number, axis = OUT) {
    return this.rotate(angle, axis, ORIGIN);
  }

  /**
   * Scale the size by a factor.
   * 
   * Default behavior is to scale about the center of the mobject.
   * @param scaleFactor The scaling factor `\alpha`. If `0 < |\alpha| < 1`, the mobject will shrink, and for `|\alpha| > 1` it will grow. Furthermore, if `\alpha < 0`, the mobject is also flipped.
   */
  scale(scaleFactor: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    this.applyPointsFunctionAboutPoint(pt => pt.map(xi => xi * scaleFactor) as Pt3, kwargs);
    return this;
  }

  /**
   * Shift by the given vectors.
   * @param vectors Vectors to shift by. If multiple vectors are given, they are added together.
   */
  shift(...vectors: Pt3[]) {
    const totalVector = $add(...vectors);
    for (const mob of this.submobjects.concat(this)) {
      for (let i = 0; i < mob.points.length; ++i) {
        mob.points[i] = $add(mob.points[i], totalVector);
      }
    }
    return this;
  }

  rescaleToFit(length: number, dim: number, stretch = false, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    const oldLength = this.lengthOverDim(dim);
    if (oldLength === 0)
      return this;
    if (stretch) {
      return this.stretch(length / oldLength, dim, kwargs)
    } else {
      return this.scale(length / oldLength, kwargs);
    }
  }

  /** Scales the {@link Mobject} to fit a width while keeping height/depth proportional. */
  scaleToFitWidth(width: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    return this.rescaleToFit(width, 0, false, kwargs);
  }

  stretch(factor: number, dim: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    const func = (pt: Pt3) => {
      const clone = pt.slice() as Pt3;
      clone[dim] *= factor;
      return clone;
    }

    this.applyPointsFunctionAboutPoint(func, kwargs);
    return this;
  }

  /** Stretches the {@link Mobject} to fit a width, not keeping height/depth proportional. */
  stretchToFitWidth(width: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    return this.rescaleToFit(width, 0, true, kwargs);
  }

  /** Scales the {@link Mobject} to fit a height while keeping width/depth proportional. */
  scaleToFitHeight(height: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    return this.rescaleToFit(height, 1, false, kwargs);
  }

  /** Stretches the {@link Mobject} to fit a height, not keeping width/depth proportional. */
  stretchToFitHeight(height: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    return this.rescaleToFit(height, 1, true, kwargs);
  }

  /** Scales the {@link Mobject} to fit a depth while keeping width/height proportional. */
  scaleToFitDepth(depth: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    return this.rescaleToFit(depth, 2, false, kwargs)
  }

  /** Stretches the {@link Mobject} to fit a depth, not keeping width/height proportional. */
  stretchToFitDepth(depth: number, kwargs: Parameters<this["applyPointsFunctionAboutPoint"]>[1] = {}) {
    return this.rescaleToFit(depth, 2, true, kwargs)
  }

  setCoord(value: number, dim: number, direction = ORIGIN) {
    const curr = this.getCoord(dim, direction);
    const shiftVect = new Array(this.dim).fill(0) as Pt3;
    shiftVect[dim] = value - curr;
    this.shift(shiftVect);
    return this;
  }

  /** Set x value of the center of the {@link Mobject} */
  setX(x: number, direction = ORIGIN) {
    return this.setCoord(x, 0, direction);
  }

  /** Set y value of the center of the {@link Mobject} */
  setY(y: number, direction = ORIGIN) {
    return this.setCoord(y, 0, direction);
  }

  /** Set z value of the center of the {@link Mobject} */
  setZ(z: number, direction = ORIGIN) {
    return this.setCoord(z, 0, direction);
  }

  /** Move center of the {@link Mobject} to certain coordinate. */
  moveTo(pointOrMobject: Pt3 | Mobject, {alignedEdge = ORIGIN, coorMask = [1, 1, 1] as Pt3} = {}) {
    let target: Pt3;
    if (pointOrMobject instanceof Mobject) {
      target = pointOrMobject.getCriticalPoint(alignedEdge);
    } else {
      target = pointOrMobject;
    }
    const pointToAlign = this.getCriticalPoint(alignedEdge);
    this.shift($sub(target, pointToAlign).map((vi, i) => vi * coorMask[i]) as Pt3);
    return this;
  }

  /** The width of the mobject. */
  get width() {
    // Get the length across the X dimension
    return this.lengthOverDim(0);
  }

  set width(value) {
    this.scaleToFitWidth(value);
  }

  /** The height of the mobject. */
  get height() {
    // Get the length across the Y dimension
    return this.lengthOverDim(1);
  }

  set height(value) {
    this.scaleToFitHeight(value);
  }

  $render(targets: {
    canvas: HTMLCanvasElement;
    div: HTMLDivElement;
    svg: SVGSVGElement;
  }) {}

  setColor(color = YELLOW_C) {
    this.color = color;
    return this;
  }

  // Errors
  throwErrorIfNoPoints(callerName: keyof Mobject) {
    if (this.hasNoPoints()) {
      throw new Error(`Cannot call Mobject.${callerName} for a Mobject with no points`);
    }
  }
}
