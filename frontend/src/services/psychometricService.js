/**
 * Psychometric & HopeFairy Compass Service
 * ------------------------------------------------------------------
 * Dedicated Class encapsulating all data operations, business logic,
 * API queries, and consultation links for the Psychometric &
 * HopeFairy Compass section.
 */

import { httpClient } from './httpClient.js';
import { inquiryService } from './inquiryService.js';
import { psychometricSection as staticPsychometric } from '../data/site.js';
import { WHATSAPP_HREF } from '../config/contact.js';

export class PsychometricService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Get complete psychometric section data with live API fetch & graceful fallback.
   * @returns {Promise<Object>}
   */
  async getSectionData() {
    try {
      const res = await this.client.get('/api/psychometric', false);
      if (res && (res.pillars || res.compass)) {
        return res;
      }
    } catch {
      // Fallback gracefully to site constants
    }
    return staticPsychometric;
  }

  /**
   * Get HopeFairy Compass flagship program details.
   * @returns {Promise<Object>}
   */
  async getCompassData() {
    const data = await this.getSectionData();
    return data?.compass || staticPsychometric.compass;
  }

  /**
   * Get 4 core evaluation dimensions / pillars.
   * @returns {Promise<Array>}
   */
  async getPillars() {
    const data = await this.getSectionData();
    return data?.pillars || staticPsychometric.pillars || [];
  }

  /**
   * Get academic stages / target grades.
   * @returns {Promise<Array>}
   */
  async getStages() {
    const data = await this.getSectionData();
    return data?.stages || staticPsychometric.stages || [];
  }

  /**
   * Get trust badges list.
   * @returns {Promise<Array>}
   */
  async getTrustBadges() {
    const data = await this.getSectionData();
    return data?.trustBadges || staticPsychometric.trustBadges || [];
  }

  /**
   * Generate encoded WhatsApp direct consultation URL.
   * @param {string} customMsg
   * @returns {string}
   */
  getWhatsAppConsultationUrl(customMsg = null) {
    const text =
      customMsg ||
      'Hi HopeFairy, I am interested in the HopeFairy Compass one-to-one consultation.';
    return `${WHATSAPP_HREF}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Generate contact page URL with pre-selected interest parameter.
   * @param {string} interest
   * @returns {string}
   */
  getContactConsultationUrl(interest = 'HopeFairy Compass') {
    return `/contact-us?interest=${encodeURIComponent(interest)}`;
  }

  /**
   * Submit one-to-one consultation inquiry to the backend API.
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async submitConsultation(payload) {
    const body = {
      ...payload,
      interest: payload.interest || 'HopeFairy Compass',
      source: payload.source || 'HopeFairy Compass Section',
    };
    return inquiryService.submit(body);
  }
}

// Single instance export following senior architecture
export const psychometricService = new PsychometricService();
