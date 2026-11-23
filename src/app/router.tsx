import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { RouteError } from '@/components/layout/RouteError';
import { basePath } from '@/lib/paths';
import { keepContent, loadHome, loadPortfolio, loadProject, loadServices } from './loaders';

/**
 * Every page is its own chunk: a visitor downloads the page they open and
 * nothing else. Each page module exports its component as `Component`.
 */
export const router = createBrowserRouter(
  [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="min-h-svh" aria-busy="true" />,
    children: [
      { index: true, loader: loadHome, shouldRevalidate: keepContent, lazy: () => import('@/pages/Home') },
      { path: 'about', lazy: () => import('@/pages/About') },
      { path: 'services', loader: loadServices, shouldRevalidate: keepContent, lazy: () => import('@/pages/Services') },
      { path: 'portfolio', loader: loadPortfolio, shouldRevalidate: keepContent, lazy: () => import('@/pages/Portfolio') },
      {
        path: 'portfolio/:slug',
        loader: loadProject,
        shouldRevalidate: keepContent,
        lazy: () => import('@/pages/ProjectDetail'),
      },
      { path: 'contact', lazy: () => import('@/pages/Contact') },
      { path: 'credits', lazy: () => import('@/pages/Credits') },
      { path: '*', lazy: () => import('@/pages/NotFound') },
    ],
  },
  ],
  // The site may live in a sub-folder (GitHub Pages project sites do); routes are relative to it.
  { basename: basePath || '/' },
);
