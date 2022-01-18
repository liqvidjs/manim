import {VMobject} from "../types/vectorized_mobject";
import type * as Katex from "katex";
import {BLACK, WHITE} from "../../utils/color";
import {ORIGIN} from "../../constants";
import {Mobject} from "../mobject";

declare global {
  const katex: typeof Katex;
}

/** Elementary building block for rendering text with LaTeX. */
export class SingleStringMathTex extends VMobject {
  fillColor: string;
  tex: string;
  
  constructor(tex: string, opts: {
    fillColor?: string;
  } = {}) {
    super();
    this.fillColor = opts.fillColor ?? BLACK;
    this.tex = tex;
  }

  generatePoints() {
    this.points = [ORIGIN];
  }

  $render({div}: {div: HTMLDivElement}) {
    // render
    const span = document.createElement("span");
    Object.assign(span.style, {
      color: this.fillColor,
      fontSize: "21em"
    });
    katex.render(this.tex, span);
    div.appendChild(span);

    // measure and position
    const rect = span.getBoundingClientRect();
    const prect = div.getBoundingClientRect();
    Object.assign(span.style, {
      left: `calc(50% - ${rect.width / prect.width / 2 * 100}% + ${this.points[0] * 10}%)`,
      top: `calc(50% - ${rect.height / prect.height / 2 * 100}% + ${-this.points[1] * 10}%)`
    });
  }
}

/** A string compiled with LaTeX in math mode. */
export class MathTex extends SingleStringMathTex {
  constructor(tex: string, opts: ConstructorParameters<typeof SingleStringMathTex>[1] = {}) {
    super(tex, opts);
  }
}

/** A string compiled with LaTeX in normal mode. */
export class Tex extends Mobject {
  tex: string;

  constructor(tex: string) { 
    super();
    this.tex = tex;
    this.color = WHITE;
  }

  generatePoints() {
    this.points = [ORIGIN];
  }

  $render({div}: {div: HTMLDivElement}) {
    const center = this.getCenter();

    // render
    const span = document.createElement("span");
    Object.assign(span.style, {
      color: this.color,
      fontFamily: "KaTeX_Main",
      fontSize: "3em"
    });
    span.textContent = this.tex;
    div.appendChild(span);

    // measure and position
    const rect = span.getBoundingClientRect();
    const prect = div.getBoundingClientRect();
    Object.assign(span.style, {
      left: `calc(50% - ${rect.width / prect.width / 2 * 100}% + ${center[0] * 10}%)`,
      top: `calc(50% - ${rect.height / prect.height / 2 * 100}% + ${-center[1] * 10}%)`
    });
  }
  }
}
