/**
 * space-art.ts — composicion artistica para covers de space cards.
 *
 * Cada space devuelve una "mood" (paleta + estilo visual) y un set
 * de iconos con roles especificos (moon central, orbit1, orbit2,
 * accent, sparkles). El CSS se encarga de distribuirlos con
 * coordenadas propias de cada mood para que la composicion se
 * sienta artistica, no aleatoria.
 *
 * Inspiracion: covers tipo music album / generative art.
 *   - moon:  icono principal muy grande, detras, baja opacidad
 *   - orbit1: 3 iconos medianos en anillo horizontal inclinado
 *   - orbit2: 3 iconos pequenos en anillo vertical
 *   - accent: 1 icono lateral como ancla
 *   - sparkles: 4 chispas pequenas dispersas
 */

export type SpaceMood =
  | "youtube"      // cosmico magenta/rojo
  | "conta"        // verde/azul — confianza contable
  | "legal"        // purpura sobrio
  | "health"       // rosa/azul suave
  | "edu"          // amarillo/azul calido
  | "tech"         // cyan/azul frio
  | "mkt"          // naranja/rosa energetico
  | "hr"           // indigo/azul
  | "data"         // emerald oscuro
  | "ai"           // magenta neon
  | "default";     // fallback gradient

export interface SpaceArt {
  /** mood → clase CSS que define paleta + layout del cover */
  mood: SpaceMood;
  /** texto mostrado discretamente en el cover (watermark sutil) */
  label: string;
  /** icono principal, muy grande, al fondo */
  moon: string;
  /** 3 iconos medianos del anillo horizontal */
  orbit1: [string, string, string];
  /** 3 iconos pequenos del anillo vertical */
  orbit2: [string, string, string];
  /** 1 icono lateral de acento */
  accent: string;
  /** 4 chispas pequenas decorativas */
  sparkles: [string, string, string, string];
}

