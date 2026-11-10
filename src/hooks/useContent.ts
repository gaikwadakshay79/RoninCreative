import { useMutation, useQuery } from '@tanstack/react-query';
import { submitInquiry, type InquiryContext } from '@/lib/api/contact';
import { fetchProject, fetchProjects } from '@/lib/api/projects';
import { fetchModels, fetchPanoramas, fetchServices } from '@/lib/api/services';
import { queryKeys } from '@/lib/query-keys';
import type { InquiryPayload, Project } from '@/types';

/**
 * All projects, or a slice of them. Pass a stable `select` (declared outside
 * the component, or memoised) to derive a filtered list without a second fetch.
 */
export function useProjects<TData = Project[]>(select?: (projects: Project[]) => TData) {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: fetchProjects,
    select,
  });
}

export const selectFeatured = (projects: Project[]): Project[] => projects.filter((project) => project.featured);

/** One project by slug. `data` is null when the slug matches nothing. */
export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(slug ?? ''),
    queryFn: () => fetchProject(slug ?? ''),
    enabled: Boolean(slug),
  });
}

export function useServices() {
  return useQuery({ queryKey: queryKeys.services.list(), queryFn: fetchServices });
}

export function useModels() {
  return useQuery({ queryKey: queryKeys.models.list(), queryFn: fetchModels });
}

export function usePanoramas() {
  return useQuery({ queryKey: queryKeys.panoramas.list(), queryFn: fetchPanoramas });
}

interface InquiryVariables {
  payload: InquiryPayload;
  context: InquiryContext;
}

export function useSubmitInquiry() {
  return useMutation({
    mutationFn: ({ payload, context }: InquiryVariables) => submitInquiry(payload, context),
  });
}
