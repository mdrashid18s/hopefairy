'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/sections/PageHeader.jsx';
import Section from '../../components/ui/Section.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Reveal from '../../components/ui/Reveal.jsx';
import Icon from '../../components/ui/Icon.jsx';
import FAQ from '../../components/sections/FAQ.jsx';
import Field, { Honeypot } from '../../components/ui/FormField.jsx';
import Captcha from '../../components/ui/Captcha.jsx';
import { submitContact, validateContact } from '../../services/api.js';
import { captchaService } from '../../services/captchaService.js';
import { getApiBaseUrl } from '../../services/httpClient.js';
import { site, contactPage, destinations, formOptions } from '../../data/site.js';

const empty = {
  website: '', // honeypot — must stay empty
  interest: '',
  name: '',
  email: '',
  phone: '',
  city: '',
  qualification: '',
  studyLevel: '',
  destination: '',
  intake: '',
  course: '',
  message: '',
};

const nextSteps = [
  'A counsellor calls you to understand your goals',
  'We schedule your free 1:1 counselling session',
  'You receive a personalised study abroad plan',
];

export default function ContactClient() {
  const [form, setForm] = useState(empty);
  const [destList, setDestList] = useState(destinations);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [serverMsg, setServerMsg] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const refreshCaptcha = () => {
    setCaptchaCode(captchaService.generate());
    setCaptchaInput('');
  };

  // Generate on mount only (client-side) to avoid hydration mismatch
  useEffect(refreshCaptcha, []);

  // Fetch live active destinations from API
  useEffect(() => {
    let isMounted = true;
    const apiUrl = getApiBaseUrl();
    fetch(`${apiUrl}/api/destinations`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const list = json?.data?.items || json?.data;
        if (Array.isArray(list) && list.length > 0) {
          setDestList(list);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-fill interest from URL param if present (e.g. /contact-us?interest=Gulf+Desk)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const interestParam = params.get('interest');
      if (interestParam) {
        // match against known options or format
        const match = formOptions.interest.find(
          (opt) => opt.toLowerCase() === interestParam.toLowerCase()
        );
        if (match) {
          setForm((f) => ({ ...f, interest: match }));
        } else {
          setForm((f) => ({ ...f, interest: interestParam }));
        }
      }
    }
  }, []);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const clientErrors = validateContact(form);
    if (!captchaService.verify(captchaInput, captchaCode)) {
      clientErrors.captcha = 'Code does not match. Please try again.';
    }
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      if (clientErrors.captcha) refreshCaptcha();
      return;
    }
    setStatus('sending');
    setServerMsg('');
    try {
      const res = await submitContact({ ...form, source: 'Contact page', type: 'inquiry' });
      setStatus('done');
      setServerMsg(res.message || contactPage.thankYou);
      setForm(empty);
      refreshCaptcha();
    } catch (err) {
      if (err.status === 422 && err.errors) setErrors(err.errors);
      setStatus('error');
      setServerMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={contactPage.eyebrow || 'Contact Us'}
        crumb="Contact"
        title={
          <>
            Let&apos;s Talk About{' '}
            <span className="text-gradient-brand">Your Future.</span>
          </>
        }
        intro={contactPage.intro}
      />

      <Section seq={1} className="!pt-10 sm:!pt-16">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Direct Consultation & Rapid Inquiry Desk"
          intro="Fill out the consultation form below or reach out directly to schedule a free 1-on-1 career advisory session."
          highlightLast={2}
          className="mb-8 sm:mb-12"
        />
        <div className="grid gap-6 sm:gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          {/* Details */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:gap-4">
            <ContactTile i={0} href={site.phoneHref} icon="phone" label="Call us" value={site.phone} />
            <ContactTile
              i={1}
              href={site.whatsappHref}
              external
              icon="message-circle"
              label="WhatsApp"
              value="Chat now"
            />
            <ContactTile i={2} href={site.emailHref} icon="mail" label="Email" value={site.email} />
            <ContactTile i={3} icon="clock" label="Office hours" value={site.hours} />

            {/* What happens next — black & gold panel */}
            <Reveal i={4} className="col-span-2 sm:col-span-1">
              <div className="relative overflow-hidden rounded-2xl border border-brand-400/30 bg-ink-950 p-4 sm:p-6 text-white">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-400/25 blur-[70px]" />
                <span className="relative text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">
                  What happens next
                </span>
                <ol className="relative mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                  {nextSteps.map((s, i) => (
                    <li key={s} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-white/80">
                      <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-[0.65rem] sm:text-[0.7rem] font-bold text-ink-950">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal i={5} className="col-span-2 sm:col-span-1">
              <div className="rounded-2xl border border-hair/10 bg-surface/70 p-4 sm:p-6 dark:bg-tint/[0.02]">
                <span className="block text-[10px] sm:text-xs uppercase tracking-[0.2em] text-fg-faint">Follow us</span>
                <div className="mt-2.5 sm:mt-3 flex gap-2">
                  {site.socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Follow HopeFairy on ${s.label} for Study Abroad Updates & University Admissions`}
                      aria-label={`HopeFairy on ${s.label}`}
                      className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-hair/10 text-fg-muted transition-all hover:-translate-y-0.5 hover:border-brand-400/60 hover:text-brand-500"
                    >
                      <Icon name={s.icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal i={1}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-400/25 bg-surface/80 p-3.5 sm:p-6 shadow-card backdrop-blur-xl dark:bg-tint/[0.03]"
            >
              <Honeypot value={form.website} onChange={update} />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />
              <h2 className="text-xl sm:text-2xl">{contactPage.formHeading}</h2>
              <p className="mt-1 text-xs sm:text-sm text-fg-muted">
                Fields marked <span className="text-brand-600 dark:text-brand-300">*</span> are required.
                We’ll never share your details.
              </p>

              <div className="mt-4 sm:mt-5 grid gap-2.5 sm:gap-3.5 sm:grid-cols-2">
                <Field label="Full name" required name="name" value={form.name} onChange={update} error={errors.name} placeholder="Your full name" autoComplete="name" />
                <Field label="Phone / WhatsApp" required name="phone" type="tel" value={form.phone} onChange={update} error={errors.phone} placeholder="+91 …" autoComplete="tel" />
                <Field label="Email" required name="email" type="email" value={form.email} onChange={update} error={errors.email} placeholder="you@example.com" autoComplete="email" />
                <Field label="City & Country" name="city" value={form.city} onChange={update} error={errors.city} placeholder="e.g. Dubai, UAE or Mumbai, India" autoComplete="address-level2" />

                <Field
                  label="I’m interested in"
                  as="select"
                  name="interest"
                  value={form.interest}
                  onChange={update}
                  className="sm:col-span-2"
                >
                  <option value="">Select</option>
                  {formOptions.interest.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Field>
                <Field label="Current qualification" as="select" name="qualification" value={form.qualification} onChange={update}>
                  <option value="">Select</option>
                  {formOptions.qualification.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Field>
                <Field label="Planning to study" as="select" name="studyLevel" value={form.studyLevel} onChange={update}>
                  <option value="">Select</option>
                  {formOptions.studyLevel.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Field>
                <Field label="Preferred destination (if abroad)" as="select" name="destination" value={form.destination} onChange={update}>
                  <option value="">Select</option>
                  {destList.map((d) => (
                    <option key={d.slug}>{d.name}</option>
                  ))}
                  <option>Other</option>
                  <option>Not sure yet</option>
                </Field>
                <Field label="When do you plan to start?" as="select" name="intake" value={form.intake} onChange={update}>
                  <option value="">Select</option>
                  {formOptions.intake.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Field>
                <Field
                  label="Course / field of interest"
                  name="course"
                  value={form.course}
                  onChange={update}
                  placeholder="e.g. MSc Data Science, MBA, BBA"
                  className="sm:col-span-2"
                />
                <Field
                  label="Anything else we should know?"
                  name="message"
                  as="textarea"
                  rows={2}
                  value={form.message}
                  onChange={update}
                  error={errors.message}
                  placeholder="Test scores, budget, questions — anything that helps us prepare for your session."
                  className="sm:col-span-2"
                />
                <Captcha
                  code={captchaCode}
                  value={captchaInput}
                  onChange={(e) => {
                    setCaptchaInput(e.target.value);
                    if (errors.captcha) setErrors((x) => ({ ...x, captcha: undefined }));
                  }}
                  onRefresh={refreshCaptcha}
                  error={errors.captcha}
                  className="sm:col-span-2"
                />
              </div>

              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-primary group !py-2.5 !px-5 text-xs sm:text-sm disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending…' : 'Book My Free Session'}
                  <Icon
                    name="arrow-right"
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  />
                </button>

                <AnimatePresence mode="wait">
                  {status === 'done' ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="status"
                      className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-left shadow-sm flex items-center gap-3"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                        <Icon name="check" className="h-5 w-5" strokeWidth={3} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Thanks for contacting us!
                        </p>
                        <p className="text-xs font-medium text-emerald-600/90 dark:text-emerald-300/90 mt-0.5">
                          Our team will connect with you shortly.
                        </p>
                      </div>
                    </motion.div>
                  ) : serverMsg ? (
                    <motion.p
                      key={serverMsg}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="status"
                      className="text-sm font-medium text-red-600 dark:text-red-400"
                    >
                      {serverMsg}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </form>
          </Reveal>
        </div>
      </Section>

      <FAQ seq={2} />
    </>
  );
}

function ContactTile({ i, href, external, icon, label, value }) {
  const inner = (
    <>
      <span className="icon-3d h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-lg sm:rounded-xl">
        <Icon name={icon} className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[9.5px] sm:text-xs uppercase tracking-[0.16em] text-fg-faint leading-tight">{label}</span>
        <span className="block truncate text-xs sm:text-lg font-semibold text-fg mt-0.5">{value}</span>
      </span>
    </>
  );
  const cls =
    'group flex items-center gap-2.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-hair/10 bg-surface/70 p-2.5 sm:p-5 transition-colors hover:border-brand-400/40 dark:bg-tint/[0.02]';
  return (
    <Reveal i={i}>
      {href ? (
        <a
          href={href}
          className={cls}
          title={
            label === 'Call us'
              ? `Call HopeFairy Admission Helpdesk: ${site.phone}`
              : label === 'WhatsApp'
                ? 'Chat on WhatsApp with HopeFairy Mentor'
                : label === 'Email'
                  ? 'Send Email to HopeFairy Admissions'
                  : label
          }
          aria-label={label}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {inner}
        </a>
      ) : (
        <div className={cls}>{inner}</div>
      )}
    </Reveal>
  );
}
