/**
 * Site Content & Settings Service
 * ------------------------------------------------------------------
 * Handles global branding, FAQs, and site configuration for both
 * public website and admin portal.
 */

import { httpClient } from './httpClient.js';
import {
  site as staticSite,
  faqs as staticFaqs,
  about,
  cta,
  contactPage,
} from '../data/site.js';

export class SiteContentService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Get public site configuration with graceful fallback to static data.
   */
  async getSite() {
    try {
      const data = await this.client.get('/api/site', false);
      if (data) return { ...staticSite, ...data, about, cta, contactPage };
    } catch {
      // fallback gracefully to static site config
    }
    return { ...staticSite, about, cta, contactPage };
  }

  /**
   * Get active FAQs for public site with fallback to static FAQs.
   */
  async getFaqs() {
    try {
      const data = await this.client.get('/api/faqs', false);
      const items = data?.items || data?.data || data;
      if (Array.isArray(items) && items.length > 0) return items;
    } catch {
      // fallback gracefully
    }
    return staticFaqs;
  }

  /**
   * Get all FAQs for admin management.
   */
  async getAllFaqs() {
    return this.client.get('/api/admin/faqs', true);
  }

  /**
   * Create FAQ (admin).
   */
  async createFaq(payload) {
    return this.client.post('/api/admin/faqs', payload, true);
  }

  /**
   * Update FAQ (admin).
   */
  async updateFaq(id, payload) {
    return this.client.put(`/api/admin/faqs/${id}`, payload, true);
  }

  /**
   * Delete FAQ (admin).
   */
  async deleteFaq(id) {
    return this.client.delete(`/api/admin/faqs/${id}`, true);
  }

  /**
   * Get all site settings dictionary (admin).
   */
  async getSettings() {
    return this.client.get('/api/admin/settings', true);
  }

  /**
   * Update site settings dictionary (admin).
   */
  async updateSettings(settings) {
    return this.client.put('/api/admin/settings', { settings }, true);
  }
}

export const siteContentService = new SiteContentService();
