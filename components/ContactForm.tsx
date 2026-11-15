'use client';

import { useState } from 'react';
import { destinations, settings } from '@/lib/data';
import { whatsappUrl } from '@/utils/whatsapp';

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  location: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  service: '',
  date: '',
  location: '',
  message: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  function update(field: keyof FormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setStatus('idle');
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Please enter your name.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Please enter your email address.';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.service) {
      nextErrors.service = 'Please select the service you need.';
    }

    if (!form.message.trim()) {
      nextErrors.message = 'Please tell us about your project.';
    } else if (form.message.trim().length < 10) {
      nextErrors.message = 'Please add a little more detail about your project.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildMessage(): string {
    const lines = [
      'New contact enquiry from the Syed Productions website',
      '',
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
    ];

    if (form.phone.trim()) lines.push(`Phone: ${form.phone.trim()}`);
    lines.push(`Service: ${form.service}`);
    if (form.date) lines.push(`Project date: ${form.date}`);
    if (form.location.trim()) lines.push(`Project location: ${form.location.trim()}`);
    lines.push('', 'Project details:', form.message.trim());

    return lines.join('\n');
  }

  function sendViaWhatsApp() {
    if (!validate()) {
      setStatus('error');
      setStatusMessage('Please check the highlighted fields before sending.');
      return;
    }

    window.open(whatsappUrl(buildMessage()), '_blank', 'noopener');
    setStatus('success');
    setStatusMessage(
      'WhatsApp has opened with your enquiry. Press Send there to deliver it to our team.'
    );
  }

  function sendViaEmail() {
    if (!validate()) {
      setStatus('error');
      setStatusMessage('Please check the highlighted fields before sending.');
      return;
    }

    const subject = `Project enquiry from ${form.name.trim()}`;
    window.location.href = `mailto:${settings.contact.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(buildMessage())}`;
    setStatus('success');
    setStatusMessage('Your email app has opened with the enquiry ready to send.');
  }

  return (
    <div className="contact-form-card">
      <h2>Send Us a Message</h2>
      <p className="contact-form-intro">
        Tell us about your project and we&apos;ll get back to you within 24 hours.
        You can send the enquiry through WhatsApp or email.
      </p>

      {status !== 'idle' && (
        <div
          className={`contact-form-status contact-form-status--${status}`}
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}

      <form
        className="contact-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          sendViaWhatsApp();
        }}
      >
        <div className="contact-form-row">
          <div className="contact-form-field">
            <label htmlFor="contact-name">Full Name</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Your full name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              required
            />
            {errors.name && (
              <span className="contact-form-error" id="contact-name-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="contact-form-field">
            <label htmlFor="contact-email">Email Address</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              required
            />
            {errors.email && (
              <span className="contact-form-error" id="contact-email-error">
                {errors.email}
              </span>
            )}
          </div>
        </div>

        <div className="contact-form-row">
          <div className="contact-form-field">
            <label htmlFor="contact-phone">Phone / WhatsApp</label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="+92 300 1234567"
            />
          </div>

          <div className="contact-form-field">
            <label htmlFor="contact-service">Service Needed</label>
            <select
              id="contact-service"
              name="service"
              value={form.service}
              onChange={(event) => update('service', event.target.value)}
              aria-invalid={Boolean(errors.service)}
              aria-describedby={errors.service ? 'contact-service-error' : undefined}
              required
            >
              <option value="">Select a service...</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.name}>
                  {destination.name}
                </option>
              ))}
              <option value="Other / Not sure yet">Other / Not sure yet</option>
            </select>
            {errors.service && (
              <span className="contact-form-error" id="contact-service-error">
                {errors.service}
              </span>
            )}
          </div>
        </div>

        <div className="contact-form-row">
          <div className="contact-form-field">
            <label htmlFor="contact-date">Project Date</label>
            <input
              id="contact-date"
              name="date"
              type="date"
              value={form.date}
              onChange={(event) => update('date', event.target.value)}
            />
          </div>

          <div className="contact-form-field">
            <label htmlFor="contact-location">Project Location</label>
            <input
              id="contact-location"
              name="location"
              type="text"
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
              placeholder="Islamabad, Lahore, or another city"
            />
          </div>
        </div>

        <div className="contact-form-field">
          <label htmlFor="contact-message">Project Details</label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            placeholder="Tell us about your event or project, timeline, deliverables and any references."
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
            required
          />
          {errors.message && (
            <span className="contact-form-error" id="contact-message-error">
              {errors.message}
            </span>
          )}
        </div>

        <div className="contact-form-actions">
          <button type="submit" className="btn btn-primary">
            Send via WhatsApp
          </button>
          <button type="button" className="btn btn-outline" onClick={sendViaEmail}>
            Send via Email
          </button>
        </div>

        <p className="contact-form-note">
          Your details are only used to respond to this enquiry. For the fastest
          reply, choose WhatsApp.
        </p>
      </form>
    </div>
  );
}
