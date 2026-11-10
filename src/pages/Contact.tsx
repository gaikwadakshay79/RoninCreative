import { useSearchParams } from 'react-router-dom';
import { AntdProvider } from '@/app/AntdProvider';
import { ContactLinks } from '@/components/common/ContactLinks';
import { InquiryForm } from '@/components/sections/InquiryForm';
import { PageHero } from '@/components/sections/PageHero';
import { siteConfig, socialLabels, type SocialNetwork } from '@/config/site';
import { pageSeo } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';

export function Component() {
  useSeo(pageSeo.contact);
  const [searchParams] = useSearchParams();
  const socials = (Object.keys(siteConfig.social) as SocialNetwork[]).filter((network) => siteConfig.social[network]);

  return (
    <>
      <PageHero
        title="Tell Rohan about your project."
        lead="Say what you are planning, where it is and when. He replies with questions, an approach and the next step."
      />

      <section className="pt-2xl pb-3xl" aria-labelledby="enquiry-title">
        <h2 id="enquiry-title" className="visually-hidden">
          Contact details and enquiry form
        </h2>
        <div className="shell grid grid-cols-1 gap-x-col gap-y-2xl lg:grid-cols-12">
          <div className="flex flex-col gap-xl lg:col-span-4">
            <div>
              <h3>Contact details</h3>
              <div className="mt-md">
                <ContactLinks variant="full" />
              </div>
            </div>

            {siteConfig.location ? (
              <div>
                <h3>Based in</h3>
                <p className="mt-sm text-md">{siteConfig.location}</p>
              </div>
            ) : null}

            {socials.length > 0 ? (
              <div>
                <h3>Follow the work</h3>
                <ul className="mt-sm flex flex-wrap gap-x-lg gap-y-xs">
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
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <h3>Project enquiry</h3>
            <div className="mt-lg">
              <AntdProvider>
                <InquiryForm initialService={searchParams.get('service')} />
              </AntdProvider>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
