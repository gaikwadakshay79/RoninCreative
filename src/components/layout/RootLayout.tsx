import { Outlet, ScrollRestoration, useLocation, useNavigation, type Location } from 'react-router-dom';
import { basePath } from '@/lib/paths';
import { Footer } from './Footer';
import { Header } from './Header';

const SCROLL_STORAGE_KEY = 'ronin-scroll-positions';

/**
 * Every full page load has the location key "default". Keyed by address
 * instead, a link opened in the same tab no longer inherits another page's
 * scroll position, and a reload still returns to its own.
 */
const scrollKey = (location: Location) =>
  location.key === 'default' ? `${location.pathname}${location.search}${location.hash}` : location.key;

/** A newly opened link starts fresh, even at an address this tab has seen. Reload and back keep their place. */
function forgetPositionOnNewVisit() {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (entry?.type !== 'navigate') return;
  try {
    const saved = JSON.parse(sessionStorage.getItem(SCROLL_STORAGE_KEY) ?? '{}') as Record<string, number>;
    const { pathname, search, hash } = window.location;
    delete saved[`${pathname.slice(basePath.length) || '/'}${search}${hash}`];
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Without session storage there is nothing saved to forget.
  }
}

forgetPositionOnNewVisit();

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
        Skip to Content
      </a>
      <Header />
      <main
        id="main"
        key={location.pathname}
        tabIndex={-1}
        aria-busy={navigation.state === 'loading'}
        className="route-fade outline-none"
      >
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration getKey={scrollKey} storageKey={SCROLL_STORAGE_KEY} />
    </>
  );
}
