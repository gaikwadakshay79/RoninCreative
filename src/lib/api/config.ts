/**
 * Where content comes from.
 *
 * With VITE_API_BASE_URL empty (the default) every service module reads the
 * typed files in src/data through a local adapter. Set the variable and the
 * same modules call the remote API through the shared Axios client instead.
 * Pages and hooks do not change either way.
 */
export const apiBaseUrl: string = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const hasRemoteApi: boolean = apiBaseUrl.length > 0;

export const endpoints = {
  projects: '/projects',
  project: (slug: string) => `/projects/${encodeURIComponent(slug)}`,
  services: '/services',
  models: '/models',
} as const;
