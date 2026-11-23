import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Frame } from '@/components/common/Picture';
import { ProjectCard } from '@/components/gallery/ProjectCard';
import { Reveal } from '@/components/motion/Reveal';
import { CtaClose } from '@/components/sections/CtaClose';
import { PageHero } from '@/components/sections/PageHero';
import { PanoShowcase } from '@/components/three-d/PanoShowcase';
import { pageSeo } from '@/data/seo';
import { useProjects, useServices } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';
import { getMedia } from '@/lib/media';
import type { Project, Service } from '@/types';

const RELATED_COUNT = 3;

/** Projects that used the service first, then projects in its related categories. */
function relatedProjects(service: Service, projects: Project[]): Project[] {
  const direct = projects.filter((project) => project.services.includes(service.id));
  const byCategory = projects.filter(
    (project) => !direct.includes(project) && service.related.includes(project.category),
  );
  return [...direct, ...byCategory].slice(0, RELATED_COUNT);
}

function ServiceSection({ service, projects, index }: { service: Service; projects: Project[]; index: number }) {
  const related = useMemo(() => relatedProjects(service, projects), [service, projects]);
  // Every picture is the same size and ratio; the side alternates, so the page zigzags.
  const pictureRight = index % 2 === 1;
  const titleId = `${service.id}-title`;
  const picture = getMedia(service.image);

  return (
    <section id={service.id} className="section scroll-mt-header" aria-labelledby={titleId}>
      <div className="shell">
        <div className="grid grid-cols-1 items-center gap-x-col gap-y-xl lg:grid-cols-12">
          <Reveal className={pictureRight ? 'lg:order-2 lg:col-span-7 lg:col-start-6' : 'lg:col-span-7'}>
            <Frame
              media={service.image}
              slot={`service-${service.id}`}
              sizes="(min-width: 64rem) 55vw, 100vw"
              priority={index === 0}
              frameClassName="aspect-[3/2]"
            />
            {picture?.captionCredit && picture.credit ? (
              <p className="mt-xs text-sm text-muted">
                Image: {picture.credit.author}, {picture.credit.licence}.{' '}
                <a className="link text-muted" href={picture.credit.source} target="_blank" rel="noreferrer">
                  Source
                </a>
              </p>
            ) : null}
          </Reveal>
          <Reveal
            index={1}
            className={`flex flex-col items-start gap-lg ${pictureRight ? 'lg:order-1 lg:col-span-5 lg:col-start-1 lg:row-start-1' : 'lg:col-span-5'}`}
          >
            <h2 id={titleId}>{service.title}</h2>
            <p className="text-md">{service.description}</p>
            <Link to={`/contact?service=${service.id}`} className="btn btn--line">
              Ask About This Service
            </Link>
          </Reveal>
        </div>

        <div className="mt-2xl grid grid-cols-1 gap-x-col gap-y-xl lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <h3>What It Covers</h3>
            <ul className={`ruled mt-md grid grid-cols-1 gap-x-col text-md ${service.offerings.length % 2 === 0 ? 'sm:grid-cols-2' : ''}`}>
              {service.offerings.map((offering) => (
                <li key={offering}>{offering}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal index={1} className="lg:col-span-5">
            <h3>What You Receive</h3>
            <ul className="ruled mt-md text-md">
              {service.deliverables.map((deliverable) => (
                <li key={deliverable}>{deliverable}</li>
              ))}
            </ul>
          </Reveal>
        </div>

        {service.id === 'aerial-360' ? <PanoShowcase /> : null}

        {related.length > 0 ? (
          <div className="mt-2xl">
            <h3>Related Work</h3>
            <div className="mt-lg grid grid-cols-1 gap-x-col gap-y-xl sm:grid-cols-3">
              {related.map((project, relatedIndex) => (
                <Reveal key={project.slug} index={relatedIndex}>
                  <ProjectCard project={project} ratio="aspect-[3/2]" sizes="(min-width: 40rem) 30vw, 100vw" />
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Component() {
  useSeo(pageSeo.services);
  const services = useServices();
  const projects = useProjects();

  return (
    <>
      <PageHero
        title="Flight, 360° and Photography."
        lead="Each service can be booked alone, or combined with the others in one visit."
      >
        {services.data ? (
          <nav aria-label="Services on this page" className="min-w-0 max-w-full">
            <ul className="seg lg:flex-wrap">
              {services.data.map((service) => (
                <li key={service.id}>
                  <a href={`#${service.id}`} className="seg__item no-underline">
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHero>

      {services.isPending ? (
        <div className="shell pb-3xl" aria-hidden="true">
          <div className="skeleton aspect-[3/2] w-full lg:w-7/12" />
        </div>
      ) : null}

      {services.isError ? (
        <div className="shell flex flex-col items-start gap-md pb-3xl">
          <p className="lead">The services could not be loaded.</p>
          <button type="button" className="btn btn--line" onClick={() => void services.refetch()}>
            Load the Services Again
          </button>
        </div>
      ) : null}

      {services.data ? (
        <>
          {services.data.map((service, index) => (
            <ServiceSection key={service.id} service={service} projects={projects.data ?? []} index={index} />
          ))}
        </>
      ) : null}

      <CtaClose
        title="Not Sure Which Service Fits? Describe the Project."
        line="Say what you need pictures of and what they are for. Rohan suggests the mix of ground and aerial work."
      />
    </>
  );
}
