import { Frame } from '@/components/common/Picture';
import { PageHero } from '@/components/sections/PageHero';
import { pageSeo } from '@/data/seo';
import { usePanoramas } from '@/hooks/useContent';
import { useSeo } from '@/hooks/useSeo';
import { listCredits } from '@/lib/media';

const rowClass =
  'grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-x-lg gap-y-xs py-md sm:grid-cols-[8rem_minmax(0,2fr)_minmax(0,1fr)]';

/**
 * Attribution for every stand-in photograph and demo panorama, as the Creative
 * Commons licences require. The lists are built from src/data/media.ts and
 * src/data/panoramas.ts, so an item leaves the page the moment it is replaced
 * by the studio's own work.
 */
export function Component() {
  useSeo(pageSeo.credits);
  const credits = listCredits();
  const panoramas = (usePanoramas().data ?? []).filter((panorama) => panorama.placeholder && panorama.credit);

  return (
    <>
      <PageHero
        title="Photograph credits"
        lead="The pictures on this site are licensed placeholders from Wikimedia Commons, shown until Ronin Creative’s own work replaces them."
      />

      <section className="pt-2xl pb-3xl" aria-label="Credits">
        <div className="shell">
          {credits.length === 0 && panoramas.length === 0 ? (
            <p className="lead">Every picture on this site is now Ronin Creative’s own work.</p>
          ) : null}

          {credits.length > 0 ? (
            <ul className="rows">
              {credits.map(({ key, item }) => (
                <li key={key} className={rowClass}>
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
          ) : null}

          {panoramas.length > 0 ? (
            <>
              <h2 className="display-s mt-3xl">360° panoramas</h2>
              <ul className="rows mt-xl">
                {panoramas.map((panorama) => (
                  <li key={panorama.id} className={rowClass}>
                    <figure className="frame aspect-[3/2]">
                      <img
                        src={`/panoramas/${panorama.id}-poster.jpg`}
                        alt=""
                        width={1280}
                        height={720}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                    <p className="text-md">{panorama.alt}</p>
                    <p className="col-start-2 text-sm text-ink-2 sm:col-start-3">
                      {panorama.credit?.author}, {panorama.credit?.licence}.{' '}
                      <a className="link" href={panorama.credit?.source} target="_blank" rel="noreferrer">
                        Source file
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </section>
    </>
  );
}
