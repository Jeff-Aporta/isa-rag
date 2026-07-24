/**
 * auth-portal.ts — login ContaPyme via ISS DataSnap (NO worker).
 *
 * Por qué existe: el login de usuarios ContaPyme se hace contra
 * DataSnap (dsclientes) a traves del ISS staging. El worker isa-rag
 * NO debe manejar credenciales propias; solo recibe un JWT ya firmado
 * por ISS y lo valida con el mismo JWT_SECRET.
 *
 * Ver skill: ~/.cursor/skills/dsclientes-contapyme/SKILL.md
 */

const ISS_STAGING = "https://ayudascp-ia-staging.azurewebsites.net";
const ISS_PROD = "https://ayudascp-ia.azurewebsites.net";

/** Selecciona ISS segun ?iss=prod en la URL; por defecto staging. */
function issBase(): string {
  try {
    const q = new URLSearchParams(location.search).get("iss");
    if (q === "prod") return ISS_PROD;
  } catch {
    /* ignore */
  }
  return ISS_STAGING;
}

export interface PortalLoginRequest {
  semail: string;
  password: string;
  itercero?: string;
}

export interface PortalLoginClaims {
  itercero?: string;
  icontacto?: string;
  nombres?: string;
  apellidos?: string;
  controlkey?: string;
  iapp?: number;
  idmaquina?: string;
  ientity?: string;
  iat?: number;
  exp?: number;
}

export interface PortalLoginResponse {
  ok: boolean;
  token: string;
  claims?: PortalLoginClaims;
  /** cuando hay multi-empresa, el ISS pide confirmacion */
  code?: "MULTI_EMPRESA";
  terceros?: Array<{ itercero: string; nombre: string }>;
}

export class PortalLoginError extends Error {
  status: number;
  code?: string;
  terceros?: Array<{ itercero: string; nombre: string }>;
  constructor(status: number, message: string, code?: string, terceros?: Array<{ itercero: string; nombre: string }>) {
    super(message);
    this.status = status;
    if (code) this.code = code;
    if (terceros) this.terceros = terceros;
  }
}

/**
 * Decodifica el payload de un JWT (NO verifica firma — solo lectura).
 * La verificacion la hace el worker con JWT_SECRET compartido con ISS.
 */
export function decodeJwtPayload(token: string): PortalLoginClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const json = decodeURIComponent(escape(atob(padded + pad)));
    return JSON.parse(json) as PortalLoginClaims;
  } catch {
    return null;
  }
}

/**
 * Login ContaPyme via ISS. Equivalente a:
 *   POST {ISS}/api/auth/portal-login
 *   body: { semail, password, itercero? }
 * Si ISS responde 409 + MULTI_EMPRESA, reenviar con itercero.
 */
export async function portalLogin(req: PortalLoginRequest): Promise<PortalLoginResponse> {
  const res = await fetch(`${issBase()}/api/auth/portal-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (res.status === 409) {
    const body = (await res.json().catch(() => ({}))) as {
      code?: string;
      terceros?: Array<{ itercero: string; nombre: string }>;
      error?: string;
    };
    throw new PortalLoginError(409, body.error || "multi_empresa", body.code, body.terceros);
  }
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new PortalLoginError(res.status, msg);
  }
  const body = (await res.json()) as { ok?: boolean; token: string; claims?: PortalLoginClaims };
  return {
    ok: body.ok !== false,
    token: body.token,
    claims: body.claims ?? decodeJwtPayload(body.token) ?? undefined,
  };
}

/** Mapea ientity/jagudeloe@contapyme.com → JAGUDELOE (username PatyIA). */
export function usernameFromClaims(claims: PortalLoginClaims | null | undefined): string {
  const ientity = (claims?.ientity || claims?.ientity || "").toString().trim();
  if (!ientity) return "jagudeloe";
  const local = ientity.split("@")[0] || ientity;
  return local.toUpperCase();
}
