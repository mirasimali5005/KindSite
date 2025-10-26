// src/lib/accessibility.ts
export const RENDER_BASE = import.meta.env.DEV ? "" : ""; // keep empty: we stay on relative paths
export const API_URL = "/process"; // same as Chat
export const normalizePdfUrl = (u?: string | null) => u || ""; // we keep it as-is: '/downloads/...'

export type Upstream = { modified_content?: string; pdf_url?: string };

export async function processText(text: string, preset: string) {
  const fd = new FormData();
  fd.append("text_input", text);
  fd.append("accessibility_preset", preset);
  const r = await fetch(API_URL, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return (await r.json()) as Upstream;
}

export async function processFile(file: File, preset: string) {
  const fd = new FormData();
  fd.append("file_input", file, file.name);
  fd.append("accessibility_preset", preset);
  const r = await fetch(API_URL, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return (await r.json()) as Upstream;
}
