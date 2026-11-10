import { Link } from 'react-router-dom';
import { useSeo } from '@/hooks/useSeo';

interface NotFoundContentProps {
  /** What was looked for: "page" or "project". */
  thing?: 'page' | 'project';
}

/** Shared by the 404 route and by a project page whose slug matches nothing. */
export function NotFoundContent({ thing = 'page' }: NotFoundContentProps) {
  useSeo({
    title: thing === 'project' ? 'Project not found' : 'Page not found',
    description: 'This address does not match anything on the Ronin Creative site.',
    path: '/404',
    noindex: true,
  });

  return (
    <section className="section section--first min-h-[70svh]" data-enter>
      <div className="shell flex flex-col items-start gap-lg">
        <h1 className="enter">This {thing} is out of frame.</h1>
        <p className="lead enter">
          {thing === 'project'
            ? 'No project lives at this address. It may have been renamed or taken down.'
            : 'Nothing lives at this address. The link may be old, or mistyped.'}
        </p>
        <div className="enter flex flex-wrap gap-sm">
          <Link to="/portfolio" className="btn">
            See the portfolio
          </Link>
          <Link to="/" className="btn btn--line">
            Go to the home page
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Component() {
  return <NotFoundContent />;
}
