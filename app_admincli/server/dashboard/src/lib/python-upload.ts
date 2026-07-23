import "server-only";

import { spawn } from "node:child_process";
import path from "node:path";

export type UploadActionResult = {
  endpoint?: string;
  endpoints?: string[];
  removed?: number;
  error?: string;
};

/** Resolve the Python used by the admin CLI (override with ADMIN_PYTHON). */
function pythonCommand(): { cmd: string; prefix: string[] } {
  const raw = (process.env.ADMIN_PYTHON || "").trim();
  if (raw) {
    const parts = raw.split(/\s+/);
    return { cmd: parts[0]!, prefix: parts.slice(1) };
  }
  if (process.platform === "win32") {
    return { cmd: "py", prefix: ["-3.13"] };
  }
  return { cmd: "python3", prefix: [] };
}

function actionScriptPath(): string {
  // dashboard/ -> server/ -> upload_action.py
  return path.resolve(process.cwd(), "..", "upload_action.py");
}

/** Run one upload/remove/purge action via the same Python helpers the CLI uses. */
export function runUploadAction(body: Record<string, unknown>): Promise<UploadActionResult> {
  const { cmd, prefix } = pythonCommand();
  const script = actionScriptPath();
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [...prefix, script], {
      cwd: path.resolve(process.cwd(), "..", ".."),
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      let parsed: UploadActionResult | null = null;
      try {
        parsed = JSON.parse(stdout.trim() || "{}") as UploadActionResult;
      } catch {
        parsed = null;
      }
      if (parsed && typeof parsed === "object") {
        if (code === 0) {
          resolve(parsed);
          return;
        }
        resolve({ error: parsed.error || stderr.trim() || "The upload did not go through" });
        return;
      }
      reject(
        new Error(
          stderr.trim() ||
            (code === 0 ? "Empty response from upload helper" : `Upload helper exited with code ${code}`),
        ),
      );
    });

    child.stdin.write(payload);
    child.stdin.end();
  });
}
