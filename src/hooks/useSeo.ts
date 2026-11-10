import { useEffect } from 'react';
import { siteConfig } from '@/config/site';
import { formatTitle, siteName } from '@/data/seo';
import { mediaSharePath } from '@/lib/media';

export interface SeoInput {
  title: string;
  description: string;
  /** Path of the page, starting with a slash. */
  path: string;
  /** Media key of the picture for link previews. */
  image?: string;
  type?: 'website' | 'article';
  /** Keeps the page out of search results (the 404 page). */
  noindex?: boolean;
  /** Structured data. Only state what is verified. */
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string | null) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (content === null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string | null) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (href === null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Sets the page's title, description, canonical URL, Open Graph and Twitter
 * tags. scripts/postbuild.mjs writes the same values into the static HTML of
 * every route at build time; this hook keeps them right while navigating.
 *
 * Canonical and absolute image URLs appear only when VITE_SITE_URL is set,
 * so the site never publishes a guessed domain.
 */
export function useSeo({ title, description, path, image, type = 'website', noindex = false, jsonLd }: SeoInput) {
  const serialisedJsonLd = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = formatTitle(title);
    const base = siteConfig.url;
    const url = base ? `${base}${path === '/' ? '/' : path}` : null;
    // VITE_SITE_URL already includes any sub-path, so the picture's path is taken from the site's root.
    const imagePath = image ? mediaSharePath(image) : null;
    const imageUrl = base && imagePath ? `${base}${imagePath}` : null;

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex' : null);
    upsertLink('canonical', noindex ? null : url);
    upsertMeta('property', 'og:site_name', siteName);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:locale', siteConfig.locale);
    upsertMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);

    const existing = document.getElementById('structured-data');
    if (serialisedJsonLd) {
      const script = existing ?? document.createElement('script');
      script.id = 'structured-data';
      script.setAttribute('type', 'application/ld+json');
      script.textContent = serialisedJsonLd;
      if (!existing) document.head.appendChild(script);
    } else {
      existing?.remove();
    }
  }, [title, description, path, image, type, noindex, serialisedJsonLd]);
}
