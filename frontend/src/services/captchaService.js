/**
 * Captcha Service
 * ------------------------------------------------------------------
 * Generates and verifies alphanumeric (letters + numbers) captcha codes
 * for public website forms. Look-alike characters (0/O, 1/I/l) are
 * excluded so codes stay readable.
 */

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';

export class CaptchaService {
  constructor(length = 6) {
    this.length = length;
  }

  pick(chars) {
    return chars[Math.floor(Math.random() * chars.length)];
  }

  /**
   * Create a new code that always mixes letters and numbers.
   */
  generate() {
    const chars = [this.pick(LETTERS), this.pick(DIGITS)];
    while (chars.length < this.length) chars.push(this.pick(LETTERS + DIGITS));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  /**
   * Case-insensitive match of the user's input against the code.
   */
  verify(input, code) {
    return !!code && (input || '').trim().toLowerCase() === code.toLowerCase();
  }
}

export const captchaService = new CaptchaService();
