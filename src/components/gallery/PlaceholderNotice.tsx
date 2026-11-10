import { Info } from 'lucide-react';

interface PlaceholderNoticeProps {
  /** `page` for a portfolio listing, `project` for one project. */
  scope: 'page' | 'project';
  className?: string;
}

/**
 * Says plainly that stand-in pictures are stand-ins. Shown wherever
 * placeholder projects are listed, so no visitor takes a licensed stock frame
 * for Ronin Creative's own work. It disappears once real projects replace them.
 */
export function PlaceholderNotice({ scope, className = '' }: PlaceholderNoticeProps) {
  return (
    <p className={`notice ticks ${className}`} role="note">
      <Info size={20} strokeWidth={1.5} aria-hidden="true" />
      <span>
        {scope === 'page'
          ? 'These pictures are licensed placeholders. Ronin Creative’s own projects replace them before launch.'
          : 'This project is a placeholder built on licensed photographs, not a client commission.'}
      </span>
    </p>
  );
}
