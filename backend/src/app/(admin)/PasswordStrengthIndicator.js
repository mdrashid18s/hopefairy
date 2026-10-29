'use client';

import { useMemo, useState } from 'react';

/**
 * 8 Professional Security Rules Evaluator
 * Evaluates password against 8 enterprise security standards:
 * 1. Minimum 8 characters
 * 2. Uppercase letter (A-Z)
 * 3. Lowercase letter (a-z)
 * 4. Numeric digit (0-9)
 * 5. Special character (!@#$%^&*)
 * 6. No predictable sequences (1234, qwerty, admin, password)
 * 7. No personal email prefix match
 * 8. Enterprise depth (10+ chars & 6+ distinct characters)
 */
export function evaluatePasswordRules(password = '', email = '') {
  const p = password || '';
  const emailPrefix = email ? email.split('@')[0].trim() : '';

  const rules = [
    {
      id: 'min_length',
      label: 'Minimum 8 characters length',
      detail: 'At least 8 characters long',
      met: p.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      detail: 'Contains A-Z',
      met: /[A-Z]/.test(p),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      detail: 'Contains a-z',
      met: /[a-z]/.test(p),
    },
    {
      id: 'digit',
      label: 'At least one numeric digit (0-9)',
      detail: 'Contains 0-9',
      met: /[0-9]/.test(p),
    },
    {
      id: 'special',
      label: 'At least one special symbol (!@#$%^&*)',
      detail: 'Contains symbols like !@#$%^&*()_+-=',
      met: /[^A-Za-z0-9]/.test(p),
    },
    {
      id: 'no_sequence',
      label: 'No predictable sequences',
      detail: 'Avoids 1234, qwerty, admin, password',
      met: p.length > 0 && !/(1234|qwerty|password|admin|abcdef|1111|0000)/i.test(p),
    },
    {
      id: 'no_email',
      label: 'Does not match email or username',
      detail: 'Must not contain your email address handle',
      met: p.length > 0 && (!emailPrefix || emailPrefix.length < 3 || !p.toLowerCase().includes(emailPrefix.toLowerCase())),
    },
    {
      id: 'complexity',
      label: 'Enterprise complexity (10+ chars & variety)',
      detail: '10+ characters with 6+ unique symbols',
      met: p.length >= 10 && new Set(p.split('')).size >= 6,
    },
  ];

  const metCount = rules.filter((r) => r.met).length;

  let strength = 'weak';
  let label = 'Weak';
  let color = 'rose';
  let percentage = Math.round((metCount / 8) * 100);

  if (p.length === 0) {
    strength = 'empty';
    label = 'Not Entered';
    color = 'slate';
    percentage = 0;
  } else if (metCount <= 3) {
    strength = 'weak';
    label = 'Weak';
    color = 'rose';
  } else if (metCount <= 6) {
    strength = 'intermediate';
    label = 'Intermediate';
    color = 'amber';
  } else {
    strength = 'strong';
    label = 'Strong';
    color = 'emerald';
  }

  return {
    rules,
    metCount,
    totalRules: rules.length,
    strength,
    label,
    color,
    percentage,
  };
}

export default function PasswordStrengthIndicator({
  password = '',
  email = '',
  isLight = false,
  showChecklistInitially = false,
}) {
  const [showChecklist, setShowChecklist] = useState(showChecklistInitially);
  const evaluation = useMemo(
    () => evaluatePasswordRules(password, email),
    [password, email]
  );

  const { rules, metCount, strength, label, percentage } = evaluation;

  // Don't render empty clutter if no password typed yet
  if (!password) {
    return null;
  }

  return (
    <div className="mt-2.5 space-y-2">
      {/* Visual 3-Stage Strength Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Password Strength:
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all duration-300 ${
              strength === 'weak'
                ? isLight
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : strength === 'intermediate'
                ? isLight
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : isLight
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                strength === 'weak'
                  ? 'bg-rose-500 animate-pulse'
                  : strength === 'intermediate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowChecklist(!showChecklist)}
          className={`text-[11px] font-semibold transition hover:underline flex items-center gap-1 ${
            isLight ? 'text-amber-800 hover:text-amber-900' : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          <span>{metCount}/8 Rules</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showChecklist ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 3-Bar Segmented Visual Meter */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Segment 1: Weak Threshold */}
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            strength === 'weak'
              ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
              : strength === 'intermediate'
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
        />
        {/* Segment 2: Intermediate Threshold */}
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            strength === 'intermediate'
              ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
              : strength === 'strong'
              ? 'bg-emerald-500'
              : isLight
              ? 'bg-slate-200'
              : 'bg-slate-800'
          }`}
        />
        {/* Segment 3: Strong Threshold */}
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            strength === 'strong'
              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
              : isLight
              ? 'bg-slate-200'
              : 'bg-slate-800'
          }`}
        />
      </div>

      {/* Expandable 8-Rule Interactive Security Checklist */}
      {showChecklist && (
        <div
          className={`p-3 rounded-xl border text-xs transition-all duration-200 ${
            isLight
              ? 'bg-[#f7f4ec] border-[#e2dacf] text-slate-700'
              : 'bg-[#151412] border-[#2b2721] text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-inherit">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-500">
              8 Enterprise Security Rules
            </span>
            <span className="text-[10px] opacity-75">{metCount} of 8 met</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center gap-1.5 text-[11px] transition-colors ${
                  rule.met
                    ? 'text-emerald-500 font-medium'
                    : isLight
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                {rule.met ? (
                  <svg className="w-3.5 h-3.5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></span>
                  </span>
                )}
                <span className="truncate">{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
