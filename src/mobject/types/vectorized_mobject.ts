import {DEFAULT_STROKE_WIDTH} from "../../constants";
import {Mobject} from "../mobject";

/**
 * A vectorized mobject.
 */
export class VMobject extends Mobject {
  strokeWidth: number;

  constructor(...kwargs: ConstructorParameters<typeof Mobject>) {
    super(...kwargs);

    this.strokeWidth = DEFAULT_STROKE_WIDTH;
  }
}

/**
 * A group of vectorized mobjects.
 * 
 * This can be used to group multiple {@link VMobject} instances together
 * in order to scale, move, ... them together.
 */ 
export class VGroup extends VMobject {
  constructor(...vmobjects: VMobject[]) {
    super();
    this.add(...vmobjects);
  }
  
  /**
   * Checks if all passed elements are an instance of VMobject and then add them to submobjects
   * 
   * @param vmobjects List of {@link VMobject} to add
   * @throws {TypeError} If one element of the list is not an instance of {@link VMobject}
   */ 
  add(...vmobjects: VMobject[]) {
    if (!vmobjects.every(m => m instanceof VMobject)) {
      throw new TypeError("All submobjects must be of type VMobject");
    }
    return super.add(...vmobjects);
  }

  $render(targets: Parameters<Mobject["$render"]>[0]) {
    for (const mob of this.submobjects) {
      mob.$render(targets);
    }
  }
}