function norm(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Catalogo por keyword. Primer match gana. */
const CATALOG: Array<{
  test: (n: string) => boolean;
  art: Omit<SpaceArt, "label">;
}> = [
  {
    test: (n) => /^(y|yt|youtube|video|videos)/.test(n),
    art: {
      mood: "youtube",
      moon: "mdi:play-circle",
      orbit1: ["mdi:youtube", "mdi:filmstrip", "mdi:video-vintage"],
      orbit2: ["mdi:closed-caption-outline", "mdi:subtitles-outline", "mdi:microphone-variant"],
      accent: "mdi:television-classic",
      sparkles: ["mdi:star-four-points", "mdi:circle-small", "mdi:circle-small", "mdi:star-four-points"],
    },
  },
  {
    test: (n) => /(conta|contapyme|contabilidad|conta-|erp)/.test(n),
    art: {
      mood: "conta",
      moon: "mdi:calculator-variant",
      orbit1: ["mdi:chart-line", "mdi:scale-balance", "mdi:cash-multiple"],
      orbit2: ["mdi:receipt-text-outline", "mdi:trending-up", "mdi:finance"],
      accent: "mdi:bank-outline",
      sparkles: ["mdi:circle-small", "mdi:plus-circle-outline", "mdi:circle-small", "mdi:check-circle-outline"],
    },
  },
  {
    test: (n) => /(legal|jurid|abogad|ley|derecho)/.test(n),
    art: {
      mood: "legal",
      moon: "mdi:scale-balance",
      orbit1: ["mdi:gavel", "mdi:book-open-variant", "mdi:shield-check-outline"],
      orbit2: ["mdi:file-document-outline", "mdi:ribbon", "mdi:seal"],
      accent: "mdi:bank-outline",
      sparkles: ["mdi:star-four-points", "mdi:circle-small", "mdi:circle-small", "mdi:star-four-points"],
    },
  },
  {
    test: (n) => /(salud|medic|hospital|clinic|medicin)/.test(n),
    art: {
      mood: "health",
      moon: "mdi:heart-pulse",
      orbit1: ["mdi:medical-bag", "mdi:pill", "mdi:stethoscope"],
      orbit2: ["mdi:molecule", "mdi:bandage", "mdi:needle"],
      accent: "mdi:hospital-building",
      sparkles: ["mdi:plus-circle-outline", "mdi:circle-small", "mdi:plus-circle-outline", "mdi:circle-small"],
    },
  },
  {
    test: (n) => /(educ|cursos|escuel|academ|universi)/.test(n),
    art: {
      mood: "edu",
      moon: "mdi:school-outline",
      orbit1: ["mdi:book-open-page-variant-outline", "mdi:graduation-cap", "mdi:pencil-ruler"],
      orbit2: ["mdi:abjad-arabic", "mdi:notebook-outline", "mdi:language-python"],
      accent: "mdi:bookshelf",
      sparkles: ["mdi:star-four-points", "mdi:circle-small", "mdi:star-four-points", "mdi:circle-small"],
    },
  },
  {
    test: (n) => /(ti|tech|code|dev|program|software|api)/.test(n),
    art: {
      mood: "tech",
      moon: "mdi:code-braces-box",
      orbit1: ["mdi:github", "mdi:cpu-64-bit", "mdi:graph-outline"],
      orbit2: ["mdi:terminal", "mdi:api", "mdi:docker"],
      accent: "mdi:robot-outline",
      sparkles: ["mdi:circle-small", "mdi:plus-circle-outline", "mdi:circle-small", "mdi:circle-small"],
    },
  },
  {
    test: (n) => /(ai|ia|gpt|llm|chatbot|agent)/.test(n),
    art: {
      mood: "ai",
      moon: "mdi:brain",
      orbit1: ["mdi:robot-outline", "mdi:auto-fix", "mdi:chip"],
      orbit2: ["mdi:graph", "mdi:lightbulb-on-outline", "mdi:magnify-scan"],
      accent: "mdi:creation",
      sparkles: ["mdi:star-four-points", "mdi:circle-small", "mdi:star-four-points", "mdi:sparkles"],
    },
  },
  {
    test: (n) => /(data|bi|analytics|metric|dashboard)/.test(n),
    art: {
      mood: "data",
      moon: "mdi:chart-box-outline",
      orbit1: ["mdi:database-outline", "mdi:chart-line", "mdi:chart-pie-outline"],
      orbit2: ["mdi:filter-variant", "mdi:graph", "mdi:table"],
      accent: "mdi:server",
      sparkles: ["mdi:circle-small", "mdi:plus-circle-outline", "mdi:circle-small", "mdi:circle-small"],
    },
  },
  {
    test: (n) => /(market|marketin|venta|cliente|publici|camp)/.test(n),
    art: {
      mood: "mkt",
      moon: "mdi:bullhorn-outline",
      orbit1: ["mdi:target", "mdi:chart-bar", "mdi:trending-up"],
      orbit2: ["mdi:megaphone-outline", "mdi:account-multiple-outline", "mdi:heart-outline"],
      accent: "mdi:rocket-launch-outline",
      sparkles: ["mdi:star-four-points", "mdi:circle-small", "mdi:star-four-points", "mdi:circle-small"],
    },
  },
  {
    test: (n) => /(rrhh|recursos|humano|empleado|nomina)/.test(n),
    art: {
      mood: "hr",
      moon: "mdi:account-group-outline",
      orbit1: ["mdi:badge-account-outline", "mdi:briefcase-outline", "mdi:handshake-outline"],
      orbit2: ["mdi:calendar-clock", "mdi:cog-outline", "mdi:certificate-outline"],
      accent: "mdi:office-building-outline",
      sparkles: ["mdi:circle-small", "mdi:plus-circle-outline", "mdi:circle-small", "mdi:circle-small"],
    },
  },
];

const FALLBACK: Omit<SpaceArt, "label"> = {
  mood: "default",
  moon: "mdi:notebook-outline",
  orbit1: ["mdi:bookmark-outline", "mdi:lightbulb-on-outline", "mdi:compass-outline"],
  orbit2: ["mdi:shape-outline", "mdi:star-four-points-outline", "mdi:bookmark-music-outline"],
  accent: "mdi:cube-outline",
  sparkles: ["mdi:circle-small", "mdi:circle-small", "mdi:circle-small", "mdi:circle-small"],
};

/** Resuelve el arte para un space dado. */
export function spaceArtFor(name: string): SpaceArt {
  const n = norm(name);
  const hit = CATALOG.find((c) => c.test(n));
  const base = hit ? hit.art : FALLBACK;
  return { ...base, label: (name || "").trim() || "Space" };
}

/** Lista de moods disponibles (para iterar / debug). */
export const ALL_MOODS: SpaceMood[] = [
  "youtube",
  "conta",
  "legal",
  "health",
  "edu",
  "tech",
  "ai",
  "data",
  "mkt",
  "hr",
  "default",
];
