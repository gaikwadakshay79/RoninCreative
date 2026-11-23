import * as m from 'motion/react-m';
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Picture } from '@/components/common/Picture';
import { Lightbox, type LightboxItem } from '@/components/gallery/Lightbox';
import { PlaceholderNotice } from '@/components/gallery/PlaceholderNotice';
import { CtaClose } from '@/components/sections/CtaClose';
import { PageHero } from '@/components/sections/PageHero';
import { categoryLabels, isListed, portfolioGroups } from '@/data/projects';
import { pageSeo } from '@/data/seo';
import { useProjects } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';
import { projectPictures } from '@/lib/media';
import { pictureToken } from '@/lib/shareLink';
import type { PortfolioGroup } from '@/types';

/** Filter addresses from before the sections were reorganised. */
const oldCategories: Record<string, string> = { architecture: 'infrastructure' };

/**
 * What ?category= asks for, among the sections that have work. A section with
 * no work yet falls back to its main category, and that to All Work.
 */
function resolveFilter(requested: string | null, groups: PortfolioGroup[]) {
  const wanted = requested ? (oldCategories[requested] ?? requested) : null;
  const owner = portfolioGroups.find(
    (item) => item.id === wanted || item.sections.some((section) => section.id === wanted),
  );
  const group = groups.find((item) => item.id === owner?.id) ?? null;
  const section = group?.sections.find((item) => item.id === wanted) ?? null;
  return { group, section };
}

const SKELETON_COUNT = 6;

export function Component() {
  useSeo(pageSeo.portfolio);

  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('category');

  const { data: projects, isPending, isError, refetch } = useProjects();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  // Only sections with published work are offered.
  const groups = useMemo(
    () =>
      portfolioGroups
        .map((item) => ({
          ...item,
          sections: item.sections.filter((section) => projects?.some((project) => project.category === section.id)),
        }))
        .filter((item) => item.sections.length > 0),
    [projects],
  );

  const { group, section } = useMemo(() => resolveFilter(requested, groups), [requested, groups]);
  const activeFilter = section?.id ?? group?.id ?? 'all';

  const visible = useMemo(
    () =>
      (projects ?? []).filter((project) => {
        if (section) return project.category === section.id;
        if (group) return group.sections.some((item) => item.id === project.category);
        return isListed(project);
      }),
    [projects, group, section],
  );

  // After a filter change: show the chosen button on a narrow screen, and start the results under the bar.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.querySelectorAll<HTMLElement>('[aria-pressed="true"]').forEach((item) => {
      const row = item.parentElement;
      if (row) row.scrollLeft = item.offsetLeft - row.offsetLeft - (row.clientWidth - item.offsetWidth) / 2;
    });
    const results = resultsRef.current;
    if (!results) return;
    // Where the bar's bottom sits once stuck. Its live position can lag behind a scroll.
    const stuckBottom = parseFloat(getComputedStyle(bar).top) + bar.offsetHeight;
    const hidden = stuckBottom - results.getBoundingClientRect().top;
    if (hidden > 1) window.scrollBy({ top: -hidden, behavior: 'instant' });
  }, [activeFilter]);

  // Every picture of every shown project, in order, so the viewer can step through them all.
  const { lightboxItems, coverIndex } = useMemo(() => {
    const items: LightboxItem[] = [];
    const covers = new Map<string, number>();
    for (const project of visible) {
      const pictures = projectPictures(project);
      covers.set(project.slug, items.length);
      pictures.forEach((media, position) => {
        items.push({
          media,
          title: project.title,
          detail: pictures.length > 1 ? `Picture ${position + 1} of ${pictures.length}` : undefined,
          href: `/portfolio/${project.slug}`,
          hrefLabel: 'See the Project',
          sharePath: `/portfolio/${project.slug}?s=${pictureToken(media)}`,
          group: project.slug,
        });
      });
    }
    return { lightboxItems: items, coverIndex: covers };
  }, [visible]);

  const setFilter = useCallback(
    (next: string) => {
      setOpenIndex(null);
      setSearchParams(next === 'all' ? {} : { category: next }, { replace: true, preventScrollReset: true });
    },
    [setSearchParams],
  );

  const hasPlaceholders = (projects ?? []).some((project) => project.placeholder);
  const mainFilters = [{ id: 'all', label: 'All Work' }, ...groups];

  return (
    <>
      <PageHero
        title="Portfolio"
        lead="Aerial work, 360° tours and photography. Open a picture to see it full screen."
      />

      <div ref={barRef} className="jump-bar" data-enter>
        <div className="shell enter" style={{ '--i': 2 } as CSSProperties}>
          <div className="tabs" role="group" aria-label="Filter the work by category">
            {mainFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                className="tabs__item"
                aria-pressed={(group?.id ?? 'all') === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {group ? (
            <div className="seg" role="group" aria-label={`Filter ${group.label} by type`}>
              <button
                type="button"
                className="seg__item"
                aria-pressed={section === null}
                onClick={() => setFilter(group.id)}
              >
                All {group.label}
              </button>
              {group.sections.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="seg__item"
                  aria-pressed={section?.id === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <section ref={resultsRef} className="pt-lg pb-3xl" aria-labelledby="projects-title">
        <div className="shell">
          <h2 id="projects-title" className="visually-hidden">
            Projects
          </h2>
          {hasPlaceholders ? <PlaceholderNotice scope="page" className="max-w-[80ch]" /> : null}
          {group?.id === 'ai-studio' ? (
            <p className="mt-md text-sm text-muted">Created with AI from our photography.</p>
          ) : null}

          <p className="visually-hidden" role="status" aria-live="polite">
            {isPending ? 'Loading the projects' : `${visible.length} ${visible.length === 1 ? 'project' : 'projects'} shown`}
          </p>

          {isPending ? (
            <div className="work-grid mt-xl" aria-hidden="true">
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div key={index} className="skeleton aspect-square" />
              ))}
            </div>
          ) : null}

          {isError ? (
            <div className="mt-xl flex flex-col items-start gap-md">
              <p className="lead">The projects could not be loaded.</p>
              <button type="button" className="btn btn--line" onClick={() => void refetch()}>
                Load the Projects Again
              </button>
            </div>
          ) : null}

          {projects && visible.length === 0 ? (
            <div className="mt-xl flex flex-col items-start gap-md">
              <p className="lead">No projects are published yet.</p>
            </div>
          ) : null}

          {visible.length > 0 ? (
            <m.div
              key={activeFilter}
              className="work-grid mt-xl"
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
                    onClick={() => setOpenIndex(coverIndex.get(project.slug) ?? 0)}
                  >
                    <figure className="frame aspect-square" data-slot={`project-${project.slug}`}>
                      <Picture
                        media={project.cover}
                        sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 48vw, 100vw"
                        priority={index < 3}
                      />
                    </figure>
                  </button>
                  <div className="tile__meta tile__meta--stack">
                    <h3 className="max-w-none text-lg">
                      <Link to={`/portfolio/${project.slug}`} className="link">
                        {project.title}
                      </Link>
                    </h3>
                    <span className="label shrink-0">
                      {categoryLabels[project.category]}
                      {project.placeholder ? ' · Placeholder' : null}
                    </span>
                  </div>
                </article>
              ))}
            </m.div>
          ) : null}
        </div>
      </section>

      <Lightbox items={lightboxItems} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />

      <CtaClose
        title="Want Your Project on This Page?"
        line="Say what you are planning and where. Rohan replies with how he would shoot it."
      />
    </>
  );
}
