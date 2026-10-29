/**
 * Testimonial Service
 * ------------------------------------------------------------------
 * Handles student and alumni reviews and testimonials for both
 * public website and admin portal.
 */

import { httpClient } from './httpClient.js';

export class TestimonialService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * Get active testimonials for public site.
   */
  async getPublic() {
    try {
      const data = await this.client.get('/api/testimonials', false);
      return Array.isArray(data) ? data : (data?.items || []);
    } catch {
      return [];
    }
  }

  /**
   * List all testimonials for admin with rating & search filters.
   */
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.rating) query.append('rating', params.rating);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.client.get(`/api/admin/testimonials${qs}`, true);
  }

  /**
   * Create testimonial (admin).
   */
  async create(payload) {
    return this.client.post('/api/admin/testimonials', payload, true);
  }

  /**
   * Update testimonial (admin).
   */
  async update(id, payload) {
    return this.client.put(`/api/admin/testimonials/${id}`, payload, true);
  }

  /**
   * Toggle testimonial active status (admin).
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/testimonials/${id}/toggle`, null, true);
  }

  /**
   * Upload avatar image for testimonial (admin).
   */
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.client.request('/api/admin/testimonials/upload-avatar', {
      method: 'POST',
      body: formData,
      isAuth: true,
    });
  }

  /**
   * Delete testimonial (admin).
   */
  async delete(id) {
    return this.client.delete(`/api/admin/testimonials/${id}`, true);
  }
}

export const testimonialService = new TestimonialService();
