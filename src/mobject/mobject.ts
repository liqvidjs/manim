import {ORIGIN} from "../constants";

let key = 0;

/**
 * Mathematical Object: base class for objects that can be displayed on screen.
 */
export class Mobject {
  key: string;

  /** The points of the objects. */
  points: number[];

  /** The contained objects. */
  submobjects: Mobject[];
  

  constructor() {
    this.key = (key++).toString();
    this.submobjects = [];
    this.points = [0, 0, 0];
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

  /**
   * Shift by the given vectors.
   * @param vectors Vectors to shift by. If multiple vectors are given, they are added together.
   */
  shift(...vectors: number[][]) {
    const totalVector = vectors.reduce(addVectors, ORIGIN);
    for (const mob of this.submobjects) {
      mob.points = addVectors(mob.points, totalVector);
    }
    this.points = addVectors(this.points, totalVector);
    return this;
  }

  render() {}
}

function addVectors(a: number[], b: number[]) {
  return a.map((ai, i) => ai + b[i]);
}