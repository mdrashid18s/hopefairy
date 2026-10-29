'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from '../ui/Icon.jsx';
import Field, { Honeypot } from '../ui/FormField.jsx';
import { submitContact, validateContact } from '../../services/api.js';
import { querySection } from '../../data/site.js';

const empty = { website: '', name: '', email: '', phone: '', message: '' };

/**
 * Simple enquiry form — name, email, phone and message. Submits via
 * submitContact() — see src/services/api.js for where it goes.
 * @param {{source?: string}} props  label saved with the query, e.g. "Homepage query form"
 */
export default function QueryForm({ source = 'Website query form' }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');
  const copy = querySection;

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validateContact(form);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setStatus('sending');
    setMessage('');
    try {
      const res = await submitContact({ ...form, source, type: 'query' });
      setStatus('done');
      setMessage(res.message);
      setForm(empty);
    } catch (err) {
      if (err.status === 422 && err.errors) setErrors(err.errors);
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="card-3d relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'done' ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="flex min-h-[14rem] sm:min-h-[22rem] flex-col items-center justify-center text-center p-2"
          >
            <span className="inline-flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500/15 border-2 border-emerald-500/35 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
              <Icon name="check" className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
            </span>
            <h3 className="mt-3 sm:mt-6 text-lg sm:text-2xl font-bold text-fg">Thanks for contacting us!</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-base font-medium text-brand-500 dark:text-brand-300">Our team will connect with you shortly.</p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="btn-ghost mt-4 sm:mt-6 !px-4 !py-2 text-xs sm:text-sm"
            >
              {copy.againLabel}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            noValidate
          >
            <Honeypot value={form.website} onChange={update} />
            <h3 className="text-base sm:text-xl md:text-2xl font-bold text-fg">{copy.formTitle}</h3>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-fg-muted">{copy.formNote}</p>

            <div className="mt-3 sm:mt-6 grid gap-2.5 sm:gap-4 sm:grid-cols-2">
              <Field label="Name" required name="name" value={form.name} onChange={update} error={errors.name} placeholder="Your full name" autoComplete="name" className="sm:col-span-2" />
              <Field label="Email" required name="email" type="email" value={form.email} onChange={update} error={errors.email} placeholder="you@example.com" autoComplete="email" />
              <Field label="Phone" required name="phone" type="tel" value={form.phone} onChange={update} error={errors.phone} placeholder="+91 …" autoComplete="tel" />
              <Field
                label="Message"
                as="textarea"
                rows={3}
                name="message"
                value={form.message}
                onChange={update}
                placeholder={copy.messagePlaceholder}
                className="sm:col-span-2"
              />
            </div>

            <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <button type="submit" disabled={status === 'sending'} className="btn-primary group !py-2 !px-4 text-xs sm:text-sm disabled:opacity-60">
                {status === 'sending' ? 'Sending…' : copy.submitLabel}
                <Icon name="arrow-right" className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              {status === 'error' && message && (
                <p role="alert" className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">
                  {message}
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
