// Cross-platform render environment for the Remotion render scripts.
// Replaces the hardcoded Windows paths (D:/remotion-tmp, C:/Program Files/Google/Chrome/...).
// Overrides: REMOTION_TMP (temp dir), CHROME_PATH (browser binary), REMOTION_GL (e.g. "angle").
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const exists = (p) => {
  try {
    return !!p && fs.existsSync(p);
  } catch {
    return false;
  }
};

const isExecutable = (p) => {
  try {
    fs.accessSync(p, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const findOnPath = (names) => {
  const dirs = (process.env.PATH || "").split(path.delimiter).filter(Boolean);
  const exts = process.platform === "win32" ? [".exe", ".cmd", ""] : [""];
  for (const name of names) {
    for (const dir of dirs) {
      for (const ext of exts) {
        const candidate = path.join(dir, name + ext);
        if (exists(candidate) && isExecutable(candidate)) return candidate;
      }
    }
  }
  return null;
};

// 1. Temp dir: Remotion bundles a copy of public/ per render and never cleans it up,
//    so keep it on a roomy disk (REMOTION_TMP) and default to the OS temp dir.
export const remTmp = path.resolve(
  process.env.REMOTION_TMP || path.join(os.tmpdir(), "remotion-tmp"),
);
fs.mkdirSync(remTmp, { recursive: true });
process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP = remTmp;

// 2. Browser: explicit CHROME_PATH -> known system locations -> PATH lookup.
//    null lets Remotion resolve/download its own Chromium Headless Shell.
export const browserExecutable = (() => {
  if (process.env.CHROME_PATH) {
    if (!exists(process.env.CHROME_PATH)) {
      throw new Error(`CHROME_PATH does not exist: ${process.env.CHROME_PATH}`);
    }
    return process.env.CHROME_PATH;
  }
  const known = {
    linux: [
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/snap/bin/chromium",
    ],
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ],
    win32: [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    ],
  }[process.platform] ?? [];
  return known.find((p) => exists(p) && isExecutable(p)) ?? null;
})();

// 3. GL backend: Angle only when asked for (the Windows-only preset this used to hardcode).
export const chromiumOptions = process.env.REMOTION_GL
  ? { gl: process.env.REMOTION_GL }
  : {};

export const renderConfig = {
  browserExecutable,
  chromiumOptions,
  remTmp,
};

export const logRenderEnv = () => {
  console.log(
    `[render-env] platform=${process.platform} node=${process.version} tmp=${remTmp} browser=${
      browserExecutable ?? "remotion-default"
    } gl=${process.env.REMOTION_GL || "default"}`,
  );
};

export default renderConfig;
