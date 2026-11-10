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
          ? 'The pictures on this page are licensed placeholders that show how the portfolio is laid out. Ronin Creative’s own projects replace them before launch.'
          : 'This project is a placeholder study built on licensed photographs. It shows how a published project reads and is not a client commission.'}
      </span>
    </p>
  );
}
