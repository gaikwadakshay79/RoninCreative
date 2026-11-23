import { Mail, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { WhatsAppIcon } from '@/components/brand/BrandIcons';
import { phoneHref, siteConfig, whatsappHref } from '@/config/site';

interface ContactLinksProps {
  /** `full` shows a row for every channel, with a "to be added" state for a missing one. `compact` lists only what is configured. */
  variant: 'full' | 'compact';
}

interface ChannelLink {
  value: string;
  href: string;
  ariaLabel?: string;
  external?: boolean;
}

interface Channel {
  id: string;
  label: string;
  links: ChannelLink[];
  icon: ReactNode;
}

const externalProps = { target: '_blank', rel: 'noreferrer' } as const;

function channels(): Channel[] {
  const { email, phones } = siteConfig.contact;
  const icon = { size: 20, strokeWidth: 1.5, 'aria-hidden': true } as const;
  return [
    {
      id: 'email',
      label: 'Email',
      links: email ? [{ value: email, href: `mailto:${email}` }] : [],
      icon: <Mail {...icon} />,
    },
    {
      id: 'phone',
      label: 'Phone',
      links: phones.map((phone) => ({ value: phone, href: phoneHref(phone), ariaLabel: `Call ${phone}` })),
      icon: <Phone {...icon} />,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      links: phones.map((phone) => ({
        value: phone,
        href: whatsappHref(phone),
        ariaLabel: `Message ${phone} on WhatsApp`,
        external: true,
      })),
      icon: <WhatsAppIcon className="text-accent" />,
    },
  ];
}

/**
 * Contact details from src/config/site.ts. A detail that is not configured
 * shows as a blank to fill, never as a dead link or an invented value.
 */
export function ContactLinks({ variant }: ContactLinksProps) {
  if (variant === 'compact') {
    const { email, phones } = siteConfig.contact;
    if (!email && phones.length === 0) {
      return <p className="text-md text-muted">Contact details are being added.</p>;
    }
    return (
      <ul className="flex flex-col gap-xs">
        {email ? (
          <li>
            <a className="link text-md break-words" href={`mailto:${email}`}>
              {email}
            </a>
          </li>
        ) : null}
        {phones.map((phone) => (
          <li key={phone} className="flex flex-wrap items-center gap-x-xs text-md">
            <a className="link" href={phoneHref(phone)} aria-label={`Call ${phone}`}>
              {phone}
            </a>
            <span className="text-muted" aria-hidden="true">
              ·
            </span>
            <a
              className="link link--icon"
              href={whatsappHref(phone)}
              aria-label={`Message ${phone} on WhatsApp`}
              {...externalProps}
            >
              <WhatsAppIcon size={18} className="shrink-0 text-accent" />
              WhatsApp
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="rows">
      {channels().map((channel) => (
        <div key={channel.id} className="flex items-center gap-md py-md">
          <span className="text-muted">{channel.icon}</span>
          <dt className="w-24 shrink-0 text-sm font-normal text-ink">{channel.label}</dt>
          <dd className="m-0 flex min-w-0 flex-col gap-2xs text-md">
            {channel.links.length > 0 ? (
              channel.links.map((link) => (
                <a
                  key={link.href}
                  className="link break-words"
                  href={link.href}
                  aria-label={link.ariaLabel}
                  {...(link.external ? externalProps : {})}
                >
                  {link.value}
                </a>
              ))
            ) : (
              <span className="fill">To Be Added</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
