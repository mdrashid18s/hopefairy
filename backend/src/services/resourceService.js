/**
 * Resource Service
 * ------------------------------------------------------------------
 * Handles Study Material digital products linked to curriculum metadata,
 * including PDF uploads, pricing, dynamic discount calculations, and downloads.
 */

import { httpClient } from './httpClient.js';

export class ResourceService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * List study materials with query filters.
   */
  async getAll(filters = {}) {
    const query = new URLSearchParams();
    if (filters.course_id && filters.course_id !== 'all') query.set('course_id', filters.course_id);
    if (filters.course_metadata_id && filters.course_metadata_id !== 'all') query.set('course_metadata_id', filters.course_metadata_id);
    if (filters.subject && filters.subject !== 'all') query.set('subject', filters.subject);
    if (filters.topic && filters.topic !== 'all') query.set('topic', filters.topic);
    if (filters.material_type && filters.material_type !== 'all') query.set('material_type', filters.material_type);
    if (filters.is_free !== undefined && filters.is_free !== 'all') query.set('is_free', filters.is_free);
    if (filters.is_active !== undefined && filters.is_active !== 'all') query.set('is_active', filters.is_active);
    if (filters.search) query.set('search', filters.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.client.get(`/api/admin/resources${qs}`, true);
  }

  /**
   * Overview KPI statistics.
   */
  async getStats() {
    return this.client.get('/api/admin/resources/stats', true);
  }

  /**
   * Standalone PDF upload.
   */
  async uploadPdf(file) {
    const fd = new FormData();
    fd.append('pdf', file);
    return this.client.post('/api/admin/resources/upload-pdf', fd, true);
  }

  /**
   * Standalone Thumbnail upload.
   */
  async uploadThumbnail(file) {
    const fd = new FormData();
    fd.append('thumbnail', file);
    return this.client.post('/api/admin/resources/upload-thumbnail', fd, true);
  }

  /**
   * Create a new study material product.
   */
  async create(payload) {
    return this.client.post('/api/admin/resources', payload, true);
  }

  /**
   * Update study material product.
   */
  async update(id, payload) {
    return this.client.post(`/api/admin/resources/${id}`, payload, true);
  }

  /**
   * Row-level toggle active/inactive status.
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/resources/${id}/toggle`, null, true);
  }

  /**
   * Row-level toggle featured status.
   */
  async toggleFeatured(id) {
    return this.client.patch(`/api/admin/resources/${id}/featured`, null, true);
  }

  /**
   * Delete study material product.
   */
  async delete(id) {
    return this.client.delete(`/api/admin/resources/${id}`, true);
  }
}

export const resourceService = new ResourceService();
export default resourceService;
