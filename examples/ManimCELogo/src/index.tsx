import * as ReactDOM from "react-dom";

import {Player} from "liqvid";
import {Demo} from "./Demo";

// resources
import controls from "@env/controls";
import {script} from "./markers";

function Lesson() {
  return (
    <Player controls={controls} script={script}>
      <Demo/>
    </Player>
  );
}

ReactDOM.render(<Lesson/>, document.querySelector("main"));
