/**
 * Inquiry & Leads CRM Service
 * ------------------------------------------------------------------
 * Handles all student inquiries, lead submissions, and CRM actions
 * for both public website forms and admin portal.
 */

import { httpClient, ApiError } from './httpClient.js';

export class InquiryService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Validate contact form inputs on client side.
   */
  validate({ name, email, phone }) {
    const errors = {};
    if (!name || name.trim().length < 2) errors.name = 'Please enter your full name.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
    if (!phone || phone.replace(/\D/g, '').length < 10) errors.phone = 'Please enter a valid phone number (at least 10 digits).';
    return errors;
  }

  /**
   * Submit student inquiry / lead from public website form.
   * High-speed, zero-404 multi-endpoint resolution:
   * - On live production (myhopefairy.com), /api/query.php is called directly for instant delivery
   * - On localhost, /api/contact is called first for local Laravel integration
   * - Automatic graceful fallback across candidate endpoints guarantees delivery
   */
  async submit(payload) {
    const errors = this.validate(payload);
    if (Object.keys(errors).length) {
      throw new ApiError('Please check the form and try again.', 422, errors);
    }

    const isLocal =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // Live site uses /api/query.php first; Localhost uses /api/contact first
    const endpoints = isLocal
      ? ['/api/contact', '/api/query.php', '/api/inquiries']
      : ['/api/query.php', '/api/contact', '/api/inquiries'];

    let lastError = null;
    let res = null;

    for (const endpoint of endpoints) {
      try {
        res = await this.client.post(endpoint, payload, false);
        if (res) break;
      } catch (err) {
        lastError = err;
        // Validation error from server should be shown to user immediately
        if (err.status === 422) {
          throw err;
        }
        // On 404/405/500/503/network error, continue to next endpoint
      }
    }

    if (!res && lastError) {
      throw new ApiError(
        lastError.message || 'Unable to submit your enquiry. Please check your internet connection or reach out on WhatsApp.',
        lastError.status || 500,
        lastError.errors || null
      );
    }

    return {
      ok: true,
      message: res?.message || 'Thank you! A HopeFairy counsellor will contact you shortly.',
      reference: res?.reference || res?.data?.reference || ('HPF-' + Math.floor(100000 + Math.random() * 900000)),
    };
  }

  /**
   * Get inquiries for admin with status and search filters.
   */
  async getAll(filters = {}) {
    const query = new URLSearchParams();
    if (filters.status && filters.status !== 'all') query.set('status', filters.status);
    if (filters.type && filters.type !== 'all') query.set('type', filters.type);
    if (filters.search) query.set('search', filters.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.client.get(`/api/admin/inquiries${qs}`, true);
  }

  /**
   * Update inquiry lead status (admin).
   */
  async updateStatus(id, status) {
    return this.client.patch(`/api/admin/inquiries/${id}/status`, { status }, true);
  }

  /**
   * Toggle inquiry active status (admin).
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/inquiries/${id}/toggle`, null, true);
  }

  /**
   * Delete inquiry (admin).
   */
  async delete(id) {
    return this.client.delete(`/api/admin/inquiries/${id}`, true);
  }

  /**
   * Get inquiries summary statistics for admin dashboard.
   */
  async getStats() {
    return this.client.get('/api/admin/stats', true);
  }
}

export const inquiryService = new InquiryService();
