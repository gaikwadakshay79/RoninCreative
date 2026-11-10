import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Picture } from '@/components/common/Picture';
import { Lightbox, type LightboxItem } from '@/components/gallery/Lightbox';
import { PlaceholderNotice } from '@/components/gallery/PlaceholderNotice';
import { ProjectCard } from '@/components/gallery/ProjectCard';
import { Reveal } from '@/components/motion/Reveal';
import { PageHero } from '@/components/sections/PageHero';
import { ModelViewer } from '@/components/three-d/ModelViewer';
import { categoryLabels } from '@/data/projects';
import { useProject, useProjects, useServices } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';
import { getMedia, mediaUrl } from '@/lib/media';
import type { Project } from '@/types';
import { NotFoundContent } from './NotFound';

const RELATED_COUNT = 3;

function ProjectSeo({ project }: { project: Project }) {
  useSeo({
    title: `${project.title}, ${categoryLabels[project.category].toLowerCase()} project`,
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
      <div className="skeleton h-[min(78svh,760px)] rounded-none" />
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const data = project.data;

  const pictures = useMemo<LightboxItem[]>(
    () => (data?.gallery ?? []).filter((key) => getMedia(key)).map((key) => ({ media: key, title: data?.title })),
    [data],
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
          <h1 className="display-s">This project did not load.</h1>
          <button type="button" className="btn btn--line" onClick={() => void project.refetch()}>
            Load the project again
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

  const videoPoster = data.video && getMedia(data.video.poster) ? mediaUrl(data.video.poster, 'fallback') : undefined;

  return (
    <article>
      <ProjectSeo project={data} />

      <PageHero media={data.cover} title={data.title} lead={data.summary} />

      <section className="section" aria-label="About the project">
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

      {pictures.length > 0 ? (
        <section className="section section--s" aria-labelledby="gallery-title">
          <div className="shell">
            <h2 id="gallery-title" className="visually-hidden">
              Gallery
            </h2>
            <div className="grid grid-cols-1 gap-col sm:grid-cols-2">
              {pictures.map((picture, index) => {
                const lead = index === 0 && pictures.length % 2 === 1;
                return (
                  <Reveal key={picture.media} index={index} className={lead ? 'sm:col-span-2' : ''}>
                    <button
                      type="button"
                      className="tile zoom"
                      aria-label={`Open picture ${index + 1} of ${pictures.length} full screen`}
                      onClick={() => setOpenIndex(index)}
                    >
                      <figure className={`frame ${lead ? 'aspect-[4/3] sm:aspect-[21/9]' : 'aspect-[4/3]'}`}>
                        <Picture
                          media={picture.media}
                          sizes={lead ? '100vw' : '(min-width: 40rem) 48vw, 100vw'}
                        />
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
              <video src={data.video.src} poster={videoPoster} controls playsInline preload="none" />
            </div>
          </div>
        </section>
      ) : null}

      {data.model ? (
        <section className="section section--s" aria-labelledby="model-title">
          <div className="shell">
            <h2 id="model-title">{data.model.title}</h2>
            {data.model.description ? <p className="lead mt-md">{data.model.description}</p> : null}
            <div className="mt-xl">
              <ModelViewer model={data.model} />
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="section" aria-labelledby="related-title">
          <div className="shell">
            <h2 id="related-title">Related projects</h2>
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
                <span className="label">Next project</span>
                <span className="statement">{next.title}</span>
              </div>
              <figure className="frame aspect-[16/9] lg:col-span-5 lg:col-start-8">
                <Picture media={next.cover} sizes="(min-width: 64rem) 40vw, 100vw" alt="" />
              </figure>
            </Link>
          </div>
        </nav>
      ) : null}

      <Lightbox items={pictures} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </article>
  );
}
