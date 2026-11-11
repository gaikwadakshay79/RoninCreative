import { Link } from 'react-router-dom';
import { Frame } from '@/components/common/Picture';
import { ProjectCard } from '@/components/gallery/ProjectCard';
import { Reveal } from '@/components/motion/Reveal';
import { CtaClose } from '@/components/sections/CtaClose';
import { PageHero } from '@/components/sections/PageHero';
import { siteConfig } from '@/config/site';
import { pageSeo } from '@/data/seo';
import { selectFeatured, useProjects, useServices } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: siteConfig.name,
  description: siteConfig.description,
  slogan: siteConfig.tagline,
  founder: { '@type': 'Person', name: siteConfig.founder, jobTitle: siteConfig.founderRole },
  ...(siteConfig.url ? { url: siteConfig.url, logo: `${siteConfig.url}/brand/logo.png`, image: `${siteConfig.url}/brand/logo.png` } : {}),
  ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
};

const principles = [
  {
    title: 'Visual storytelling',
    line: 'Location, light and shot list follow from the story.',
  },
  {
    title: 'Precision aerial imaging',
    line: 'Route, height and frame overlap are planned on the ground.',
  },
  {
    title: 'One finished set',
    line: 'Ground, aerial and 360° work are edited as one project.',
  },
];

/** Bento spans for up to five featured projects: one lead, one tall, three across. */
const bento = [
  { span: 'lg:col-span-8', ratio: 'aspect-[4/3] lg:aspect-[16/9]', sizes: '(min-width: 64rem) 62vw, 100vw' },
  { span: 'lg:col-span-4', ratio: 'aspect-[4/3] lg:aspect-auto', sizes: '(min-width: 64rem) 30vw, 100vw' },
  { span: 'sm:col-span-1 lg:col-span-4', ratio: 'aspect-[4/3]', sizes: '(min-width: 64rem) 30vw, (min-width: 40rem) 50vw, 100vw' },
  { span: 'sm:col-span-1 lg:col-span-4', ratio: 'aspect-[4/3]', sizes: '(min-width: 64rem) 30vw, (min-width: 40rem) 50vw, 100vw' },
  { span: 'sm:col-span-2 lg:col-span-4', ratio: 'aspect-[4/3] sm:aspect-[21/9] lg:aspect-[4/3]', sizes: '(min-width: 64rem) 30vw, 100vw' },
] as const;

