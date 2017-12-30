import { URL } from "url";

// URL PARSING

export function parseUrl(url: string): URL | null {
  try {
    const urlObj = new URL(url);
    return urlObj;
  } catch (e) {
    return null;
  }
}

export function getFullPath(url: URL): string {
  return url.pathname + url.search + url.hash;
}

export function isValidUrl(url: string): boolean {
  return !!parseUrl(url);
}
