# Ronin Creative

The website of Ronin Creative, the studio of Rohan Kamble: professional photography, cinematography, aerial imaging and 3D visualization. It is a static site (no backend, no database) built on Hallmark's Vantage theme.

Pages: Home, About, Services, Portfolio, Project detail, Aerial 3D, Contact, Credits and a 404 page.

## Technology

React 19, TypeScript (strict), Vite, React Router, TanStack React Query, Axios, Ant Design 5, Tailwind CSS 4, Lucide icons and Motion for React. The 3D viewer is `@google/model-viewer`, loaded only when a model is on screen. The 360° viewer is Marzipano, loaded only when a visitor opens a panorama. Node 22.18 or newer is required.

## Commands

```bash
npm install        # once
npm run dev        # development server
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
npm run media      # rebuild pictures after changing media/originals/
```

## Deployment

`npm run build` writes a fully static `dist/`. Upload it to any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages, S3, plain hosting).

The build writes a separate `index.html` for every page and every project, each with its own title, description and share tags, so addresses such as `/about` work on any host without rewrite rules. It also writes `404.html` and `robots.txt`. `public/_redirects` covers Netlify and Cloudflare Pages.

### GitHub Pages (automatic)

`.github/workflows/deploy.yml` runs on every push to `main`. It lints, builds, and publishes the contents of `dist/` to the `deploy` branch. That branch holds only the built site and always has exactly one commit: each run replaces it with a force push. Never commit to `deploy` by hand.

One-time setup on GitHub, after the first run has created the branch: **Settings > Pages > Build and deployment**, Source **Deploy from a branch**, Branch **deploy**, folder **/ (root)**.

The workflow works out the address by itself. A project repository is built for `https://<owner>.github.io/<repo>/`, with `VITE_BASE_PATH` and `VITE_SITE_URL` set to match, so pictures, links, canonical URLs and the sitemap are right under the sub-folder. It can also be started by hand from the Actions tab.

Optional repository variables (**Settings > Secrets and variables > Actions > Variables**):

| Variable | Purpose |
| --- | --- |
| `PAGES_CUSTOM_DOMAIN` | Your own domain, for example `ronincreative.in`. The site is then built for the root of that domain and a `CNAME` file is published with it. |
| `VITE_CONTACT_ENDPOINT` | Where the contact form posts. |
| `VITE_API_BASE_URL` | A content API, if one is ever used. |

## Environment variables

Copy `.env.example` to `.env.local`. Every value is optional.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public address of the site, no trailing slash, including any sub-folder. Turns on canonical URLs, share images and `sitemap.xml`. Until it is set, none of those are written. |
| `VITE_BASE_PATH` | Folder the site is served from. Empty means the root of a domain. A GitHub Pages project site needs its repository name, for example `/RoninCreative/`. The deploy workflow sets it by itself. |
| `VITE_API_BASE_URL` | Base URL of a future content API. Empty means content comes from `src/data`. |
| `VITE_CONTACT_ENDPOINT` | URL that accepts the contact form as a JSON POST. Empty means the email fallback. |

## Updating business information

Everything is in `src/config/site.ts`: name, founder, tagline, location, email, phone, WhatsApp, social links and the home hero. Leave a value empty until it is confirmed. A missing detail shows as "To be added" and never as a broken link. Navigation is in `src/config/navigation.ts`.

To switch a service off before launch, set `enabled: false` in `src/data/services.ts`. It leaves the home page, the services page and the contact form in one step.

## Replacing portfolio images

Every picture on the site today is a licensed placeholder from Wikimedia Commons, credited on `/credits`. None is Rohan's work.

Each picture has a key, which is its file name in `media/originals/`.

1. Save the new photograph over `media/originals/<key>.jpg` (same name). Use a file at least 2400px wide for full-width pictures.
2. Run `npm run media`. It writes AVIF, WebP and JPEG sizes into `public/media/` and updates `src/data/media.manifest.json`.
3. In `src/data/media.ts`, rewrite `alt`, set `placeholder: false` and delete `credit`.

No component changes. To add a new picture, add a file with a new lowercase-hyphen name and a matching entry in `src/data/media.ts`.

The founder portrait uses the key `drone-kit` (a stand-in showing drone equipment, not a person). Replace it with a real portrait of Rohan.

## Adding projects

Add an entry to `src/data/projects.ts`:

```ts
{
  slug: 'riverside-villa',            // the address: /portfolio/riverside-villa
  title: 'Riverside villa',
  category: 'architecture',           // photography | cinematography | aerial | architecture | 3d-visualization | events
  summary: 'One line for cards and link previews.',
  overview: ['First paragraph.', 'Second paragraph.'],   // optional
  cover: 'riverside-villa-cover',     // media key
  gallery: ['riverside-villa-1', 'riverside-villa-2'],  // optional
  video: { src: '/videos/villa.mp4', poster: 'riverside-villa-cover', title: 'The film' }, // optional
  model: { id: 'villa', title: '3D model', src: '/models/villa.glb', alt: 'What the model shows' }, // optional
  location: 'Pune',                   // optional
  year: 2026,                         // optional
  services: ['photography', 'drone'],
  featured: true,                     // shows on the home page (first five)
  placeholder: false,
}
```

