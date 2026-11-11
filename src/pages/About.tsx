import { Link } from 'react-router-dom';
import { Frame } from '@/components/common/Picture';
import { Reveal } from '@/components/motion/Reveal';
import { CtaClose } from '@/components/sections/CtaClose';
import { PageHero } from '@/components/sections/PageHero';
import { siteConfig } from '@/config/site';
import { pageSeo } from '@/data/seo';
import { testimonials } from '@/data/testimonials';
import { useSeo } from '@/hooks/useSeo';

const path = [
  {
    title: 'Photography and film',
    line: 'Portraits, products, buildings and events.',
  },
  {
    title: 'Licensed drone flight',
    line: 'Stills, film and panoramas from above.',
  },
  {
    title: '360° aerial tours',
    line: 'Panoramas from points in the air, to look around in.',
  },
];

const process = [
  { title: 'Brief', line: 'What the pictures are for and who will see them.' },
  { title: 'Plan', line: 'Locations, light, a shot list and, for flights, the route and permissions.' },
  { title: 'Capture', line: 'Ground and aerial work in one visit, where the site allows.' },
  { title: 'Deliver', line: 'Edited stills, a film or a 360° tour.' },
];

const safety = [
  'A site check before every flight',
  'Airspace rules and permissions confirmed',
  'Distance kept from people, traffic and property',
  'No flight in poor weather or wind',
];

const reasons = [
  {
    title: 'One brief, every viewpoint',
    line: 'Ground, film and aerial work, planned together.',
  },
  {
    title: 'A licensed pilot',
    line: 'Flights planned around the rules of each location.',
  },
  {
    title: 'From capture to 360°',
    line: 'The filming flight can also record a 360° panorama.',
  },
  {
    title: 'Clear about limits',
    line: 'You hear what is possible before the shoot.',
  },
];

export function Component() {
  useSeo(pageSeo.about);

  return (
    <>
      <PageHero
        media="aerial-hills"
        title="A photographer who also flies."
        lead={`${siteConfig.name} is ${siteConfig.founder}’s studio for photography, film and aerial imaging.`}
      />

      <section className="section intro" aria-labelledby="philosophy-title">
        <Reveal className="shell grid grid-cols-1 gap-x-col gap-y-xl lg:grid-cols-12">
          <h2 id="philosophy-title" className="statement lg:col-span-7">
            A change of viewpoint changes the story.
          </h2>
          <div className="prose text-md lg:col-span-4 lg:col-start-9 lg:pt-xs">
            <p className="lead">
              {siteConfig.name} shows places, people and projects from the viewpoint that explains them best.
            </p>
            <p>Sometimes that is eye level, through a portrait lens. Sometimes it is from the air. Often a project needs both.</p>
          </div>
        </Reveal>
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
          <Reveal index={1} className="flex flex-col gap-lg lg:col-span-6 lg:col-start-7">
            <h2 id="founder-title">{siteConfig.founder}, founder</h2>
            <div className="prose text-md">
              <p className="lead">
                Rohan is a professional photographer and cinematographer, and a licensed drone pilot.
              </p>
              <p>
                He founded {siteConfig.name} to keep those three skills in one practice, planned by the same person
                with the same eye.
              </p>
              <p>The licence means the aerial part of a project is flown by someone trained for it.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="path-title">
        <div className="shell">
          <Reveal>
            <h2 id="path-title">From the camera to the 360° view</h2>
          </Reveal>
          <ol className="steps mt-2xl grid grid-cols-1 gap-col lg:grid-cols-3">
            {path.map((stage, index) => (
              <Reveal as="li" key={stage.title} index={index} className="flex flex-col gap-sm border-t border-rule pt-lg">
                <h3>{stage.title}</h3>
                <p className="text-md">{stage.line}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-xl">
            <Link to="/portfolio/splendid-valley-retreat-panshet" className="link text-md">
              Look around a 360° aerial tour
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="process-title">
        <div className="shell grid grid-cols-1 gap-x-col gap-y-xl lg:grid-cols-12">
          <Reveal className="flex flex-col gap-md lg:col-span-4">
            <h2 id="process-title">Creative eye, technical plan</h2>
            <p className="lead">Four stages, whatever the size of the project.</p>
          </Reveal>
          <dl className="rows lg:col-span-7 lg:col-start-6">
            {process.map((item, index) => (
              <Reveal key={item.title} index={index} className="grid grid-cols-1 gap-x-col gap-y-2xs py-xl sm:grid-cols-4">
                <dt className="text-lg font-normal text-ink">{item.title}</dt>
                <dd className="m-0 text-md sm:col-span-3">{item.line}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="band" aria-labelledby="safety-title">
        <div className="shell grid grid-cols-1 gap-x-col gap-y-xl lg:grid-cols-12">
          <Reveal className="flex flex-col gap-md lg:col-span-5">
            <h2 id="safety-title">Safety comes before the shot</h2>
            <p className="lead">Every flight is planned around other aircraft and the people below.</p>
          </Reveal>
          <Reveal index={1} className="lg:col-span-6 lg:col-start-7">
            <ul className="ruled text-md">
              {safety.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="reasons-title">
        <div className="shell">
          <Reveal>
            <h2 id="reasons-title">Why work with {siteConfig.name}</h2>
          </Reveal>
          <div className="mt-2xl grid grid-cols-1 gap-x-col gap-y-xl sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason, index) => (
              <Reveal key={reason.title} index={index} className="flex flex-col gap-sm border-t border-rule pt-lg">
                <h3>{reason.title}</h3>
                <p className="text-md">{reason.line}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="section" aria-labelledby="clients-title">
          <div className="shell">
            <h2 id="clients-title">What clients say</h2>
            <div className="mt-2xl grid grid-cols-1 gap-col lg:grid-cols-2">
              {testimonials.map((testimonial) => (
                <figure key={`${testimonial.name}-${testimonial.quote.slice(0, 24)}`} className="ticks m-0 flex flex-col justify-between gap-lg p-lg lg:p-xl">
                  <blockquote className="m-0 text-lead text-ink">“{testimonial.quote}”</blockquote>
                  <figcaption className="text-sm text-ink-2">
                    {testimonial.name}
                    {testimonial.role ? <span className="text-muted">, {testimonial.role}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaClose />
    </>
  );
}
