import { contactEndpoint, siteConfig, web3formsKey } from '@/config/site';
import type { InquiryPayload, InquiryResult } from '@/types';

/**
 * Contact adapter. This is the only file that knows how an enquiry leaves the site.
 *
 * - VITE_CONTACT_ENDPOINT set: the enquiry is posted there as JSON.
 * - Otherwise, with `web3formsKey` set: it is sent through Web3Forms, which
 *   emails it to the inbox the key belongs to.
 * - Otherwise: the visitor's own email app opens, addressed to
 *   siteConfig.contact.email, with the enquiry written out. Nothing is sent
 *   until the visitor presses send there, and the form says so.
 * - None configured: it throws ContactNotConfiguredError and the form shows
 *   a "not connected yet" state.
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

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const WEB3FORMS_TIMEOUT = 15_000;

async function sendToWeb3Forms(payload: InquiryPayload, context: InquiryContext): Promise<void> {
  const fallback = siteConfig.contact.email ? ` You can also write to ${siteConfig.contact.email}.` : '';

  let response: Response;
  try {
    response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: AbortSignal.timeout(WEB3FORMS_TIMEOUT),
      body: JSON.stringify({
        access_key: web3formsKey,
        subject: `New enquiry: ${context.serviceLabel}`,
        from_name: `${siteConfig.name} Website`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        service: context.serviceLabel,
        location: payload.location,
        message: payload.message,
      }),
    });
  } catch {
    throw new Error(`The form service could not be reached. Check the connection and try again.${fallback}`);
  }

  if (response.status === 429) {
    throw new Error(`Too many enquiries came from this connection. Try again in an hour.${fallback}`);
  }
  const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
  if (!response.ok || result?.success !== true) {
    throw new Error(`The form service did not accept it. Try again in a moment.${fallback}`);
  }
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
  if (web3formsKey) {
    await sendToWeb3Forms(payload, context);
    return { channel: 'api' };
  }
  if (siteConfig.contact.email) {
    window.location.href = buildMailto(payload, context);
    return { channel: 'email' };
  }
  throw new ContactNotConfiguredError();
}
