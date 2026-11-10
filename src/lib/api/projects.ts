import type { Project } from '@/types';
import { endpoints, hasRemoteApi } from './config';

/** Local adapter: the typed project file, loaded as its own chunk. */
async function readLocalProjects(): Promise<Project[]> {
  const { projects } = await import('@/data/projects');
  return projects;
}

export async function fetchProjects(): Promise<Project[]> {
  if (!hasRemoteApi) return readLocalProjects();
  const { api } = await import('./client');
  const { data } = await api.get<Project[]>(endpoints.projects);
  return data;
}

/** Resolves to null when no project has this slug. */
export async function fetchProject(slug: string): Promise<Project | null> {
  if (!hasRemoteApi) {
    const projects = await readLocalProjects();
    return projects.find((project) => project.slug === slug) ?? null;
  }
  const { api, ApiError } = await import('./client');
  try {
    const { data } = await api.get<Project>(endpoints.project(slug));
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
