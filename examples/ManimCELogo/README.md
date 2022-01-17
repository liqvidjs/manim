This is a basic project template for [Liqvid](https://liqvidjs.org).

## Installation

Clone this repository, then do

```bash
yarn install
liqvid serve
```

## Recording

Click on the recording (circle) icon in the controls.

Select Markers for recording. Use the keyboard command to start/stop recording. Then:

1. Save the audio file (if any) to `audio/audio.webm`.

2. Copy the markers to `src/markers.ts`.

3. Copy the code recording to `src/recordings.ts`.

## Replaying

To view the code recording, change `src/@production/media-url.ts` to export `"."`. (Once you are satisfied with your recording, you should upload your audio files to a static assets host and put that as the media URL instead.) Then compile in **production** mode:

```bash
liqvid build
```

## Mastering

After recording, run [`liqvid audio convert`](https://liqvidjs.org/docs/cli/audio#convert) on any `.webm` files you record.

To generate thumbnail previews for the ractive, use [`liqvid thumbs`](https://liqvidjs.org/docs/cli/thumbs). These should again be uploaded to your static assets host.

To produce a static rendering of the ractive, use [`liqvid render`](https://liqvidjs.org/docs/cli/render/).

## Tips

Beware that `@env` is a magic directory that refers to either `src/@development` or `src/@production` depending on `NODE_ENV`. This is specified in `webpack.config.js`.
