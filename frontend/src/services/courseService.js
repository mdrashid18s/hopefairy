/**
 * Course & India Admissions Service
 * ------------------------------------------------------------------
 * Handles India admissions streams, entrance exams, and courses
 * for both public website and admin portal.
 */

import { httpClient } from './httpClient.js';
import { indiaAdmissions as staticIndiaAdmissions } from '../data/site.js';

export class CourseService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * List courses for admin with level and stream filters.
   */
  async getAll(params = {}) {
    const query = new URLSearchParams();
    if (params.level) query.append('level', params.level);
    if (params.stream_id) query.append('stream_id', params.stream_id);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return this.client.get(`/api/admin/courses${qs}`, true);
  }

  /**
   * Create course (admin).
   */
  async create(payload) {
    return this.client.post('/api/admin/courses', payload, true);
  }

  /**
   * Update course (admin).
   */
  async update(id, payload) {
    return this.client.put(`/api/admin/courses/${id}`, payload, true);
  }

  /**
   * Toggle course active status (admin).
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/courses/${id}/toggle`, null, true);
  }

  /**
   * Delete course (admin).
   */
  async delete(id) {
    return this.client.delete(`/api/admin/courses/${id}`, true);
  }

  /**
   * Get all streams / categories.
   * If called publicly without auth, hits /api/india-admissions with fallback.
   */
  async getStreams() {
    const token = this.client.getToken();
    if (token) {
      return this.client.get('/api/admin/india-admissions/streams', true);
    }

    try {
      const data = await this.client.get('/api/india-admissions', false);
      const streams = data?.streams || data?.data?.streams || (Array.isArray(data?.data) ? data.data : null);
      if (streams && streams.length > 0) {
        return { ...staticIndiaAdmissions, streams };
      }
    } catch (err) {
      // fallback to static
    }
    return staticIndiaAdmissions;
  }

  /**
   * Create stream / category (admin).
   */
  async createStream(payload) {
    return this.client.post('/api/admin/india-admissions/streams', payload, true);
  }

  /**
   * Update stream / category (admin).
   */
  async updateStream(id, payload) {
    return this.client.put(`/api/admin/india-admissions/streams/${id}`, payload, true);
  }

  /**
   * Toggle stream active status (admin).
   */
  async toggleStream(id) {
    return this.client.patch(`/api/admin/india-admissions/streams/${id}/toggle`, null, true);
  }

  /**
   * Delete stream (admin).
   */
  async deleteStream(id) {
    return this.client.delete(`/api/admin/india-admissions/streams/${id}`, true);
  }
}

export const courseService = new CourseService();
