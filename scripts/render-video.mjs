import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { browserExecutable, chromiumOptions, logRenderEnv } from "./lib/render-env.mjs";


const outputLocation = path.resolve(process.argv[2] || "out/demo/Demo_Video_Final.mp4");
fs.mkdirSync(path.dirname(outputLocation), { recursive: true });


logRenderEnv();
console.log("Bundling DemoShort with Remotion...");
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  publicDir: path.resolve("public"),
});

console.log("Selecting composition DemoShort...");
const composition = await selectComposition({
  serveUrl,
  id: "DemoShort",
  browserExecutable,
  chromiumOptions,
});

const t0 = Date.now();
console.log(`Rendering full 3D video (${composition.durationInFrames} frames = ${(composition.durationInFrames/30).toFixed(1)}s) -> ${outputLocation}...`);
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation,
  crf: 18,
  concurrency: 2,
  browserExecutable,
  chromiumOptions,
  timeoutInMilliseconds: 600000,
  onProgress: ({ renderedFrames, encodedFrames, progress }) => {
    if (renderedFrames % 150 === 0 || progress === 1) {
      console.log(`Progress: ${(progress * 100).toFixed(1)}% (rendered ${renderedFrames}/${composition.durationInFrames}, encoded ${encodedFrames})`);
    }
  },
});

console.log(`Full video render completed in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outputLocation}`);
