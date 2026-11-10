import { Menu } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { contactCta, primaryNav } from '@/config/navigation';
import { siteConfig } from '@/config/site';

const loadMobileMenu = () => import('./MobileMenu');
const MobileMenu = lazy(loadMobileMenu);

function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}

export function Wordmark() {
  const [first, ...rest] = siteConfig.name.split(' ');
  return (
    <Link to="/" className="wordmark" aria-label={`${siteConfig.name}, home`}>
      {first}
      <span>{rest.join(' ')}</span>
    </Link>
  );
}

/** Clear over a hero photograph, solid paper once the page has scrolled. */
export function Header() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRequested, setMenuRequested] = useState(false);

  const openMenu = useCallback(() => {
    setMenuRequested(true);
    setMenuOpen(true);
  }, []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // On small screens, fetch the menu once the page is idle, so the first tap opens it at once.
  useEffect(() => {
    if (!window.matchMedia('(max-width: 63.99rem)').matches) return;
    const timer = window.setTimeout(() => void loadMobileMenu(), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <header className="site-header" data-solid={scrolled}>
      <div className="shell flex h-full items-center justify-between gap-lg">
        <Wordmark />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-lg xl:gap-xl">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="nav-link">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-sm">
          <Link to={contactCta.to} className="btn btn--compact hidden sm:inline-flex">
            {contactCta.label}
          </Link>
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-label="Open the menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={openMenu}
            onPointerEnter={loadMobileMenu}
            onFocus={loadMobileMenu}
          >
            <Menu size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuRequested ? (
        <Suspense fallback={null}>
          <MobileMenu open={menuOpen} onClose={closeMenu} />
        </Suspense>
      ) : null}
    </header>
  );
}
