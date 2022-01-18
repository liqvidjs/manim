import {DEFAULT_DOT_RADIUS, ORIGIN, TWOPI} from "../constants";
import {WHITE} from "../utils/color";
import {Pt3} from "../utils/js";
import {Mobject} from "./mobject";
import {VMobject} from "./types/vectorized_mobject";

export class TipableVMobject extends VMobject {
  constructor(...kwargs: ConstructorParameters<typeof VMobject>) {
    super(...kwargs);
  }
}

/**
 * A circular arc.
 */
export class Arc extends TipableVMobject {
  angle: number;
  arcCenter: Pt3;
  radius: number;
  startAngle: number;

  constructor({
    angle = TWOPI/4,
    arcCenter = ORIGIN,
    radius = 1,
    startAngle = 0,
    ...kwargs
  }: {
    angle?: number;
    arcCenter?: Pt3;
    radius?: number;
    startAngle?: number;
  } & ConstructorParameters<typeof VMobject>[0] = {}) {
    super(kwargs, {radius, arcCenter, startAngle, angle});
      // this.num_components = num_components;
  }

  generatePoints() {
    this.setPrePositionedPoints();
    // this.scale(this.radius);
    // this.shift(this.arcCenter);
  }

  setPrePositionedPoints() {
    this.points = [this.arcCenter];
    // anchors = np.array(
    //     [
    //         np.cos(a) * RIGHT + np.sin(a) * UP
    //         for a in np.linspace(
    //             self.start_angle,
    //             self.start_angle + self.angle,
    //             self.num_components,
    //         )
    //     ],
    // )
    // # Figure out which control points will give the
    // # Appropriate tangent lines to the circle
    // d_theta = self.angle / (self.num_components - 1.0)
    // tangent_vectors = np.zeros(anchors.shape)
    // # Rotate all 90 degrees, via (x, y) -> (-y, x)
    // tangent_vectors[:, 1] = anchors[:, 0]
    // tangent_vectors[:, 0] = -anchors[:, 1]
    // # Use tangent vectors to deduce anchors
    // handles1 = anchors[:-1] + (d_theta / 3) * tangent_vectors[:-1]
    // handles2 = anchors[1:] - (d_theta / 3) * tangent_vectors[1:]
    // self.set_anchors_and_handles(anchors[:-1], handles1, handles2, anchors[1:])
  }
}

/**
 * A circle.
 */
export class Circle extends Arc {
  constructor(...kwargs: ConstructorParameters<typeof Arc>) {
    super(...kwargs);
  }

  $render({svg}: {svg: SVGSVGElement}) {
    const circle = document.createElementNS(svg.namespaceURI, "circle") as SVGCircleElement;
    circle.setAttribute("cx", String(this.arcCenter[0]));
    circle.setAttribute("cy", String(-this.arcCenter[1]));
    circle.setAttribute("r", String(this.radius));
    circle.setAttribute("fill", this.color);

    svg.appendChild(circle);
  }
}

/**
 * A circle with a very small radius.
 */
export class Dot extends Circle {
  constructor({
    color = WHITE,
    // fillOpacity = 1,
    point = ORIGIN,
    radius = DEFAULT_DOT_RADIUS,
    // strokeWidth = 0
  }: {
    /** The color of the dot. */
    color?: string;

    /** The opacity of the dot's fill colour. */
    fillOpacity?: number;

    /** The location of the dot. */
    point?: Pt3;

    /** The radius of the dot. */
    radius?: number;

    /** The thickness of the outline of the dot. */
    strokeWidth?: number;
  }) {
    super({
      arcCenter: point,
      radius,
      // strokeWidth,
      // fillOpacity,
      color
    });
  }
}

export class Line extends TipableVMobject {
  constructor(public start: Pt3, public end: Pt3) {
    super({}, {start, end});
  }

  generatePoints() {
    this.points = [this.start, this.end];
  }

  $render({svg}: {svg: SVGSVGElement}) {
    const line = document.createElementNS(svg.namespaceURI, "line");
    line.setAttribute("x1", String(this.start[0]));
    line.setAttribute("y1", String(-this.start[1]));
    line.setAttribute("x2", String(this.end[0]));
    line.setAttribute("y2", String(-this.end[1]));
    line.setAttribute("stroke", this.color);
    line.setAttribute("stroke-width", String(this.strokeWidth));

    svg.appendChild(line);
  }
}

/**
 * A generalized {@link Polygon}, allowing for disconnected sets of edges.
 */
export class Polygram extends VMobject {
  constructor(kwargs: ConstructorParameters<typeof VMobject>[0] = {}) {
    super(kwargs);
  }
}

/**
 * A shape consisting of one closed loop of vertices.
 */
export class Polygon extends Polygram {
  constructor(kwargs: ConstructorParameters<typeof Polygram>[0] = {}) {
    super(kwargs);
  }
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

  $render({svg}: {svg: SVGSVGElement}) {
    const rect = document.createElementNS(svg.namespaceURI, "rect") as SVGRectElement;
    rect.setAttribute("x", String(this.points[0] - this.width / 2));
    rect.setAttribute("y", String(-this.height / 2 -this.points[1]));
    rect.setAttribute("height", String(this.height));
    rect.setAttribute("width", String(this.height));
    rect.setAttribute("fill", this.color);

    svg.appendChild(rect);
  }
}

/** A {@link Polygram} with regularly spaced vertices. */
export class RegularPolygram extends Polygram {
  constructor(kwargs: ConstructorParameters<typeof Polygram>[0]) {
    super(kwargs);
  }
}

/** An n-sided regular {@link Polygon}. */
export class RegularPolygon extends RegularPolygram {
  /** The number of sides of the {@link RegularPolygon}. */
  public n: number;

  constructor({n = 6, ...kwargs}: {
    n?: number;
  } & ConstructorParameters<typeof Mobject>[0] = {}) {
    super(kwargs);
    this.n = n;
  }

  $render({svg}: {svg: SVGSVGElement}) {
    const [cx, cy] = this.points[0];
    const radius = 1;
    const startAngle = TWOPI/4;
    let d = `M ${cx + radius * Math.cos(startAngle)} ${-cy -radius * Math.sin(startAngle)}`;
    for (let i = 1; i <= this.n; ++i) {
      const angle = startAngle + TWOPI * i / this.n;
      d += `L ${cx + radius * Math.cos(angle)} ${-cy -radius * Math.sin(angle)}`;
    }
    d += ` z`;

    const path = document.createElementNS(svg.namespaceURI, "path") as SVGPathElement;
    path.setAttribute("d", d);
    path.setAttribute("fill", this.color);
    svg.appendChild(path);
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
