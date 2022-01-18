import {DEFAULT_MOBJECT_TO_MOBJECT_BUFFER} from "../..";
import {DOWN, LEFT, RIGHT, UL} from "../../constants";
import {$add, $normalize, $scale, $sub, Pt3} from "../../utils/js";
import {Mobject} from "../mobject";
import {VMobject} from "../types/vectorized_mobject";
import {SVGPathMobject} from "./svg_path";
import {MathTex, Tex} from "./tex_mobject";

const pathStringTemplate =
  "m0.01216 0c-0.01152 0-0.01216 6.103e-4 -0.01216 0.01311v0.007762c0.06776 " +
  "0.122 0.1799 0.1455 0.2307 0.1455h{0}c0.03046 3.899e-4 0.07964 0.00449 " +
  "0.1246 0.02636 0.0537 0.02695 0.07418 0.05816 0.08648 0.07769 0.001562 " +
  "0.002538 0.004539 0.002563 0.01098 0.002563 0.006444-2e-8 0.009421-2.47e-" +
  "5 0.01098-0.002563 0.0123-0.01953 0.03278-0.05074 0.08648-0.07769 0.04491" +
  "-0.02187 0.09409-0.02597 0.1246-0.02636h{0}c0.05077 0 0.1629-0.02346 " +
  "0.2307-0.1455v-0.007762c-1.78e-6 -0.0125-6.365e-4 -0.01311-0.01216-0.0131" +
  "1-0.006444-3.919e-8 -0.009348 2.448e-5 -0.01091 0.002563-0.0123 0.01953-" +
  "0.03278 0.05074-0.08648 0.07769-0.04491 0.02187-0.09416 0.02597-0.1246 " +
  "0.02636h{1}c-0.04786 0-0.1502 0.02094-0.2185 0.1256-0.06833-0.1046-0.1706" +
  "-0.1256-0.2185-0.1256h{1}c-0.03046-3.899e-4 -0.07972-0.004491-0.1246-0.02" +
  "636-0.0537-0.02695-0.07418-0.05816-0.08648-0.07769-0.001562-0.002538-" +
  "0.004467-0.002563-0.01091-0.002563z";

const defaultMinWidth = 0.90552;

/**
 * Takes a mobject and draws a brace adjacent to it. Passing a direction vector
 * determines the direction from which the brace is drawn. By default it is drawn from below.
 */
export class Brace extends SVGPathMobject {
  buff: number;

  constructor(mobject: VMobject, {
    buff = 0.2,
    direction = DOWN,
    sharpness = 2
  }: {
    buff?: number;
    direction?: number[];
    sharpness?: number;
  } = {}) {
    const angle = -Math.atan2(direction[1], direction[0]) + Math.PI;
    // mobject.rotate(-angle, about_point=ORIGIN)
    const left = mobject.getCorner($add(DOWN, LEFT));
    const right = mobject.getCorner($add(DOWN, RIGHT));

    const targetWidth = right[0] - left[0];
    const linearSectionLength = Math.max(0, (targetWidth * sharpness - defaultMinWidth) / 2);

    let d = pathStringTemplate;
    d = d.replace(/\{0\}/g, String(linearSectionLength));
    d = d.replace(/\{1\}/g, String(-linearSectionLength));

    super(d);
    this.buff = buff;
    // super().__init__(
    //     path_string=path,
    //     stroke_width=stroke_width,
    //     fill_opacity=fill_opacity,
    //     background_stroke_width=background_stroke_width,
    //     background_stroke_color=background_stroke_color,
    //     **kwargs
    // )
    this.stretchToFitWidth(targetWidth);
    this.targetWidth = targetWidth;
    this.shift(left, $scale(this.getCorner(UL), -1), $scale(DOWN, this.buff));

    // for mob in mobject, self:
    //     mob.rotate(angle, about_point=ORIGIN)
  }

  putAtTip(mob: Mobject, {buff = DEFAULT_MOBJECT_TO_MOBJECT_BUFFER, useNextTo = true} = {}) {
    if (useNextTo) {
      mob.nextTo(this.getTip(), {direction: this.getDirection().map(vi => Math.round(vi)) as Pt3});
    } else {
      mob.moveTo(this.getTip());
      const shiftDistance = mob.width / 2 + buff;
      mob.shift($scale(this.getDirection(), shiftDistance));
    }
    return this;
  }

  getText(text: string) {
    const textMob = new Tex(text);
    this.putAtTip(textMob);
    return textMob;
  }

  getTex(tex: string) {
    const texMob = new MathTex(tex);
    this.putAtTip(texMob);
    return texMob;
  }

  /** Returns the position of the seventh point in the path, which is the tip. */
  getTip() {
    return [0, -3, 0] as Pt3;
    // return this.points[28]; // = 7*4
  }

  getDirection() {
    return $normalize($sub(this.getTip(), this.getCenter()));
  }
}
