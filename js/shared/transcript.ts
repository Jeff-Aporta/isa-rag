/**
 * Parser de transcripcion manual para videos YouTube.
 * Acepta:
 *   1) SRT (WebVTT/SUBRIP) — bloques "n\nHH:MM:SS,mmm --> HH:MM:SS,mmm\ntexto"
 *   2) JSON con { segments: [{ start, end, text }] } o array [{ start, duration, text }]
 * Devuelve { segments, lang } en el formato esperado por la API.
 */
export interface ParsedSegment {
  start: number;
  end: number;
  text: string;
}
export interface ParsedTranscript {
  segments: ParsedSegment[];
  lang: string;
}

function srtTimeToMs(s: string): number {
  // HH:MM:SS,mmm  |  HH:MM:SS.mmm
  const m = s.replace(",", ".").match(/(\d+):(\d+):(\d+)[.,](\d+)/);
  if (!m) return 0;
  const h = parseInt(m[1]!, 10);
  const min = parseInt(m[2]!, 10);
  const sec = parseInt(m[3]!, 10);
  const ms = parseInt(m[4]!.padEnd(3, "0").slice(0, 3), 10);
  return ((h * 3600 + min * 60 + sec) * 1000) + ms;
}

export function parseTranscriptInput(raw: string): ParsedTranscript {
  const trimmed = raw.trim();
  if (!trimmed) return { segments: [], lang: "es" };

  // JSON path
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const obj = JSON.parse(trimmed) as unknown;
      if (Array.isArray(obj)) {
        const segments: ParsedSegment[] = [];
        for (const s of obj) {
          if (!s || typeof s !== "object") continue;
          const o = s as Record<string, unknown>;
          const start = Number(o.start ?? o.offset ?? 0);
          const dur = Number(o.duration ?? 0);
          const end = Number(o.end ?? start + dur);
          const text = String(o.text ?? "").replace(/\s+/g, " ").trim();
          if (!text) continue;
          segments.push({
            start: Math.max(0, Math.round(start * 1000)),
            end: Math.max(start, Math.round(end * 1000)),
            text,
          });
        }
        return { segments: segments.sort((a, b) => a.start - b.start), lang: "es" };
      }
      const o = obj as { lang?: string; segments?: Array<{ start?: number; end?: number; text?: string }> };
      const segs = (o.segments || []).map((s) => ({
        start: s.start || 0,
        end: s.end || s.start || 0,
        text: String(s.text || "").replace(/\s+/g, " ").trim(),
      })).filter((s) => s.text);
      return { segments: segs, lang: o.lang || "es" };
    } catch {
      // cae a SRT
    }
  }

  // SRT path
  const blocks = trimmed.replace(/\r/g, "").split(/\n\s*\n/);
  const segments: ParsedSegment[] = [];
  for (const b of blocks) {
    const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    let i = 0;
    if (/^\d+$/.test(lines[0]!)) i = 1;
    const tc = lines[i];
    if (!tc) continue;
    const tcm = /(\d+:\d+:\d+[.,]\d+)\s*-->\s*(\d+:\d+:\d+[.,]\d+)/.exec(tc);
    if (!tcm) continue;
    const start = srtTimeToMs(tcm[1]!);
    const end = srtTimeToMs(tcm[2]!);
    const text = lines.slice(i + 1).join(" ").replace(/\s+/g, " ").trim();
    if (!text) continue;
    segments.push({ start, end, text });
  }
  return { segments, lang: "es" };
}
