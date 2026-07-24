/**
 * space-art.ts — composición artística por nombre de espacio.
 * Devuelve la paleta y los iconos a superponer en el cover de la card.
 * Sin dependencias: solo iconify-icon strings.
 */

export interface SpaceArt {
  /** clase CSS del cover para variantes de gradiente */
  variant: string;
  /** icono principal (grande, centrado) */
  hero: string;
  /** iconos secundarios decorativos (3-5) */
  decor: string[];
  /** etiqueta legible usada en data-art */
  label: string;
}

/** normaliza: trim + lowercase + sin acentos */
function norm(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Catálogo por keyword. El orden importa: el primer match gana.
 * Cada entry trae paleta + iconos tematicos.
 */
const CATALOG: Array<{
  test: (n: string) => boolean;
  art: Omit<SpaceArt, "label">;
}> = [
  {
    test: (n) => /^(y|yt|youtube|video|videos)/.test(n),
    art: {
      variant: "art-youtube",
      hero: "mdi:play-circle-outline",
      decor: [
        "mdi:youtube",
        "mdi:filmstrip",
        "mdi:closed-caption-outline",
        "mdi:video-vintage",
        "mdi:subtitles-outline",
      ],
    },
  },
  {
    test: (n) => /(conta|contapyme|contabilidad|conta-|erp)/.test(n),
    art: {
      variant: "art-conta",
      hero: "mdi:calculator-variant-outline",
      decor: [
        "mdi:finance",
        "mdi:chart-line",
        "mdi:scale-balance",
        "mdi:cash-multiple",
        "mdi:receipt-text-edit-outline",
      ],
    },
  },
  {
    test: (n) => /(legal|jurid|abogad|ley|derecho)/.test(n),
    art: {
      variant: "art-legal",
      hero: "mdi:scale-balance",
      decor: [
        "mdi:gavel",
        "mdi:book-open-variant",
        "mdi:file-document-outline",
        "mdi:shield-check-outline",
        "mdi:ribbon",
      ],
    },
  },
  {
    test: (n) => /(salud|medic|hospital|clinic|medicin)/.test(n),
    art: {
      variant: "art-health",
      hero: "mdi:heart-pulse",
      decor: [
        "mdi:medical-bag",
        "mdi:pill",
        "mdi:stethoscope",
        "mdi:molecule",
        "mdi:bandage",
      ],
    },
  },
  {
    test: (n) => /(educ|cursos|escuel|academ|universi)/.test(n),
    art: {
      variant: "art-edu",
      hero: "mdi:school-outline",
      decor: [
        "mdi:book-open-page-variant-outline",
        "mdi:graduation-cap",
        "mdi:pencil-ruler",
        "mdi:abjad-arabic",
        "mdi:notebook-outline",
      ],
    },
  },
  {
    test: (n) => /(ti|tech|code|dev|program|software|api)/.test(n),
    art: {
      variant: "art-tech",
      hero: "mdi:code-braces",
      decor: [
        "mdi:cpu-64-bit",
        "mdi:github",
        "mdi:api",
        "mdi:graph-outline",
        "mdi:terminal",
      ],
    },
  },
  {
    test: (n) => /(market|marketin|venta|cliente|publici|camp)/.test(n),
    art: {
      variant: "art-mkt",
      hero: "mdi:bullhorn-outline",
      decor: [
        "mdi:megaphone-outline",
        "mdi:target",
        "mdi:chart-bar",
        "mdi:account-multiple-outline",
        "mdi:trending-up",
      ],
    },
  },
  {
    test: (n) => /(rrhh|recursos|humano|empleado|nomina)/.test(n),
    art: {
      variant: "art-hr",
      hero: "mdi:account-group-outline",
      decor: [
        "mdi:badge-account-outline",
        "mdi:briefcase-outline",
        "mdi:calendar-clock",
        "mdi:cog-outline",
        "mdi:handshake-outline",
      ],
    },
  },
];

/** fallback para cualquier space que no matchee ningun patron */
const FALLBACK: Omit<SpaceArt, "label"> = {
  variant: "art-default",
  hero: "mdi:notebook-outline",
  decor: [
    "mdi:bookmark-outline",
    "mdi:lightbulb-on-outline",
    "mdi:compass-outline",
    "mdi:star-four-points-outline",
    "mdi:shape-outline",
  ],
};

/** resuelve el arte para un space dado */
export function spaceArtFor(name: string): SpaceArt {
  const n = norm(name);
  const hit = CATALOG.find((c) => c.test(n));
  const base = hit ? hit.art : FALLBACK;
  return { ...base, label: (name || "").trim() || "Space" };
}
