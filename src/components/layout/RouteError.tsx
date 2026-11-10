import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

/** Shown when a page fails to load or throws while rendering. */
export function RouteError() {
  const error = useRouteError();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  const detail = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : null;

  return (
    <main id="main" className="shell flex min-h-svh flex-col justify-center gap-lg py-3xl">
      <h1 className="display-s">This page did not load.</h1>
      <p className="lead">
        {offline
          ? 'You appear to be offline. Reconnect, then reload the page.'
          : 'Something went wrong while opening it. Reloading usually fixes this.'}
      </p>
      {detail ? <p className="label">{detail}</p> : null}
      <div className="flex flex-wrap gap-sm">
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          Reload the page
        </button>
        <Link className="btn btn--line" to="/">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
