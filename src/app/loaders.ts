import type { LoaderFunctionArgs, ShouldRevalidateFunction } from 'react-router-dom';
import { fetchProject, fetchProjects } from '@/lib/api/projects';
import { fetchPanoramas, fetchServices } from '@/lib/api/services';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

/**
 * Long pages load their content before they render. The router restores a
 * scroll position or jumps to a #section as soon as a page appears, so the page
 * must already have its full height by then.
 */
const projects = () => queryClient.ensureQueryData({ queryKey: queryKeys.projects.list(), queryFn: fetchProjects });
const services = () => queryClient.ensureQueryData({ queryKey: queryKeys.services.list(), queryFn: fetchServices });
const panoramas = () => queryClient.ensureQueryData({ queryKey: queryKeys.panoramas.list(), queryFn: fetchPanoramas });
const project = (slug: string) =>
  queryClient.ensureQueryData({ queryKey: queryKeys.projects.detail(slug), queryFn: () => fetchProject(slug) });

/** Waits for the content. A failed load is left for the page to show with its own retry button. */
async function settle(loads: Array<Promise<unknown>>) {
  await Promise.allSettled(loads);
  return null;
}

export const loadHome = () => settle([projects(), services()]);
export const loadServices = () => settle([services(), projects(), panoramas()]);
export const loadPortfolio = () => settle([projects()]);
export const loadProject = ({ params }: LoaderFunctionArgs) =>
  settle([project(params.slug ?? ''), projects(), services(), panoramas()]);

/** Filters and share links only change the address. The content is already in the cache. */
export const keepContent: ShouldRevalidateFunction = () => false;
