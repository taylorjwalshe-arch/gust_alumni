"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }
  return (
    <button
      onClick={onCopy}
      className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
