import { Frame } from '@/components/common/Picture';
import { PageHero } from '@/components/sections/PageHero';
import { pageSeo } from '@/data/seo';
import { useSeo } from '@/hooks/useSeo';
import { listCredits } from '@/lib/media';

/**
 * Attribution for every stand-in photograph, as the Creative Commons licences
 * require. The list is built from src/data/media.ts, so a picture leaves it
 * the moment it is replaced by the studio's own work.
 */
export function Component() {
  useSeo(pageSeo.credits);
  const credits = listCredits();

  return (
    <>
      <PageHero
        title="Photograph credits"
        lead="The pictures on this site are licensed placeholders from Wikimedia Commons, shown until Ronin Creative’s own work replaces them."
      />

      <section className="pt-2xl pb-3xl" aria-label="Credits">
        <div className="shell">
          {credits.length === 0 ? (
            <p className="lead">Every picture on this site is now Ronin Creative’s own work.</p>
          ) : (
            <ul className="rows">
              {credits.map(({ key, item }) => (
                <li key={key} className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-lg gap-y-xs py-md sm:grid-cols-[8rem_minmax(0,2fr)_minmax(0,1fr)]">
                  <Frame media={key} sizes="8rem" alt="" frameClassName="aspect-[3/2]" />
                  <p className="text-md">{item.alt}</p>
                  <p className="col-start-2 text-sm text-ink-2 sm:col-start-3">
                    {item.credit?.author}, {item.credit?.licence}.{' '}
                    <a className="link" href={item.credit?.source} target="_blank" rel="noreferrer">
                      Source file
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
