import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { applyTheme, readTheme } from "./theme.ts";

applyTheme(readTheme());

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");

// Capturar errores fatales y mostrarlos en pantalla para QA
function showBootError(e: unknown) {
  const msg = e instanceof Error ? `${e.message}\n${e.stack || ""}` : String(e);
  console.error("[boot]", e);
  if (root) {
    root.innerHTML = "";
    const pre = document.createElement("pre");
    pre.style.cssText = "color:#fca5a5;background:#0a0a0a;padding:16px;white-space:pre-wrap;font:12px ui-monospace,monospace;margin:0;min-height:100vh;box-sizing:border-box;";
    pre.textContent = msg;
    root.appendChild(pre);
  }
}

try {
  createRoot(root).render(<App />);
} catch (e) {
  showBootError(e);
}

window.addEventListener("error", (e) => {
  // Solo errores fatales que rompen la UI
  if (e.error && !document.querySelector("#root pre")) showBootError(e.error);
});
window.addEventListener("unhandledrejection", (e) => {
  if (e.reason) showBootError(e.reason);
});
