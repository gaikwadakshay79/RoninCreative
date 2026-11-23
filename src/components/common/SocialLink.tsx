import { InstagramIcon } from '@/components/brand/BrandIcons';
import { siteConfig, socialLabels, type SocialNetwork } from '@/config/site';

/** A link to one social profile, with the network's icon where the site has one. */
export function SocialLink({ network }: { network: SocialNetwork }) {
  return (
    <a className="link link--icon text-md" href={siteConfig.social[network]} target="_blank" rel="noreferrer">
      {network === 'instagram' ? <InstagramIcon className="shrink-0 text-accent" /> : null}
      {socialLabels[network]}
    </a>
  );
}
