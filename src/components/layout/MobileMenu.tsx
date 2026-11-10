import { Drawer } from 'antd';
import { X } from 'lucide-react';
import * as m from 'motion/react-m';
import { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AntdProvider } from '@/app/AntdProvider';
import { contactCta, primaryNav } from '@/config/navigation';
import { siteConfig } from '@/config/site';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen menu for phones and tablets, on Ant Design's Drawer: it traps
 * focus while open, closes on Escape and hands focus back to the menu button.
 */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const location = useLocation();
  const openedAt = useRef(location.key);

  // Close when the route changes, but not on the render that opened the menu.
  useEffect(() => {
    if (open) openedAt.current = location.key;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && location.key !== openedAt.current) onClose();
  }, [location.key, open, onClose]);

  return (
    <AntdProvider>
      <Drawer
        open={open}
        onClose={onClose}
        placement="right"
        width="100%"
        closable={false}
        title={null}
        aria-label="Menu"
        styles={{ body: { padding: 0 }, wrapper: { boxShadow: 'none' } }}
      >
        <div className="flex min-h-full flex-col">
          <div className="shell flex h-header shrink-0 items-center justify-between">
            <Link to="/" className="wordmark" onClick={onClose}>
              {siteConfig.name}
            </Link>
            <button type="button" className="icon-btn" aria-label="Close the menu" onClick={onClose}>
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main" className="shell flex-1 py-xl">
            <ul className="rows">
              {primaryNav.map((item, index) => (
                <m.li
                  key={item.to}
                  initial={{ opacity: 0, y: 12 }}
                  animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: open ? 0.08 + index * 0.04 : 0 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className="flex min-h-16 items-center justify-between py-sm font-display text-display-s font-light tracking-[-0.035em] text-ink-2 no-underline aria-[current=page]:text-ink"
                  >
                    {item.label}
                  </NavLink>
                </m.li>
              ))}
            </ul>
          </nav>

          <div className="shell flex shrink-0 flex-col gap-md pb-xl">
            <Link to={contactCta.to} className="btn w-full" onClick={onClose}>
              {contactCta.label}
            </Link>
            <p className="label">{siteConfig.founderRole}</p>
          </div>
        </div>
      </Drawer>
    </AntdProvider>
  );
}
