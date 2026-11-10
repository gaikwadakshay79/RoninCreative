import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * The shell every page shares: skip link, header, the routed page, footer.
 * ScrollRestoration returns to the top on a new page, to the saved position on
 * back and forward, and to the target of a #hash link.
 */
export function RootLayout() {
  const location = useLocation();
  const navigation = useNavigation();

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} aria-busy={navigation.state === 'loading'} className="outline-none">
        <div key={location.pathname} className="route-fade">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
