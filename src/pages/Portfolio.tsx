import * as m from 'motion/react-m';
import { useCallback, useMemo, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Picture } from '@/components/common/Picture';
import { Lightbox, type LightboxItem } from '@/components/gallery/Lightbox';
import { PlaceholderNotice } from '@/components/gallery/PlaceholderNotice';
import { CtaClose } from '@/components/sections/CtaClose';
import { PageHero } from '@/components/sections/PageHero';
import { categoryLabels, categoryOrder } from '@/data/projects';
import { pageSeo } from '@/data/seo';
import { useProjects } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';
import { getMedia } from '@/lib/media';
import type { Project, ProjectCategory } from '@/types';

type Filter = ProjectCategory | 'all';

const isCategory = (value: string | null): value is ProjectCategory =>
  value !== null && (categoryOrder as string[]).includes(value);

/** Each tile keeps its picture's own ratio, held between portrait 3:4 and wide 16:9. */
function tileRatio(project: Project): CSSProperties {
  const media = getMedia(project.cover);
  const ratio = media ? Math.min(Math.max(media.width / media.height, 3 / 4), 16 / 9) : 4 / 3;
  return { aspectRatio: String(ratio) };
}

const skeletonRatios = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-[3/2]', 'aspect-[1/1]', 'aspect-[4/3]', 'aspect-[16/9]'];

export function Component() {
  useSeo(pageSeo.portfolio);

  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('category');
  const filter: Filter = isCategory(requested) ? requested : 'all';

  const { data: projects, isPending, isError, refetch } = useProjects();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (projects ?? []).filter((project) => filter === 'all' || project.category === filter),
    [projects, filter],
  );

  const lightboxItems = useMemo<LightboxItem[]>(
    () =>
      visible.map((project) => ({
        media: project.cover,
        title: project.title,
        href: `/portfolio/${project.slug}`,
        hrefLabel: 'See the project',
      })),
    [visible],
  );

  const setFilter = useCallback(
    (next: Filter) => {
      setOpenIndex(null);
      setSearchParams(next === 'all' ? {} : { category: next }, { replace: true, preventScrollReset: true });
    },
    [setSearchParams],
  );

  const hasPlaceholders = (projects ?? []).some((project) => project.placeholder);
  const filters: Array<{ id: Filter; label: string }> = [
    { id: 'all', label: 'All work' },
    ...categoryOrder.map((category) => ({ id: category, label: categoryLabels[category] })),
  ];

  return (
    <>
      <PageHero
        title="Portfolio"
        lead="Photography, film, aerial work and 3D visualization. Open a picture to see it full screen."
      />

      <section className="pb-3xl" aria-label="Projects">
        <div className="shell">
          {hasPlaceholders ? <PlaceholderNotice scope="page" className="mb-xl max-w-[80ch]" /> : null}

          <div className="seg" role="group" aria-label="Filter the work by category">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                className="seg__item"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="visually-hidden" role="status" aria-live="polite">
            {isPending ? 'Loading the projects' : `${visible.length} ${visible.length === 1 ? 'project' : 'projects'} shown`}
          </p>

          {isPending ? (
            <div className="masonry mt-xl" aria-hidden="true">
              {skeletonRatios.map((ratio, index) => (
                <div key={index} className={`skeleton ${ratio}`} />
              ))}
            </div>
          ) : null}

          {isError ? (
            <div className="mt-xl flex flex-col items-start gap-md">
              <p className="lead">The projects could not be loaded.</p>
              <button type="button" className="btn btn--line" onClick={() => void refetch()}>
                Load the projects again
              </button>
            </div>
          ) : null}

          {projects && visible.length === 0 ? (
            <div className="mt-xl flex flex-col items-start gap-md">
              <p className="lead">No {filter === 'all' ? '' : categoryLabels[filter].toLowerCase()} projects are published yet.</p>
              {filter === 'all' ? null : (
                <button type="button" className="btn btn--line" onClick={() => setFilter('all')}>
                  Show all work
                </button>
              )}
            </div>
          ) : null}

          {visible.length > 0 ? (
            <m.div
              key={filter}
              className="masonry mt-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              {visible.map((project, index) => (
                <article key={project.slug}>
                  <button
                    type="button"
                    className="tile zoom"
                    aria-label={`Open ${project.title} full screen`}
                    onClick={() => setOpenIndex(index)}
                  >
                    <figure className="frame" style={tileRatio(project)} data-slot={`project-${project.slug}`}>
                      <Picture
                        media={project.cover}
                        sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 48vw, 100vw"
                        priority={index < 2}
                      />
                    </figure>
                  </button>
                  <div className="tile__meta">
                    <h2 className="max-w-none text-lg font-normal tracking-[-0.02em]">
                      <Link to={`/portfolio/${project.slug}`} className="link">
                        {project.title}
                      </Link>
                    </h2>
                    <span className="label shrink-0">{categoryLabels[project.category]}</span>
                  </div>
                </article>
              ))}
            </m.div>
          ) : null}
        </div>
      </section>

      <Lightbox items={lightboxItems} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />

      <CtaClose
        title="Want your project on this page?"
        line="Say what you are planning and where. Rohan replies with how he would shoot it."
      />
    </>
  );
}
