/** Every React Query key of the site, so that no key is ever typed twice. */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: () => [...queryKeys.projects.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.projects.all, 'detail', slug] as const,
  },
  services: {
    all: ['services'] as const,
    list: () => [...queryKeys.services.all, 'list'] as const,
  },
  models: {
    all: ['models'] as const,
    list: () => [...queryKeys.models.all, 'list'] as const,
  },
} as const;
