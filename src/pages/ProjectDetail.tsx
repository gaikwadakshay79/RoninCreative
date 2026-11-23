import { useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Picture } from '@/components/common/Picture';
import { Lightbox, type LightboxItem } from '@/components/gallery/Lightbox';
import { PlaceholderNotice } from '@/components/gallery/PlaceholderNotice';
import { ProjectCard } from '@/components/gallery/ProjectCard';
import { Reveal } from '@/components/motion/Reveal';
import { PageHero } from '@/components/sections/PageHero';
import { PanoViewer, type PanoLook } from '@/components/three-d/PanoViewer';
import { categoryLabels } from '@/data/projects';
import { usePanoramas, useProject, useProjects, useServices } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';
import { getMedia, mediaUrl, projectPictures } from '@/lib/media';
import { withBase } from '@/lib/paths';
import type { Project } from '@/types';
import { NotFoundContent } from './NotFound';

const RELATED_COUNT = 3;

/** The direction in a shared 360° link (?yaw=&pitch=&fov=), if all of it is there and valid. */
function readLook(params: URLSearchParams): PanoLook | undefined {
  const angle = (name: string) => {
    const value = params.get(name);
    return value === null || value.trim() === '' ? Number.NaN : Number(value);
  };
  const look = { yaw: angle('yaw'), pitch: angle('pitch'), fov: angle('fov') };
  return Number.isFinite(look.yaw) && Number.isFinite(look.pitch) && look.fov > 0 && look.fov < 180 ? look : undefined;
}

function ProjectSeo({ project }: { project: Project }) {
  useSeo({
    title: `${project.title}, ${categoryLabels[project.category]} Project`,
    description: project.summary,
    path: `/portfolio/${project.slug}`,
    image: project.cover,
    type: 'article',
  });
  return null;
}

function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading the project">
      <div className="skeleton h-svh rounded-none" />
      <div className="shell section">
        <div className="skeleton h-12 w-2/3" />
        <div className="skeleton mt-md h-6 w-1/2" />
      </div>
    </div>
  );
}

