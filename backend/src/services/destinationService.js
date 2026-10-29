/**
 * Destination & Country Service
 * ------------------------------------------------------------------
 * Handles all study abroad destinations and countries for both
 * public website and admin portal.
 */

import { httpClient } from './httpClient.js';
import { destinations as staticDestinations, destinationsIntro } from '../data/site.js';

export class DestinationService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Get all destinations/countries.
   * If called by public website, falls back gracefully to static config if offline.
   */
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.active !== undefined) query.set('active', params.active);
    if (params.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    try {
      // If admin token is present and call is without strict params, use admin route
      const token = this.client.getToken();
      const endpoint = token ? `/api/admin/countries${qs}` : `/api/destinations${qs}`;
      const data = await this.client.get(endpoint, !!token);

      if (data && Array.isArray(data.items)) return data;
      if (Array.isArray(data)) return { intro: destinationsIntro, items: data };
      return data;
    } catch (err) {
      // If public request fails, return static fallback
      if (!this.client.getToken()) {
        return { intro: destinationsIntro, items: staticDestinations };
      }
      throw err;
    }
  }

  /**
   * Get single destination by slug.
   */
  async getBySlug(slug) {
    try {
      const data = await this.client.get(`/api/destinations/${slug}`);
      if (data && (data.name || data.title)) return data;
    } catch (err) {
      // Fallback to static
      const found = staticDestinations.find((d) => d.slug === slug || d.code?.toLowerCase() === slug.toLowerCase());
      if (found) return found;
      throw err;
    }
    const found = staticDestinations.find((d) => d.slug === slug || d.code?.toLowerCase() === slug.toLowerCase());
    if (found) return found;
    throw new Error('Destination not found');
  }

  /**
   * Create new country/destination (admin).
   */
  async create(payload) {
    return this.client.post('/api/admin/countries', payload, true);
  }

  /**
   * Update country/destination (admin).
   */
  async update(id, payload) {
    return this.client.put(`/api/admin/countries/${id}`, payload, true);
  }

  /**
   * Toggle country active status (admin).
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/countries/${id}/toggle`, null, true);
  }

  /**
   * Delete country (admin).
   */
  async delete(id) {
    return this.client.delete(`/api/admin/countries/${id}`, true);
  }
}

export const destinationService = new DestinationService();
