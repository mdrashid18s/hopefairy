'use client';

import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

/**
 * Canvas-drawn alphanumeric captcha with an input and refresh button.
 * The code itself is owned by the parent (see services/captchaService.js)
 * so the form can verify it on submit.
 *
 * @param {{code:string, value:string, onChange:Function, onRefresh:Function, error?:string, className?:string}} p
 */
export default function Captcha({ code, value, onChange, onRefresh, error, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !code) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(200, 155, 60, ${0.25 + Math.random() * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Characters with slight rotation and offset
    const step = width / (code.length + 1);
    ctx.font = 'bold 22px monospace';
    ctx.textBaseline = 'middle';
    [...code].forEach((ch, i) => {
      ctx.save();
      ctx.translate(step * (i + 0.6), height / 2 + (Math.random() * 8 - 4));
      ctx.rotate((Math.random() * 30 - 15) * (Math.PI / 180));
      ctx.fillStyle = i % 2 ? '#c89b3c' : '#8a6a24';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });

    // Noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = 'rgba(138, 106, 36, 0.35)';
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
  }, [code]);

  return (
    <div className={`flex flex-col gap-1 sm:gap-2 ${className}`}>
      <span className="text-xs sm:text-sm font-medium text-fg-muted">
        Enter the code shown
        <span className="ml-0.5 text-brand-600 dark:text-brand-300">*</span>
      </span>
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          width={150}
          height={42}
          aria-label="Captcha code"
          role="img"
          className="h-[38px] sm:h-[44px] w-[136px] sm:w-[150px] shrink-0 select-none rounded-xl border border-brand-400/30 bg-white"
        />
        <button
          type="button"
          onClick={onRefresh}
          title="Get a new code"
          aria-label="Refresh captcha"
          className="inline-flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-hair/15 text-fg-muted transition-colors hover:border-brand-400/60 hover:text-brand-500"
        >
          <Icon name="refresh-cw" className="h-4 w-4" />
        </button>
        <input
          name="captcha"
          value={value}
          onChange={onChange}
          placeholder="Type code"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={!!error}
          className={`min-w-0 flex-1 rounded-xl border bg-page/70 px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm text-fg placeholder:text-fg-faint outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 ${
            error ? 'border-red-500/60' : 'border-hair/15'
          }`}
        />
      </div>
      {error && <span className="text-[11px] sm:text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