export function Component() {
  const { slug } = useParams();
  const project = useProject(slug);
  const all = useProjects();
  const services = useServices();
  const panoramas = usePanoramas();
  const [searchParams, setSearchParams] = useSearchParams();

  const data = project.data;

  // Every picture the viewer can show, each with its own link (?image=<key>).
  const pictures = useMemo<LightboxItem[]>(
    () =>
      data
        ? projectPictures(data).map((media) => ({
            media,
            title: data.title,
            sharePath: `/portfolio/${data.slug}?image=${encodeURIComponent(media)}`,
          }))
        : [],
    [data],
  );

  // The address holds the open picture, so it can be shared, reloaded or linked to.
  const imageParam = searchParams.get('image');
  const linkedIndex = imageParam ? pictures.findIndex((picture) => picture.media === imageParam) : -1;
  const openIndex = linkedIndex >= 0 ? linkedIndex : null;

  const showPicture = useCallback(
    (index: number | null) => {
      const media = index === null ? undefined : pictures[index]?.media;
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (media) next.set('image', media);
          else next.delete('image');
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [pictures, setSearchParams],
  );

  const { related, next } = useMemo(() => {
    const list = all.data ?? [];
    if (!data || list.length < 2) return { related: [] as Project[], next: null as Project | null };
    const position = list.findIndex((item) => item.slug === data.slug);
    const nextProject = list[(position + 1) % list.length] ?? null;
    const others = list.filter((item) => item.slug !== data.slug && item.slug !== nextProject?.slug);
    const sameCategory = others.filter((item) => item.category === data.category);
    const rest = others.filter((item) => item.category !== data.category);
    return { related: [...sameCategory, ...rest].slice(0, RELATED_COUNT), next: nextProject };
  }, [all.data, data]);

  if (project.isPending) return <LoadingState />;

  if (project.isError) {
    return (
      <section className="section section--first">
        <div className="shell flex flex-col items-start gap-lg">
          <h1 className="display-s">This Project Did Not Load.</h1>
          <button type="button" className="btn btn--line" onClick={() => void project.refetch()}>
            Load the Project Again
          </button>
        </div>
      </section>
    );
  }

  if (!data) return <NotFoundContent thing="project" />;

  const serviceTitles = (services.data ?? [])
    .filter((service) => data.services.includes(service.id))
    .map((service) => service.title);

  const facts = [
    { label: 'Category', value: categoryLabels[data.category] },
    serviceTitles.length > 0 ? { label: 'Services', value: serviceTitles.join(', ') } : null,
    data.location ? { label: 'Location', value: data.location } : null,
    data.year ? { label: 'Year', value: String(data.year) } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  const panorama = data.panorama ? panoramas.data?.find((item) => item.id === data.panorama) : undefined;
  const galleryKeys = (data.gallery ?? []).filter((key) => getMedia(key));
  const viewParam = searchParams.get('view');

  const videoPoster = data.video && getMedia(data.video.poster) ? mediaUrl(data.video.poster, 'fallback') : undefined;

  return (
    <article>
      <ProjectSeo project={data} />

      <PageHero media={data.cover} title={data.title} lead={data.summary} />

      <section className="section after-hero" aria-label="About the project">
        <div className="shell">
          {data.placeholder ? <PlaceholderNotice scope="project" className="mb-2xl max-w-[80ch]" /> : null}

          <div className="grid grid-cols-1 gap-x-col gap-y-xl lg:grid-cols-12">
            <dl className="rows self-start lg:col-span-4">
              {facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-md py-md">
                  <dt className="text-sm font-normal text-muted">{fact.label}</dt>
                  <dd className="m-0 text-right text-md text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {data.overview && data.overview.length > 0 ? (
              <div className="lg:col-span-7 lg:col-start-6">
                <h2 className="display-s">Overview</h2>
                <div className="prose mt-lg text-md">
                  {data.overview.map((paragraph, index) => (
                    <p key={index} className={index === 0 ? 'lead' : undefined}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {panorama ? (
        <section className="section section--s" aria-labelledby="pano-title">
          <div className="shell">
            <h2 id="pano-title">Look Around in 360°</h2>
            <p className="lead mt-md">Drag to turn the view. The thumbnails switch between viewpoints.</p>
            <div className="mt-xl">
              <PanoViewer
                panoramas={[panorama]}
                showProjects={false}
                projectPath={() => `/portfolio/${data.slug}`}
                initialScene={viewParam}
                initialLook={readLook(searchParams)}
                scrollOnOpen={Boolean(viewParam) && openIndex === null}
              />
            </div>
          </div>
        </section>
      ) : null}

      {galleryKeys.length > 0 ? (
        <section className="section section--s" aria-labelledby="photos-title">
          <div className="shell">
            <h2 id="photos-title">Photos</h2>
            <div className="mt-xl grid grid-cols-1 gap-col sm:grid-cols-2">
              {galleryKeys.map((media, index) => {
                const lead = index === 0 && galleryKeys.length % 2 === 1;
                return (
                  <Reveal key={media} index={index} className={lead ? 'sm:col-span-2' : ''}>
                    <button
                      type="button"
                      className="tile zoom"
                      aria-label={`Open picture ${index + 1} of ${galleryKeys.length} full screen`}
                      onClick={() => showPicture(pictures.findIndex((picture) => picture.media === media))}
                    >
                      <figure className={`frame ${lead ? 'aspect-[4/3] sm:aspect-[21/9]' : 'aspect-[4/3]'}`}>
                        <Picture media={media} sizes={lead ? '100vw' : '(min-width: 40rem) 48vw, 100vw'} />
                      </figure>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {data.video ? (
        <section className="section section--s" aria-labelledby="film-title">
          <div className="shell">
            <h2 id="film-title">{data.video.title}</h2>
            <div className="frame mt-xl aspect-[16/9]">
              <video src={withBase(data.video.src)} poster={videoPoster} controls playsInline preload="none" />
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="section" aria-labelledby="related-title">
          <div className="shell">
            <h2 id="related-title">Related Projects</h2>
            <div className="mt-2xl grid grid-cols-1 gap-x-col gap-y-xl sm:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.slug} index={index}>
                  <ProjectCard project={item} ratio="aspect-[4/3]" sizes="(min-width: 40rem) 30vw, 100vw" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {next ? (
        <nav className="band mb-0!" aria-label="Next project">
          <div className="shell">
            <Link to={`/portfolio/${next.slug}`} className="zoom grid grid-cols-1 items-center gap-x-col gap-y-lg no-underline lg:grid-cols-12">
              <div className="flex flex-col gap-sm lg:col-span-6">
                <span className="label">Next Project</span>
                <span className="statement">{next.title}</span>
              </div>
              <figure className="frame aspect-[16/9] lg:col-span-5 lg:col-start-8">
                <Picture media={next.cover} sizes="(min-width: 64rem) 40vw, 100vw" alt="" />
              </figure>
            </Link>
          </div>
        </nav>
      ) : null}

      <Lightbox items={pictures} index={openIndex} onIndexChange={showPicture} onClose={() => showPicture(null)} />
    </article>
  );
}