Fields you leave out are not rendered. Delete the placeholder entries as real projects replace them. The notice on the portfolio page disappears when no entry has `placeholder: true`.

Testimonials go in `src/data/testimonials.ts`. The list is empty and the section stays hidden until real ones are added.

## Adding 3D models

1. Export the model as `.glb` (preferred) or `.gltf` and copy it to `public/models/`.
2. Optionally add a poster picture through the media steps above.
3. Add an entry to `src/data/models.ts` (the file has an example).

The Aerial 3D page then shows the viewer with orbit, zoom, fullscreen, a loading state and the poster as fallback. While the list is empty the page shows a "first models are on their way" panel. A model can also be attached to a single project through its `model` field.

## Adding 360° panoramas

The Services page has a 360° viewer (Marzipano) in its "360° aerial experiences" section. It shows a flat poster and a "Look around in 360°" button; the viewer and the panorama load only when that button is pressed. The three panoramas there today are licensed demos from Wikimedia Commons, credited on `/credits`.

**A single panorama (stitched in PTGui or similar):**

1. Export it as an equirectangular JPEG, exactly twice as wide as it is tall (for example 8000 x 4000), with the horizon level.
2. Save it as `media/panoramas/<id>.jpg` and run `npm run media`. This writes the viewer files and a poster into `public/panoramas/`.
3. Add an entry to `src/data/panoramas.ts` with the same `id`, a title, an `alt` description and `placeholder: false`. `view` sets where it opens: `yaw` turns left and right, `pitch` tilts (negative looks down), `fov` zooms.

**A finished tour (several linked scenes and hotspots, exported from the Marzipano Tool or Pano2VR):**

1. Copy the exported folder, unchanged, to `public/tours/<name>/`.
2. Add a 16:9 poster picture as `public/panoramas/<id>-poster.jpg` (about 1280px wide).
3. Add an entry to `src/data/panoramas.ts` with `embed: '/tours/<name>/index.html'`. The tour then opens in a frame in place of the built-in viewer.

Delete the three demo entries (and their files in `media/panoramas/` and `public/panoramas/`) once real ones are in. An empty list hides the viewer.

## Contact form

The form validates with Ant Design and sends through one adapter, `src/lib/api/contact.ts`:

- `VITE_CONTACT_ENDPOINT` set: the enquiry is posted there as JSON (`name`, `email`, `phone`, `service`, `serviceLabel`, `location`, `message`, `source`). Form services such as Formspree, Basin or your own API fit. Change the request shape in `sendToEndpoint` only.
- Otherwise, with `siteConfig.contact.email` set: the visitor's email app opens with the enquiry written out.
- Neither set (the current state): the form checks entries and says plainly that it is not connected. It never claims a message was sent.

## Content API

Pages read content through React Query hooks (`src/hooks/useContent.ts`) and service modules (`src/lib/api/`). With `VITE_API_BASE_URL` empty they load the typed files in `src/data`. Set it and the same modules call `GET /projects`, `GET /projects/:slug`, `GET /services`, `GET /models` and `GET /panoramas` through the shared Axios client (`src/lib/api/client.ts`). Query keys are in `src/lib/query-keys.ts`.

## Design system

Colours, type and spacing are the Vantage tokens at the top of `src/styles/globals.css`. Tailwind reads the same tokens (`bg-paper`, `text-ink-2`, `gap-lg`). Ant Design is mapped to them in `src/config/theme.ts`, which holds hex copies because Ant Design cannot read OKLCH. Change a colour in the CSS first, then mirror it there.

Ant Design's styles sit in the `antd` cascade layer, below the site's own components and Tailwind utilities (`src/app/AntdProvider.tsx`). This depends on `@ant-design/cssinjs` staying on the same major version Ant Design itself uses (1.x for Ant Design 5). If it drifts, the layer is silently ignored and form styling breaks.

## Before launch

- Fill in `src/config/site.ts` (email, phone, WhatsApp, socials, location) and set `VITE_SITE_URL`.
- Replace every placeholder photograph and project with Rohan's own work, including the founder portrait.
- Confirm the list of services and the wording about the drone licence.
- Add at least one 3D model, or leave the "on their way" panel.
- Replace the three demo 360° panoramas with Rohan's own, or remove them.
- Optionally add a hero film: a short muted loop under 2 MB, path in `siteConfig.hero.video`.
