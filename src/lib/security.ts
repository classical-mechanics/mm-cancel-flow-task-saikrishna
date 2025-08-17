// lib/security.ts
export const CSRF_COOKIE = "csrfToken";

export function getCsrfFromDocument(): string | null {
  if (typeof document === "undefined") return null;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
  if (meta) return meta;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Keep letters, numbers, spaces, +, -, /, parentheses; collapse spaces; force uppercase */
export function sanitizeVisaLabel(raw: string): string {
  const clean = stripTags(raw)
    .replace(/[^A-Za-z0-9+\-/() ]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toUpperCase();
  return clean.slice(0, 40); // hard limit
}