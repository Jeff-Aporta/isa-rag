/**
 * spa-nav.ts — navegacion SPA via query string base64url.
 * Mantiene el resto de parametros (?conn=, ?cb=, etc.) intactos.
 *
 * Formato: ?s=<base64url del estado>
 *   - estado minimo: { v: <mainView>, sid?: <spaceId> }
 *   - json.stringify + encodeURIComponent + btoa("url-safe")
 *
 * El estado se sincroniza en ambos sentidos:
 *   - readStateFromUrl() al arrancar
 *   - writeStateToUrl() en cada navegacion
 *   - listenUrlChange() para popstate
 */

/** codifica un objeto a base64url seguro para query string */
function b64urlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  // btoa no soporta caracteres fuera de latin1; usamos encodeURIComponent + unescape
  // para mantenerlo portable en cualquier entorno (sin Buffer).
  const utf8 = unescape(encodeURIComponent(json));
  return btoa(utf8)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/** decodifica base64url a objeto. Si falla devuelve null. */
function b64urlDecode(raw: string): unknown | null {
  try {
    const padded = raw.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const utf8 = atob(padded + pad);
    const json = decodeURIComponent(escape(utf8));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** estado persistible en la url */
export interface SpaState {
  /** vista actual: "home" | "chat" | "questions" | "chunks" */
  v: "home" | "chat" | "questions" | "chunks";
  /** space activo (si hay) */
  sid?: string;
}

/** lee estado desde la url actual. devuelve null si no hay o si es invalido. */
export function readStateFromUrl(): SpaState | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const s = url.searchParams.get("s");
  if (!s) return null;
  const parsed = b64urlDecode(s);
  if (!parsed || typeof parsed !== "object") return null;
  const st = parsed as Partial<SpaState>;
  if (st.v !== "home" && st.v !== "chat" && st.v !== "questions" && st.v !== "chunks") {
    return null;
  }
  return { v: st.v, ...(typeof st.sid === "string" ? { sid: st.sid } : {}) };
}

/** escribe estado en la url sin recargar la pagina. reemplaza history entry actual. */
export function writeStateToUrl(state: SpaState): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("s", b64urlEncode(state));
  // replace para no ensuciar el historial con cada navegacion interna
  window.history.replaceState(window.history.state, "", url.toString());
}

/** limpia el parametro ?s= de la url. */
export function clearStateFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (url.searchParams.has("s")) {
    url.searchParams.delete("s");
    window.history.replaceState(window.history.state, "", url.toString());
  }
}

/** suscribe al evento popstate (back/forward del navegador). devuelve unsubscribe. */
export function onUrlChange(handler: (state: SpaState | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onPop = () => handler(readStateFromUrl());
  window.addEventListener("popstate", onPop);
  return () => window.removeEventListener("popstate", onPop);
}
