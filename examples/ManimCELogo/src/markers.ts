import {Script} from "liqvid";

export const markers = [
  ["intro/", "1:00"]
] as [string, string][];

export const script = new Script(markers);
export const playback = script.playback;
