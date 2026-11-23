import { Mail, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { InstagramIcon, WhatsAppIcon } from '@/components/brand/BrandIcons';
import { phoneHref, siteConfig, whatsappHref } from '@/config/site';

interface ContactAction {
  label: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}

const ICON_SIZE = 18;

/**
 * Contact details held at the bottom of every page, using the main phone
 * number. A detail missing from the site config leaves out its text and button.
 * The stylesheet hides the bar while a picture or a 360° view fills the screen.
 */
export function ContactBar() {
  const { email, phones } = siteConfig.contact;
  const phone = phones[0];
  const instagram = siteConfig.social.instagram;
  const icon = { size: ICON_SIZE, strokeWidth: 1.5, 'aria-hidden': true } as const;

  const actions: ContactAction[] = [
    ...(email ? [{ label: 'Email', href: `mailto:${email}`, icon: <Mail {...icon} /> }] : []),
    ...(instagram
      ? [{ label: 'Instagram', href: instagram, icon: <InstagramIcon size={ICON_SIZE} />, external: true }]
      : []),
    ...(phone
      ? [
          { label: 'WhatsApp', href: whatsappHref(phone), icon: <WhatsAppIcon size={ICON_SIZE} />, external: true },
          { label: 'Call', href: phoneHref(phone), icon: <Phone {...icon} /> },
        ]
      : []),
  ];

  return (
    <aside className="contact-bar" aria-label={`Contact ${siteConfig.name}`}>
      <div className="shell contact-bar__inner">
        <div className="contact-bar__details">
          {email ? (
            <a className="contact-bar__email" href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
          <p className="contact-bar__person">
            {siteConfig.founder}
            {phone ? (
              <>
                <span aria-hidden="true"> | </span>
                <a href={phoneHref(phone)} aria-label={`Call ${phone}`}>
                  {phone}
                </a>
              </>
            ) : null}
          </p>
        </div>

        <ul className="contact-bar__actions">
          {actions.map((action) => (
            <li key={action.label}>
              <a
                className="icon-btn contact-bar__btn"
                href={action.href}
                aria-label={action.label}
                title={action.label}
                {...(action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {action.icon}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
