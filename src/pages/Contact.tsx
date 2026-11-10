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

      <section className="pb-3xl" aria-label="Enquiry">
        <div className="shell grid grid-cols-1 gap-x-col gap-y-2xl lg:grid-cols-12">
          <div className="flex flex-col gap-xl lg:col-span-4">
            <div>
              <h2 className="text-title font-normal tracking-[-0.02em]">Contact details</h2>
              <div className="mt-md">
                <ContactLinks variant="full" />
              </div>
            </div>

            {siteConfig.location ? (
              <div>
                <h2 className="text-title font-normal tracking-[-0.02em]">Based in</h2>
                <p className="mt-sm text-md">{siteConfig.location}</p>
              </div>
            ) : null}

            {socials.length > 0 ? (
              <div>
                <h2 className="text-title font-normal tracking-[-0.02em]">Follow the work</h2>
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
            <h2 className="text-title font-normal tracking-[-0.02em]">Project enquiry</h2>
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
