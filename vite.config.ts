import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Preloads the one font file every page paints with, so the display face never swaps late. */
function preloadDisplayFont(): Plugin {
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
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${font}`, crossorigin: '' },
            injectTo: 'head',
          },
        ],
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadDisplayFont()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
  },
});
