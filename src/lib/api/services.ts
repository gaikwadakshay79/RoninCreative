import type { ModelAsset, Service } from '@/types';
import { endpoints, hasRemoteApi } from './config';

/** Services that are switched on. A disabled service never reaches a page. */
export async function fetchServices(): Promise<Service[]> {
  if (!hasRemoteApi) {
    const { services } = await import('@/data/services');
    return services.filter((service) => service.enabled);
  }
  const { api } = await import('./client');
  const { data } = await api.get<Service[]>(endpoints.services);
  return data.filter((service) => service.enabled);
}

export async function fetchModels(): Promise<ModelAsset[]> {
  if (!hasRemoteApi) {
    const { models } = await import('@/data/models');
    return models;
  }
  const { api } = await import('./client');
  const { data } = await api.get<ModelAsset[]>(endpoints.models);
  return data;
}
