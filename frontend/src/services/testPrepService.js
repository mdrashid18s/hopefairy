/**
 * Test Preparation Service
 * ------------------------------------------------------------------
 * Handles test prep courses (IMAT, GMAT, IELTS, CELPIP, etc.)
 */

import { httpClient } from './httpClient.js';
import { testPrep as staticTestPrep } from '../data/site.js';

export class TestPrepService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Get all test prep courses with fallback.
   */
  async getAll() {
    try {
      const data = await this.client.get('/api/test-prep', false);
      if (data && (data.featured || data.tests)) return data;
    } catch {
      // fallback gracefully
    }
    return staticTestPrep;
  }

  /**
   * Get single test prep course by slug or code.
   */
  async getBySlug(slug) {
    try {
      const data = await this.client.get(`/api/test-prep/${slug}`, false);
      if (data) return data;
    } catch {
      // continue to fallback
    }
    const found = staticTestPrep.tests?.find((t) => t.slug === slug || t.code?.toLowerCase() === slug.toLowerCase());
    return found || null;
  }
}

export const testPrepService = new TestPrepService();
