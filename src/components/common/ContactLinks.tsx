import { Mail, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { phoneHref, siteConfig, whatsappHref } from '@/config/site';

interface ContactLinksProps {
  /** `full` shows a row for every channel, with a "to be added" state for a missing one. `compact` lists only what is configured. */
  variant: 'full' | 'compact';
}

interface Channel {
  id: string;
  label: string;
  value: string;
  href: string | null;
  icon: ReactNode;
  external?: boolean;
}

function channels(): Channel[] {
  const { email, phone, whatsapp } = siteConfig.contact;
  const icon = { size: 20, strokeWidth: 1.5, 'aria-hidden': true } as const;
  return [
    { id: 'email', label: 'Email', value: email, href: email ? `mailto:${email}` : null, icon: <Mail {...icon} /> },
    { id: 'phone', label: 'Phone', value: phone, href: phoneHref(), icon: <Phone {...icon} /> },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      value: whatsapp ? 'Message on WhatsApp' : '',
      href: whatsappHref(),
      icon: <MessageCircle {...icon} />,
      external: true,
    },
  ];
}

/**
 * Contact details from src/config/site.ts. A detail that is not configured
 * shows as a blank to fill, never as a dead link or an invented value.
 */
export function ContactLinks({ variant }: ContactLinksProps) {
  const all = channels();

  if (variant === 'compact') {
    const configured = all.filter((channel) => channel.href);
    if (configured.length === 0) {
      return <p className="text-md text-muted">Contact details are being added.</p>;
    }
    return (
      <ul className="flex flex-col gap-xs">
        {configured.map((channel) => (
          <li key={channel.id}>
            <a
              className="link text-md"
              href={channel.href ?? undefined}
              {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {channel.value}
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="rows">
      {all.map((channel) => (
        <div key={channel.id} className="flex items-center gap-md py-md">
          <span className="text-muted">{channel.icon}</span>
          <dt className="w-24 shrink-0 text-sm font-normal text-ink">{channel.label}</dt>
          <dd className="m-0 min-w-0 text-md">
            {channel.href ? (
              <a
                className="link break-words"
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {channel.value}
              </a>
            ) : (
              <span className="fill">To be added</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
