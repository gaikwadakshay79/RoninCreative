import { App, Form, Input, Select } from 'antd';
import { Info } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { hasContactChannel, siteConfig } from '@/config/site';
import { useServices, useSubmitInquiry } from '@/hooks/useContent';
import { ContactNotConfiguredError } from '@/lib/api/contact';
import type { InquiryPayload, ServiceId } from '@/types';

interface InquiryFormProps {
  /** Service id from the page address (?service=drone), pre-selected when it exists. */
  initialService?: string | null;
}

interface FormValues {
  name: string;
  email: string;
  phone?: string;
  service: ServiceId | 'other';
  location?: string;
  message: string;
}

type Status = { tone: 'neutral' | 'error'; text: string } | null;

const NOT_CONNECTED =
  'Nothing was sent. This form is not connected yet: a contact email or endpoint still has to be configured.';

/**
 * The enquiry form, on Ant Design's Form for labels, validation and errors.
 *
 * Where the enquiry goes is decided in src/lib/api/contact.ts. This component
 * never claims a message was sent unless an endpoint accepted it: with the
 * email fallback it says the visitor's own email app has opened, and with no
 * channel configured it says plainly that nothing was sent.
 */
export function InquiryForm({ initialService }: InquiryFormProps) {
  const [form] = Form.useForm<FormValues>();
  const { notification } = App.useApp();
  const services = useServices();
  const submit = useSubmitInquiry();
  const [status, setStatus] = useState<Status>(null);

  const options = useMemo(
    () => [
      ...(services.data ?? []).map((service) => ({ value: service.id as string, label: service.title })),
      { value: 'other', label: 'Something else' },
    ],
    [services.data],
  );

  // Pre-select the service named in the address once the list has loaded.
  useEffect(() => {
    if (!initialService || !services.data) return;
    if (services.data.some((service) => service.id === initialService)) {
      form.setFieldsValue({ service: initialService as ServiceId });
    }
  }, [initialService, services.data, form]);

  const onFinish = (values: FormValues) => {
    setStatus(null);
    const payload: InquiryPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || undefined,
      service: values.service,
      location: values.location?.trim() || undefined,
      message: values.message.trim(),
    };
    const serviceLabel = options.find((option) => option.value === values.service)?.label ?? 'General enquiry';

    submit.mutate(
      { payload, context: { serviceLabel } },
      {
        onSuccess: (result) => {
          if (result.channel === 'api') {
            form.resetFields();
            setStatus({ tone: 'neutral', text: `Your enquiry is in. ${siteConfig.founder} will reply by email.` });
            notification.success({
              message: 'Your enquiry is in',
              description: `${siteConfig.founder} will reply by email.`,
            });
          } else {
            setStatus({
              tone: 'neutral',
              text: 'Your email app has opened with the enquiry written out. Press send there to deliver it.',
            });
          }
        },
        onError: (error) => {
          if (error instanceof ContactNotConfiguredError) {
            setStatus({ tone: 'error', text: NOT_CONNECTED });
            return;
          }
          const text = `The enquiry was not sent. ${error.message} Your entries are still in the form.`;
          setStatus({ tone: 'error', text });
          notification.error({ message: 'The enquiry was not sent', description: error.message });
        },
      },
    );
  };

  return (
    <Form<FormValues>
      form={form}
      name="enquiry"
      layout="vertical"
      size="large"
      requiredMark="optional"
      onFinish={onFinish}
      scrollToFirstError={{ behavior: 'smooth', block: 'center', focus: true }}
      disabled={submit.isPending}
      noValidate
    >
      {hasContactChannel ? null : (
        <p className="notice ticks mb-lg" role="note">
          <Info size={20} strokeWidth={1.5} aria-hidden="true" />
          <span>
            Enquiries are not switched on yet. The form checks your entries but cannot send them.
          </span>
        </p>
      )}

      <div className="grid grid-cols-1 gap-x-col sm:grid-cols-2">
        <Form.Item
          name="name"
          label="Full name"
          rules={[{ required: true, whitespace: true, message: 'Write your full name.' }]}
        >
          <Input name="name" autoComplete="name" maxLength={120} />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Write the email address to reply to.' },
            { type: 'email', message: 'That address looks incomplete. Write it as name@example.com.' },
          ]}
        >
          <Input name="email" type="email" inputMode="email" autoComplete="email" maxLength={160} />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone number"
          rules={[
            {
              pattern: /^[+()\d\s.-]{7,20}$/,
              message: 'Use digits, spaces and + only, for example +91 98765 43210.',
            },
          ]}
        >
          <Input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} />
        </Form.Item>

        <Form.Item
          name="service"
          label="Service you are interested in"
          rules={[{ required: true, message: 'Choose the service closest to what you need.' }]}
        >
          <Select
            options={options}
            loading={services.isPending}
            placeholder="Choose a service"
            aria-label="Service you are interested in"
          />
        </Form.Item>
      </div>

      <Form.Item name="location" label="Project location">
        <Input name="location" autoComplete="address-level2" maxLength={160} />
      </Form.Item>

      <Form.Item
        name="message"
        label="Project description"
        rules={[
          { required: true, whitespace: true, message: 'Describe the project in a sentence or two.' },
          { min: 20, message: 'Add a little more detail: at least 20 characters.' },
        ]}
      >
        <Input.TextArea name="message" rows={6} maxLength={2000} showCount />
      </Form.Item>

      <div className="mt-lg flex flex-col items-start gap-md">
        <button type="submit" className="btn" disabled={submit.isPending} aria-busy={submit.isPending}>
          {submit.isPending ? 'Sending the enquiry…' : 'Send the enquiry'}
        </button>
        <p
          className={`min-h-[1lh] text-sm ${status?.tone === 'error' ? 'text-error' : 'text-ink-2'}`}
          role="status"
          aria-live="polite"
        >
          {status?.text}
        </p>
      </div>
    </Form>
  );
}
