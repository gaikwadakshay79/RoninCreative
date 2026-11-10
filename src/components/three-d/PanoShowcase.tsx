import { Link } from 'react-router-dom';
import { Reveal } from '@/components/motion/Reveal';
import { usePanoramas } from '@/hooks/useContent';
import { PanoViewer } from './PanoViewer';

/**
 * The 360° viewer with its heading, loading and error states. Renders nothing
 * when no panorama is listed in src/data/panoramas.ts.
 */
export function PanoShowcase() {
  const { data: panoramas, isPending, isError, refetch } = usePanoramas();

  if (isPending) {
    return <div className="skeleton mt-2xl aspect-[4/3] w-full lg:aspect-[16/9]" aria-hidden="true" />;
  }

  if (isError) {
    return (
      <div className="mt-2xl flex flex-col items-start gap-md">
        <p className="lead">The panoramas could not be loaded.</p>
        <button type="button" className="btn btn--line" onClick={() => void refetch()}>
          Load the panoramas again
        </button>
      </div>
    );
  }

  if (!panoramas || panoramas.length === 0) return null;

  const hasPlaceholders = panoramas.some((panorama) => panorama.placeholder);

  return (
    <Reveal className="mt-2xl">
      <h3>Try a 360° view</h3>
      <div className="mt-lg">
        <PanoViewer panoramas={panoramas} />
      </div>
      {hasPlaceholders ? (
        <p className="label mt-md">
          These are licensed demo panoramas, not Ronin Creative’s own work.{' '}
          <Link to="/credits" className="link text-muted">
            See the credits
          </Link>
        </p>
      ) : null}
    </Reveal>
  );
}
