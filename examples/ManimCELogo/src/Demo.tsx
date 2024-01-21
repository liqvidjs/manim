import {Circle, LEFT, RIGHT, Scene, Square, Triangle, UP, VGroup} from "../../../dist/index.js";

const {raw} = String;

export class Demo extends Scene {
  constructor(props) {
    super(props);
    const logo_green = "#87c2a5";
    const logo_blue = "#525893";
    const logo_red = "#e07a5f";
    const logo_black = "#343434";

    // const ds_m = MathTex(raw`\mathbb{M}`, fill_color = logo_black).scale(7)
    // ds_m.shift(2.25 * LEFT + 1.5 * UP)
    const circle = new Circle({color: logo_green}).shift(LEFT);
    const square = new Square({color: logo_blue}).shift(UP);
    const triangle = new Triangle({color: logo_red}).shift(RIGHT);
    const logo = new VGroup(/*triangle,*/ square, circle);//triangle, square, circle, ds_m)  # order matters
    // logo.move_to(ORIGIN)
    this.add(logo);
  }
}
