import { site } from '../../data/site.js';

/**
 * Floating quick-chat button, bottom-right just above BackToTop — WhatsApp
 * is how most Indian families reach out first.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={site.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat on WhatsApp with Best Abroad Admission Advisor & Career Counsellor (Instant Reply)"
      aria-label="Chat directly on WhatsApp with HopeFairy senior education counsellor"
      className="group fixed bottom-[4.5rem] right-3.5 z-40 inline-flex h-11 w-11 sm:w-auto items-center justify-center rounded-full bg-[#25D366] p-2.5 sm:px-3 text-white shadow-[0_10px_25px_-8px_rgba(37,211,102,0.7)] transition-all duration-300 hover:pr-5 sm:bottom-[6.5rem] sm:right-8"
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        style={{ width: '24px', height: '24px', maxWidth: '24px', maxHeight: '24px' }}
        aria-hidden
        className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 fill-current"
      >
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.37 9.37 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43m8.03-17.46A11.26 11.26 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.64l6.04-1.58a11.33 11.33 0 0 0 5.4 1.38h.01c6.25 0 11.34-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02" />
      </svg>
      {/* Collapsed to zero width (no gap either) so the button is a perfect
          circle at rest; it grows leftward on hover, being anchored right. */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-[10rem] group-hover:opacity-100">
        Chat with us
      </span>
    </a>
  );
}
