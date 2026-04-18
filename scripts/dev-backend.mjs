import path from "node:path";
import { runBackendPython } from "./backend-exec.mjs";

const backendDir = path.join(process.cwd(), "fastapi_backend");
const args = [
  "-m",
  "uvicorn",
  "app.main:app",
  "--host",
  "0.0.0.0",
  "--port",
  "8001",
  "--reload",
];

const code = runBackendPython(args, backendDir);
if (code !== 0) {
  console.error("");
  console.error(
    "Backend could not start. Install dependencies first, for example:",
  );
  console.error("  npm run setup:backend");
  console.error("Or install uv: https://docs.astral.sh/uv/");
  process.exit(code || 1);
}
