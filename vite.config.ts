import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** "/" at the root of a domain, "/RoninCreative/" on a GitHub Pages project site. */
function normaliseBase(value: string | undefined): string {
  const trimmed = (value ?? '').trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

/** Preloads the one font file every page paints with, so the display face never swaps late. */
function preloadDisplayFont(base: string): Plugin {
  return {
    name: 'ronin:preload-font',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      const font = Object.keys(ctx.bundle).find((file) => /geologica-latin-shrp-normal.*\.woff2$/.test(file));
      if (!font) return html;
      return {
        html,
        tags: [
          {
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `${base}${font}`, crossorigin: '' },
            injectTo: 'head',
          },
        ],
      };
    },
  };
}

export default defineConfig(({ mode }) => {
  // VITE_BASE_PATH comes from the shell (the deploy workflow sets it) or from an .env file.
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_');
  const base = normaliseBase(env.VITE_BASE_PATH);

  return {
    base,
    plugins: [react(), tailwindcss(), preloadDisplayFont(base)],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      sourcemap: false,
    },
  };
});
