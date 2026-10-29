/**
 * Country Course Service
 * ------------------------------------------------------------------
 * Handles course offerings linked directly to study abroad countries.
 */

import { httpClient } from './httpClient.js';

export class CountryCourseService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Get all courses for countries with optional country_id, active, and search filters.
   */
  async getAll(filters = {}) {
    const query = new URLSearchParams();
    if (filters.country_id) query.set('country_id', filters.country_id);
    if (filters.active !== undefined) query.set('active', filters.active);
    if (filters.search) query.set('search', filters.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.client.get(`/api/admin/country-courses${qs}`, true);
  }

  /**
   * Create country course.
   */
  async create(payload) {
    return this.client.post('/api/admin/country-courses', payload, true);
  }

  /**
   * Update country course.
   */
  async update(id, payload) {
    return this.client.put(`/api/admin/country-courses/${id}`, payload, true);
  }

  /**
   * Toggle country course active status.
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/country-courses/${id}/toggle`, null, true);
  }

  /**
   * Delete country course.
   */
  async delete(id) {
    return this.client.delete(`/api/admin/country-courses/${id}`, true);
  }
}

export const countryCourseService = new CountryCourseService();
