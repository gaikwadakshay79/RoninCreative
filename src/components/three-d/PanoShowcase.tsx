import { Link } from 'react-router-dom';
import { Reveal } from '@/components/motion/Reveal';
import { usePanoramas, useProjects } from '@/hooks/useContent';
import { PanoViewer } from './PanoViewer';

/**
 * The 360° viewer with its heading, loading and error states. Renders nothing
 * when no panorama is listed in src/data/panoramas.ts.
 */
export function PanoShowcase() {
  const { data: panoramas, isPending, isError, refetch } = usePanoramas();
  const { data: projects } = useProjects();

  /** A shared link opens the project page that holds the panorama. */
  const projectPath = (panoramaId: string) => {
    const project = projects?.find((item) => item.panorama === panoramaId);
    return project ? `/portfolio/${project.slug}` : undefined;
  };

  if (isPending) {
    return <div className="skeleton mt-2xl aspect-[4/5] w-full sm:aspect-[16/9]" aria-hidden="true" />;
  }

  if (isError) {
    return (
      <div className="mt-2xl flex flex-col items-start gap-md">
        <p className="lead">The panoramas could not be loaded.</p>
        <button type="button" className="btn btn--line" onClick={() => void refetch()}>
          Load the Panoramas Again
        </button>
      </div>
    );
  }

  if (!panoramas || panoramas.length === 0) return null;

  const demos = panoramas.filter((panorama) => panorama.placeholder);
  const hasPlaceholders = demos.length > 0;
  // With Rohan's own work in the list too, name the demos so the note does not cover it.
  const demoNote =
    demos.length === panoramas.length
      ? 'These are licensed demo panoramas'
      : `${new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(demos.map((demo) => demo.title))} ${
          demos.length === 1 ? 'is a licensed demo panorama' : 'are licensed demo panoramas'
        }`;

  return (
    <Reveal className="mt-2xl">
      <h3>Try a 360° View</h3>
      <div className="mt-lg">
        <PanoViewer panoramas={panoramas} projectPath={projectPath} />
      </div>
      {hasPlaceholders ? (
        <p className="label mt-md">
          {demoNote}, not Ronin Creative’s own work.{' '}
          <Link to="/credits" className="link text-muted">
            See the Credits
          </Link>
        </p>
      ) : null}
    </Reveal>
  );
}