function FeaturedWork() {
  const { data: featured, isPending, isError, refetch } = useProjects(selectFeatured);

  return (
    <section className="section" aria-labelledby="work-title">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-md">
          <h2 id="work-title">Selected work</h2>
          <Link to="/portfolio" className="link text-md">
            See the full portfolio
          </Link>
        </Reveal>

        <div className="mt-2xl grid grid-cols-1 gap-x-col gap-y-xl sm:grid-cols-2 lg:grid-cols-12">
          {isPending
            ? bento.map((cell, index) => (
                <div key={index} className={`${cell.span} ${index === 0 ? 'sm:col-span-2' : ''}`} aria-hidden="true">
                  <div className={`skeleton ${cell.ratio} min-h-64`} />
                </div>
              ))
            : null}

          {isError ? (
            <div className="col-span-full flex flex-col items-start gap-md">
              <p className="lead">The projects could not be loaded.</p>
              <button type="button" className="btn btn--line" onClick={() => void refetch()}>
                Load the projects again
              </button>
            </div>
          ) : null}

          {featured?.slice(0, bento.length).map((project, index) => {
            const cell = bento[index] ?? bento[2];
            return (
              <Reveal key={project.slug} index={index} className={`${cell.span} ${index < 2 ? 'sm:col-span-2' : ''}`}>
                <ProjectCard project={project} ratio={cell.ratio} sizes={cell.sizes} fill={index === 1} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServicesPreview() {
  const { data: services } = useServices();
  if (!services || services.length === 0) return null;

  return (
    <section className="section" aria-labelledby="services-title">
      <div className="shell">
        <Reveal className="grid grid-cols-1 gap-x-col gap-y-md lg:grid-cols-12 lg:items-end">
          <h2 id="services-title" className="lg:col-span-6">
            Stills, film, flight and 360°
          </h2>
          <p className="lead lg:col-span-5 lg:col-start-8">
            Booked alone, or combined in one visit.
          </p>
        </Reveal>

        <ul className="rows mt-2xl">
          {services.map((service, index) => (
            <Reveal as="li" key={service.id} index={index}>
              <Link
                to={`/services#${service.id}`}
                className="row-link grid grid-cols-1 gap-x-col gap-y-xs py-lg no-underline lg:grid-cols-12 lg:items-baseline lg:py-xl"
              >
                <h3 className="row-title lg:col-span-6">{service.title}</h3>
                <p className="text-md text-ink-2 lg:col-span-5 lg:col-start-8">{service.summary}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Component() {
  useSeo({ ...pageSeo.home, jsonLd: structuredData });

  return (
    <>
      <PageHero
        size="full"
        media={siteConfig.hero.image}
        video={siteConfig.hero.video || undefined}
        title="Every perspective tells a story."
        lead="Photography, cinematography, aerial imaging and 360° aerial tours."
      >
        <Link to="/portfolio" className="btn">
          Explore our work
        </Link>
        <Link to="/contact" className="btn btn--line">
          Start a project
        </Link>
      </PageHero>

      <section className="section intro" aria-labelledby="intro-title">
        <Reveal className="shell grid grid-cols-1 gap-x-col gap-y-xl lg:grid-cols-12">
          <h2 id="intro-title" className="statement lg:col-span-7">
            One studio for the ground and the air.
          </h2>
          <div className="flex flex-col items-start gap-lg lg:col-span-4 lg:col-start-9 lg:pt-xs">
            <p className="lead">
              {siteConfig.name} is the studio of {siteConfig.founder}, a professional photographer, cinematographer and
              licensed drone pilot.
            </p>
            <p className="text-md">{siteConfig.supportingLine}</p>
            <Link to="/about" className="link text-md">
              Read about the studio
            </Link>
          </div>
        </Reveal>
      </section>

      <FeaturedWork />
      <ServicesPreview />

      <section className="band" aria-labelledby="philosophy-title">
        <div className="shell">
          <Reveal className="grid grid-cols-1 gap-x-col gap-y-md lg:grid-cols-12 lg:items-end">
            <h2 id="philosophy-title" className="lg:col-span-6">
              The story first, then the flight plan
            </h2>
            <p className="lead lg:col-span-5 lg:col-start-8">Every commission starts with what the pictures have to say.</p>
          </Reveal>

          <div className="mt-2xl grid grid-cols-1 gap-col lg:grid-cols-3">
            {principles.map((principle, index) => (
              <Reveal key={principle.title} index={index} className="ticks flex flex-col gap-md p-lg lg:p-xl">
                <h3>{principle.title}</h3>
                <p className="text-md">{principle.line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="founder-title">
        <div className="shell grid grid-cols-1 items-center gap-x-col gap-y-xl lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Frame
              media="drone-kit"
              slot="founder-portrait"
              sizes="(min-width: 64rem) 38vw, 100vw"
              frameClassName="aspect-[4/5] max-h-[80svh] w-full"
            />
          </Reveal>
          <Reveal index={1} className="flex flex-col items-start gap-lg lg:col-span-6 lg:col-start-7">
            <h2 id="founder-title">{siteConfig.founder}</h2>
            <p className="lead">{siteConfig.founderRole}.</p>
            <p className="prose text-md">
              Rohan founded {siteConfig.name} to bring photography, cinematography and licensed drone work into one
              practice, so a project can move from the ground to the air without changing hands.
            </p>
            <Link to="/about" className="btn btn--line">
              Read about Rohan
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaClose />
    </>
  );
}
