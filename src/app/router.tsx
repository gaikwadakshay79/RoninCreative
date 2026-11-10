import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { RouteError } from '@/components/layout/RouteError';

/**
 * Every page is its own chunk: a visitor downloads the page they open and
 * nothing else. Each page module exports its component as `Component`.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="min-h-svh" aria-busy="true" />,
    children: [
      { index: true, lazy: () => import('@/pages/Home') },
      { path: 'about', lazy: () => import('@/pages/About') },
      { path: 'services', lazy: () => import('@/pages/Services') },
      { path: 'portfolio', lazy: () => import('@/pages/Portfolio') },
      { path: 'portfolio/:slug', lazy: () => import('@/pages/ProjectDetail') },
      { path: 'aerial-3d', lazy: () => import('@/pages/Aerial3D') },
      { path: 'contact', lazy: () => import('@/pages/Contact') },
      { path: 'credits', lazy: () => import('@/pages/Credits') },
      { path: '*', lazy: () => import('@/pages/NotFound') },
    ],
  },
]);
