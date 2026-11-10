/**
 * Runs after `vite build`.
 *
 * A single-page app ships one index.html, so without help every address would
 * carry the home page's title and description until JavaScript runs. This
 * script fixes that for static hosting, with no server and no headless browser:
 *
 *   1. For every page and every project it writes dist/<path>/index.html, a
 *      copy of the app shell whose <head> holds that page's own title,
 *      description, canonical URL, Open Graph and Twitter tags. Any static
 *      host then serves /about, /portfolio/<slug> and the rest directly.
 *   2. It writes dist/404.html (noindex) for hosts that use one as a fallback.
 *   3. It writes robots.txt, and sitemap.xml when the site's address is known.
 *
 * The site's address comes from VITE_SITE_URL. Until it is set, no canonical
 * URL and no sitemap are written: a guessed domain is worse than none.
 *
 * Titles and descriptions are read from src/data/seo.ts and
 * src/data/projects.ts through Node's built-in TypeScript support, which is
 * why this needs Node 22.18 or newer.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const fromSrc = (file) => import(pathToFileURL(path.join(root, 'src', file)).href);

const { pageSeo, siteName, formatTitle } = await fromSrc('data/seo.ts');
const { projects, categoryLabels } = await fromSrc('data/projects.ts');

const env = loadEnv('production', root, 'VITE_');
const siteUrl = (env.VITE_SITE_URL ?? '').replace(/\/$/, '');

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const absolute = (pathname) => `${siteUrl}${pathname === '/' ? '/' : pathname}`;

function headFor({ title, description, pathname, image, type = 'website', noindex = false }) {
  const fullTitle = escapeHtml(formatTitle(title));
  const text = escapeHtml(description);
  const tags = [
    `<title>${fullTitle}</title>`,
    `<meta name="description" content="${text}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : null,
    siteUrl && !noindex ? `<link rel="canonical" href="${escapeHtml(absolute(pathname))}" />` : null,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:title" content="${fullTitle}" />`,
    `<meta property="og:description" content="${text}" />`,
    siteUrl && !noindex ? `<meta property="og:url" content="${escapeHtml(absolute(pathname))}" />` : null,
    siteUrl && image ? `<meta property="og:image" content="${escapeHtml(`${siteUrl}/media/${image}-1200.jpg`)}" />` : null,
    `<meta name="twitter:card" content="${siteUrl && image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${fullTitle}" />`,
    `<meta name="twitter:description" content="${text}" />`,
    siteUrl && image ? `<meta name="twitter:image" content="${escapeHtml(`${siteUrl}/media/${image}-1200.jpg`)}" />` : null,
  ];
  return tags.filter(Boolean).join('\n    ');
}

const pages = [
  ...Object.values(pageSeo).map((page) => ({
    pathname: page.path,
    title: page.title,
    description: page.description,
    image: page.image,
  })),
  ...projects.map((project) => ({
    pathname: `/portfolio/${project.slug}`,
    title: `${project.title}, ${categoryLabels[project.category].toLowerCase()} project`,
    description: project.summary,
    image: project.cover,
    type: 'article',
  })),
];

const shell = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const marker = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
if (!marker.test(shell)) {
  throw new Error('dist/index.html has no <!--seo:start--> ... <!--seo:end--> block. Keep it in index.html.');
}
const render = (page) => shell.replace(marker, `<!--seo:start-->\n    ${headFor(page)}\n    <!--seo:end-->`);

for (const page of pages) {
  const file =
    page.pathname === '/' ? path.join(dist, 'index.html') : path.join(dist, ...page.pathname.split('/'), 'index.html');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, render(page));
}

await fs.writeFile(
  path.join(dist, '404.html'),
  render({
    pathname: '/404',
    title: 'Page not found',
    description: 'This address does not match anything on the Ronin Creative site.',
    noindex: true,
  }),
);

const robots = ['User-agent: *', 'Allow: /', siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml` : null].filter(Boolean);
await fs.writeFile(path.join(dist, 'robots.txt'), `${robots.join('\n')}\n`);

if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((page) => `  <url><loc>${escapeHtml(absolute(page.pathname))}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  await fs.writeFile(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  console.log(`postbuild: ${pages.length} pages, 404.html, robots.txt and sitemap.xml for ${siteUrl}`);
} else {
  console.log(`postbuild: ${pages.length} pages, 404.html and robots.txt written.`);
  console.log('postbuild: VITE_SITE_URL is not set, so no canonical URLs and no sitemap.xml were written.');
}
