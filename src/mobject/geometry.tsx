import {VMobject} from "./types/vectorized_mobject";
import {BLUE, RED, WHITE} from "../utils/color";
import {TWOPI, ORIGIN} from "../constants";

export class TipableVMobject extends VMobject {
  constructor() {
    super();
  }
}

/**
 * A circular arc.
 */
export class Arc extends TipableVMobject {
  angle: number;
  arcCenter: number[];
  radius: number;
  startAngle: number;

  constructor({
    angle = TWOPI/4,
    arcCenter = ORIGIN,
    radius = 1,
    startAngle = 0
  }) {
    super();

    this.radius = radius;
    // this.num_components = num_components;
    this.arcCenter = arcCenter;
    this.startAngle = startAngle;
    this.angle = angle;
  }
}

/**
 * A circle.
 */
export class Circle extends Arc {
  color: string;

  constructor({color = RED}) {
    super({});
    this.color = color;
  }

  render() {
    return (<circle key={this.key} cx={this.points[0]} cy={-this.points[1]} r={1} fill={this.color}/>);
  }
}

/**
 * A generalized {@link Polygon}, allowing for disconnected sets of edges.
 */
export class Polygram extends VMobject {
  /** The color of the {@link Polygram}. */
  color: string;

  constructor({color = BLUE} = {}) {
    super();
    this.color = color;
  }
}

/**
 * A shape consisting of one closed loop of vertices.
 */
export class Polygon extends Polygram {

}

/** A quadrilateral with two sets of parallel sides. */
export class Rectangle extends Polygon {
  /** The color of the rectangle. */
  color: string;

  /** The vertical height of the rectangle. */
  height: number;

  /** The horizontal width of the rectangle. */
  width: number;

  constructor({
    color = WHITE,
    height = 2.0,
    width = 4.0
  } = {}) {
    super();

    this.color = color;
    this.height = height;
    this.width = width;
  }

  render() {
    return (<rect key={this.key} x={this.points[0] - this.width / 2} y={-this.height / 2 -this.points[1]} height={this.height} width={this.width} fill={this.color}/>);
  }
}

/** A {@link Polygram} with regularly spaced vertices. */
export class RegularPolygram extends Polygram {}

/** An n-sided regular {@link Polygon}. */
export class RegularPolygon extends RegularPolygram {
  /** The number of sides of the {@link RegularPolygon}. */
  public n: number;

  constructor({n = 6, ...kwargs}: {
    n?: number;
  } & ConstructorParameters<typeof Polygram>[0] = {}) {
    super(kwargs);
    this.n = n;
  }

  render() {
    const [cx, cy] = this.points;
    const radius = 1;
    const startAngle = TWOPI/4;
    let d = `M ${cx + radius * Math.cos(startAngle)} ${-cy -radius * Math.sin(startAngle)}`;
    for (let i = 1; i <= this.n; ++i) {
      const angle = startAngle + TWOPI * i / this.n;
      d += `L ${cx + radius * Math.cos(angle)} ${-cy -radius * Math.sin(angle)}`;
    }
    d += ` z`;
    return (<path key={this.key} d={d} fill={this.color}/>)
  }
}

/** A rectangle with equal side lengths. */
export class Square extends Rectangle {
  constructor({sideLength = 2, ...kwargs}: {
    sideLength?: number;
  } & ConstructorParameters<typeof Rectangle>[0] = {}) {
    super({height: sideLength, width: sideLength, ...kwargs});
  }
}

/** An equilateral triangle. */
export class Triangle extends RegularPolygon {
  constructor(args: ConstructorParameters<typeof RegularPolygon>[0]) {
    super({n: 3, ...args});
  }
}
