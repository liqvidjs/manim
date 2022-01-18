import {VMobject} from "../types/vectorized_mobject";

export class SVGPathMobject extends VMobject {
  pathString: string;

  constructor(pathString: string, kwargs: ConstructorParameters<typeof VMobject>[0] = {}) {
    super(kwargs, {pathString});
  }

  /** Generates points from a given SVG `d` attribute. */
  generatePoints() {
    const matches = this.pathString.match(/M([\d.-]+)\s+([\d.-]+)/i);
    this.points = [[parseFloat(matches[1]), -parseFloat(matches[2]), 0]];
    // pattern = "[%s]" % ("".join(self.get_path_commands()))
    // pairs = list(
    //     zip(
    //         re.findall(pattern, self.path_string),
    //         re.split(pattern, self.path_string)[1:],
    //     ),
    // )
    // # Which mobject should new points be added to
    // prev_command = None
    // for command, coord_string in pairs:
    //     self.handle_command(command, coord_string, prev_command)
    //     prev_command = command
    // # people treat y-coordinate differently
    // self.rotate(np.pi, RIGHT, about_point=ORIGIN)
  }

  $render({svg}: {svg: SVGSVGElement}) {
    const path = document.createElementNS(svg.namespaceURI, "path") as SVGPathElement;
    const start = this.points[0];

    // FUCK
    const d = this.pathString.replace(/M([\d.-]+)\s+([\d.-]+)/i, `M ${start[0]} ${-start[1]}`);

    path.setAttribute("d", d);
    path.setAttribute("fill", "#FFF");
    path.setAttribute("stroke-width", "0");

    // path.setAttribute("transform-origin", `center`);
    // path.setAttribute("stroke", "#FFF");

    svg.appendChild(path);
    // yikes lmao
    const scale = this.targetWidth / path.getBBox().width;
    path.setAttribute("transform", `translate(${start[0]} ${-start[1]}) scale(${scale}) translate(${-start[0]} ${start[1]})`);
  }
}
