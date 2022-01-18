import {PureComponent} from "react";
import {Mobject} from "../mobject/mobject";


interface Props {

}

/**
 * A Scene is the canvas of your animation.
 * 
 * The primary role of {@link Scene} is to provide the user with tools to manage
 * mobjects and animations.  Generally speaking, a manim script consists of a class
 * that derives from {@link Scene} whose constructor method is overridden
 * by the user's code.
 * 
 * Mobjects are displayed on screen by calling {@link Scene.add} and removed from
 * screen by calling {@link Scene.remove}.  All mobjects currently on screen are kept
 * in {@link Scene.mobjects}.  Animations are played by calling {@link Scene.play}.
 * 
 * A {@link Scene} is rendered internally by calling {@link Scene.render.  This in
 *  turn calls {@link Scene.setup}, {@link Scene.construct}, and
 * {@link Scene.tear_down}, in that order.
 * 
 * It is not recommended to override the ``__init__`` method in user Scenes.  For code
 * that should be ran before a Scene is rendered, use {@link Scene.setup} instead.
 */
export class Scene extends PureComponent {
  canvas: HTMLCanvasElement;
  div: HTMLDivElement;
  svg: SVGSVGElement;
  
  mobjects: Mobject[];

  constructor(props: Props = {}) {
    super(props);

    this.mobjects = [];
  }

  componentDidMount() {
    for (const mob of this.mobjects) {
      mob.$render({canvas: this.canvas, div: this.div, svg: this.svg});
    }
  }

  /**
   * Mobjects will be displayed, from background to
   * foreground in the order with which they are added.
   * 
   * @param mobjects {@link Mobject Mobjects}s to add
   * @returns The same scene after adding the Mobjects in.
   */
  add(...mobjects: Mobject[]) {
    this.mobjects.push(...mobjects);
  }

  render() {
    return (
      <div className="manim-scene" ref={ref => this.div = ref}>
        <svg viewBox="-5 -5 10 10" ref={ref => this.svg = ref}/>
        {/*<canvas ref={ref => this.canvas = ref}/>*/}
        {this.props.children}
      </div>
    );
  }
}
