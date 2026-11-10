import { contactEndpoint, siteConfig } from '@/config/site';
import type { InquiryPayload, InquiryResult } from '@/types';

/**
 * Contact adapter. This is the only file that knows how an enquiry leaves the site.
 *
 * - VITE_CONTACT_ENDPOINT set: the enquiry is posted there as JSON.
 * - Otherwise: the visitor's own email app opens, addressed to
 *   siteConfig.contact.email, with the enquiry written out. Nothing is sent
 *   until the visitor presses send there, and the form says so.
 * - Neither configured: it throws ContactNotConfiguredError and the form shows
 *   a "not connected yet" state.
 *
 * To wire a form service or your own API later, set the environment variable.
 * To change the request shape, edit `sendToEndpoint` and nothing else.
 */
export class ContactNotConfiguredError extends Error {
  constructor() {
    super('No contact endpoint or email address is configured.');
    this.name = 'ContactNotConfiguredError';
  }
}

export interface InquiryContext {
  /** Human-readable name of the chosen service. */
  serviceLabel: string;
}

async function sendToEndpoint(payload: InquiryPayload, context: InquiryContext): Promise<void> {
  const { api } = await import('./client');
  await api.post(contactEndpoint, { ...payload, serviceLabel: context.serviceLabel, source: siteConfig.name });
}

export function buildMailto(payload: InquiryPayload, context: InquiryContext): string {
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    `Service: ${context.serviceLabel}`,
    payload.location ? `Project location: ${payload.location}` : null,
    '',
    payload.message,
  ].filter((line): line is string => line !== null);

  const subject = `Project enquiry: ${context.serviceLabel}`;
  return `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export async function submitInquiry(payload: InquiryPayload, context: InquiryContext): Promise<InquiryResult> {
  if (contactEndpoint) {
    await sendToEndpoint(payload, context);
    return { channel: 'api' };
  }
  if (siteConfig.contact.email) {
    window.location.href = buildMailto(payload, context);
    return { channel: 'email' };
  }
  throw new ContactNotConfiguredError();
}
