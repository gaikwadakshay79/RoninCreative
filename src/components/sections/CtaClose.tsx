import { Link } from 'react-router-dom';
import { Reveal } from '@/components/motion/Reveal';

interface CtaCloseProps {
  title?: string;
  line?: string;
  /** Pre-selects a service on the contact form. */
  service?: string;
  actionLabel?: string;
}

/** The close of a page: one statement and the one action the site drives. */
export function CtaClose({
  title = "Have a vision? Let's bring it into focus.",
  line = 'Say what you are planning and where. Rohan replies with how he would shoot it.',
  service,
  actionLabel = 'Start a project',
}: CtaCloseProps) {
  const to = service ? `/contact?service=${encodeURIComponent(service)}` : '/contact';

  return (
    <section className="band mb-0!" aria-labelledby="close-title">
      <Reveal className="shell grid grid-cols-1 items-end gap-x-col gap-y-xl lg:grid-cols-12">
        <h2 id="close-title" className="statement max-w-[18ch] lg:col-span-7">
          {title}
        </h2>
        <div className="flex flex-col items-start gap-lg lg:col-span-4 lg:col-start-9">
          <p className="lead">{line}</p>
          <Link to={to} className="btn">
            {actionLabel}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
