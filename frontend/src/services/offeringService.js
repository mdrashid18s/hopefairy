/**
 * Offering / Service Service
 * ------------------------------------------------------------------
 * Handles all study abroad service offerings for both
 * public website and admin portal.
 */

import { httpClient } from './httpClient.js';
import { services as staticServices, servicesIntro } from '../data/site.js';

export class OfferingService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Get all services.
   * Falls back gracefully to static configuration if backend is offline for public users.
   */
  async getAll() {
    try {
      const token = this.client.getToken();
      const endpoint = token ? '/api/admin/services' : '/api/services';
      const data = await this.client.get(endpoint, !!token);

      if (data && Array.isArray(data.items)) return data;
      if (Array.isArray(data)) {
        return {
          intro: servicesIntro,
          items: data,
        };
      }
      return data;
    } catch (err) {
      if (!this.client.getToken()) {
        return {
          intro: servicesIntro,
          items: staticServices.map(({ slug, title, short, icon }) => ({ slug, title, short, icon })),
        };
      }
      throw err;
    }
  }

  /**
   * Get single service by slug.
   */
  async getBySlug(slug) {
    try {
      const data = await this.client.get(`/api/services/${slug}`);
      if (data && data.title) return data;
    } catch (err) {
      // continue to static fallback
    }
    const found = staticServices.find((s) => s.slug === slug);
    if (!found) {
      throw new Error('Service not found');
    }
    return found;
  }

  /**
   * Upload image for service (admin).
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return this.client.request('/api/admin/services/upload-image', {
      method: 'POST',
      body: formData,
      isAuth: true,
    });
  }

  /**
   * Create new service (admin).
   */
  async create(payload) {
    return this.client.request('/api/admin/services', {
      method: 'POST',
      body: payload,
      isAuth: true,
    });
  }

  /**
   * Update service (admin). Supports JSON and FormData.
   */
  async update(id, payload) {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    return this.client.request(`/api/admin/services/${id}`, {
      method: isFormData ? 'POST' : 'PUT',
      body: payload,
      isAuth: true,
    });
  }

  /**
   * Toggle service active status (admin).
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/services/${id}/toggle`, null, true);
  }

  /**
   * Delete service (admin).
   */
  async delete(id) {
    return this.client.delete(`/api/admin/services/${id}`, true);
  }
}

export const offeringService = new OfferingService();
