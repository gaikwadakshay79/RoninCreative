import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Frame } from '@/components/common/Picture';
import { Reveal } from '@/components/motion/Reveal';
import { CtaClose } from '@/components/sections/CtaClose';
import { ModelViewer } from '@/components/three-d/ModelViewer';
import { PointCloud } from '@/components/three-d/PointCloud';
import { pageSeo } from '@/data/seo';
import { useModels } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';

const workflow = [
  {
    title: 'Plan the flight',
    line: 'Site, surroundings and airspace rules set the route and the height.',
  },
  {
    title: 'Capture overlapping photographs',
    line: 'Each frame shares most of its view with the next.',
  },
  {
    title: 'Process and reconstruct',
    line: 'Software matches points across the photographs and rebuilds the surface.',
  },
  {
    title: 'Review and deliver',
    line: 'The cleaned, textured model opens in a browser.',
  },
];

const applications = [
  {
    title: 'Architecture',
    line: 'A building and its surroundings as a context model for design.',
  },
  {
    title: 'Real estate',
    line: 'A property and its plot, shown from any angle.',
  },
  {
    title: 'Construction',
    line: 'The state of a site, recorded on a known date.',
  },
  {
    title: 'Land and terrain',
    line: 'The shape, slopes and access of a plot before design starts.',
  },
];

const step = (index: number): CSSProperties => ({ '--i': index }) as CSSProperties;

function ModelShowcase() {
  const { data: models, isPending, isError, refetch } = useModels();
  const [selected, setSelected] = useState(0);

  if (isPending) return <div className="skeleton aspect-[4/3] w-full lg:aspect-[16/9]" aria-hidden="true" />;

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-md">
        <p className="lead">The models could not be loaded.</p>
        <button type="button" className="btn btn--line" onClick={() => void refetch()}>
          Load the models again
        </button>
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className="ticks grid grid-cols-1 items-center gap-x-col gap-y-lg p-lg lg:grid-cols-12 lg:p-xl">
        <Frame
          media="model-massing"
          slot="model-poster"
          sizes="(min-width: 64rem) 40vw, 100vw"
          frameClassName="aspect-[16/9] lg:col-span-6"
        />
        <div className="flex flex-col items-start gap-md lg:col-span-5 lg:col-start-8">
          <h3>The first models are on their way</h3>
          <p className="text-md">
            Interactive models appear here as projects are published. Until then, ask for a walkthrough of how a model
            of your own site would be captured and delivered.
          </p>
          <Link to="/contact?service=aerial-3d" className="btn btn--line">
            Request a 3D model
          </Link>
        </div>
      </div>
    );
  }

  const active = models[Math.min(selected, models.length - 1)];
  if (!active) return null;

  return (
    <div className="flex flex-col gap-lg">
      {models.length > 1 ? (
        <div className="seg" role="group" aria-label="Choose a model">
          {models.map((model, index) => (
            <button
              key={model.id}
              type="button"
              className="seg__item"
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              {model.title}
            </button>
          ))}
        </div>
      ) : null}
      <ModelViewer key={active.id} model={active} />
      {active.description ? <p className="text-md">{active.description}</p> : null}
    </div>
  );
}

export function Component() {
  useSeo(pageSeo.aerial3d);

  return (
    <>
      <section className="relative overflow-hidden pt-header" data-enter>
        <div className="shell grid min-h-[calc(100svh-var(--header-h))] grid-cols-1 items-center gap-x-col gap-y-xl py-xl lg:grid-cols-12">
          <div className="flex flex-col items-start gap-lg lg:col-span-5">
            <h1 className="enter" style={step(0)}>
              Sites and buildings, rebuilt in 3D.
            </h1>
            <p className="lead enter" style={step(1)}>
              Drone photographs become a 3D model you can orbit, zoom and present.
            </p>
            <div className="enter flex flex-wrap gap-sm" style={step(2)}>
              <Link to="/contact?service=aerial-3d" className="btn">
                Request a 3D model
              </Link>
              <a href="#workflow" className="btn btn--line">
                See the workflow
              </a>
            </div>
          </div>
          <PointCloud className="aspect-[4/3] w-full lg:col-span-7 lg:aspect-auto lg:h-[min(68svh,640px)]" />
        </div>
      </section>

      <section className="section" aria-labelledby="photogrammetry-title">
        <div className="shell grid grid-cols-1 items-center gap-x-col gap-y-xl lg:grid-cols-12">
          <Reveal className="flex flex-col gap-lg lg:col-span-5">
            <h2 id="photogrammetry-title">How photographs become a model</h2>
            <div className="prose text-md">
              <p className="lead">
                Photogrammetry measures a subject from photographs: seen from two positions a point shifts, and the
                shift gives its place in space.
              </p>
              <p>
                These models are made for visualization and presentation. They are not certified survey data.
              </p>
            </div>
          </Reveal>
          <Reveal index={1} className="lg:col-span-6 lg:col-start-7">
            <Frame
              media="model-city"
              slot="aerial-3d-explainer"
              sizes="(min-width: 64rem) 46vw, 100vw"
              frameClassName="aspect-[4/3]"
            />
          </Reveal>
        </div>
      </section>

      <section id="workflow" className="band scroll-mt-header" aria-labelledby="workflow-title">
        <div className="shell">
          <Reveal>
            <h2 id="workflow-title">From flight plan to finished model</h2>
          </Reveal>
          <ol className="steps mt-2xl grid grid-cols-1 gap-x-col gap-y-xl sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((stage, index) => (
              <Reveal as="li" key={stage.title} index={index} className="flex flex-col gap-sm border-t border-rule-2 pt-lg">
                <h3>{stage.title}</h3>
                <p className="text-md">{stage.line}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="applications-title">
        <div className="shell grid grid-cols-1 gap-x-col gap-y-xl lg:grid-cols-12">
          <Reveal className="flex flex-col gap-md lg:col-span-4">
            <h2 id="applications-title">Where a 3D model helps</h2>
          </Reveal>
          <dl className="rows lg:col-span-7 lg:col-start-6">
            {applications.map((item, index) => (
              <Reveal key={item.title} index={index} className="grid grid-cols-1 gap-x-col gap-y-2xs py-xl sm:grid-cols-4">
                <dt className="text-lg font-normal text-ink">{item.title}</dt>
                <dd className="m-0 text-md sm:col-span-3">{item.line}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="showcase-title">
        <div className="shell">
          <Reveal className="grid grid-cols-1 gap-x-col gap-y-md lg:grid-cols-12 lg:items-end">
            <h2 id="showcase-title" className="lg:col-span-6">
              Interactive models
            </h2>
            <p className="lead lg:col-span-5 lg:col-start-8">
              Orbit, zoom and view full screen, on a phone or a laptop, with nothing to install.
            </p>
          </Reveal>
          <div className="mt-2xl">
            <ModelShowcase />
          </div>
        </div>
      </section>

      <CtaClose
        title="Have a site in mind? Let’s model it."
        line="Say where the site is and what the model is for. Rohan replies with how he would capture it."
        service="aerial-3d"
        actionLabel="Request a 3D model"
      />
    </>
  );
}
