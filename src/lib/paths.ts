/**
 * The folder the site is served from, without a trailing slash: "" at the root
 * of a domain, "/RoninCreative" on a GitHub Pages project site. Vite sets it
 * from VITE_BASE_PATH at build time.
 */
export const basePath: string = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Turns a path under /public ("/media/x.webp", "/models/site.glb") into the
 * address the browser must request. Full URLs and data URLs pass through.
 */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${basePath}${path}`;
}
