import * as ReactDOM from "react-dom";

import {Playback, Player} from "liqvid";
import {Demo} from "./Demo";

// resources
const playback = new Playback({duration: 60000});

function Lesson() {
  return (
    <Player playback={playback}>
      <Demo/>
    </Player>
  );
}

ReactDOM.render(<Lesson/>, document.querySelector("main"));
