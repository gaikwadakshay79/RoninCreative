import { Check, Share2 } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { shareUrl } from '@/lib/paths';

interface ShareLinkProps {
  /** The path to share, read at the moment of the click so it holds the current view. */
  getPath: () => string;
  /** Title offered to the phone's share sheet. */
  title: string;
  /** What the button shares, for screen readers. */
  label: string;
  /** `bar` is a labelled button, `tool` an icon in the 360° toolbar. */
  variant: 'bar' | 'tool';
}

const COPIED_FOR_MS = 2200;

async function copyText(text: string, button: HTMLElement): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the older way of copying.
  }
  // Plain http has no clipboard API. The field must sit inside an open dialog or fullscreen element to take focus.
  const host = button.closest('dialog') ?? document.fullscreenElement ?? document.body;
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
  host.appendChild(field);
  field.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    button.focus();
  }
}

/** Opens the phone's share sheet, or copies the exact link on a computer. */
export function ShareLink({ getPath, title, label, variant }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const url = shareUrl(getPath());

    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    if (await copyText(url, button)) {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_FOR_MS);
    } else {
      window.prompt('Copy this link', url);
    }
  };

  const Icon = copied ? Check : Share2;

  return (
    <span className="share-link">
      <button
        type="button"
        className={variant === 'bar' ? 'lightbox__jump' : 'pano-tool'}
        aria-label={label}
        onClick={(event) => void onClick(event)}
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        {variant === 'bar' ? (copied ? 'Link Copied' : 'Share') : null}
      </button>
      <span className={variant === 'tool' && copied ? 'share-note' : 'visually-hidden'} role="status">
        {copied ? 'Link Copied' : ''}
      </span>
    </span>
  );
}
