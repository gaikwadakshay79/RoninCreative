import { Link } from 'react-router-dom';
import { ContactLinks } from '@/components/common/ContactLinks';
import { primaryNav } from '@/config/navigation';
import { siteConfig, socialLabels, type SocialNetwork } from '@/config/site';

const year = new Date().getFullYear();

/** Statement footer: the brand line set large, then the site's real links. */
export function Footer() {
  const socials = (Object.keys(siteConfig.social) as SocialNetwork[]).filter((network) => siteConfig.social[network]);

  return (
    <footer className="site-footer">
      <div className="shell">
        <p className="statement">{siteConfig.tagline}</p>

        <div className="mt-2xl grid grid-cols-2 gap-x-col gap-y-xl lg:grid-cols-12">
          <nav aria-label="Footer" className="lg:col-span-3">
            <p className="label">Pages</p>
            <ul className="mt-sm flex flex-col gap-xs">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="link text-md">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="label">Contact</p>
            <div className="mt-sm">
              <ContactLinks variant="compact" />
            </div>
          </div>

          {socials.length > 0 ? (
            <div className="lg:col-span-2">
              <p className="label">Follow</p>
              <ul className="mt-sm flex flex-col gap-xs">
                {socials.map((network) => (
                  <li key={network}>
                    <a className="link text-md" href={siteConfig.social[network]} target="_blank" rel="noreferrer">
                      {socialLabels[network]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="col-span-2 max-w-[36ch] text-md text-ink-2 lg:col-span-3 lg:col-start-10">
            {siteConfig.name} is the studio of {siteConfig.founder}, {siteConfig.founderRole.toLowerCase()}.
          </p>
        </div>

        <div className="mt-2xl flex flex-col gap-xs border-t border-rule pt-lg text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}
          </p>
          <p data-credits>
            <Link to="/credits" className="link text-muted">
              Placeholder photo credits
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
