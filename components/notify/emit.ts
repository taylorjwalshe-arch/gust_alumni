"use client";

export function emitNotify(text: string) {
  try {
    const evt = new CustomEvent("gust:notify", { detail: { text } });
    window.dispatchEvent(evt);
  } catch {}
}
