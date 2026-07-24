// Smoke: baja el bundle y reporta el primer error al ejecutar (sin browser).
import { readFileSync, writeFileSync } from "node:fs";

const url = "https://jeff-aporta.github.io/isa-rag/_dist/js/main.js";
const code = await fetch(url).then((r) => r.text());
writeFileSync("tests/.bundle.js", code);
console.log("Bundle size:", code.length, "bytes");
console.log("Last 200 chars:", code.slice(-200));
