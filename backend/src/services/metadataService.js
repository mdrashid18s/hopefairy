/**
 * Course Metadata Service
 * ------------------------------------------------------------------
 * Handles hierarchical course syllabi structure (Course -> Subject -> Topic -> Subtopic)
 * and PDF study material attachments with dedicated 3NF relational tables.
 */

import { httpClient } from './httpClient.js';

export class MetadataService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * List course metadata with cascading filters (course, subject, topic, subtopic, search, active).
   */
  async getAll(filters = {}) {
    const query = new URLSearchParams();
    if (filters.course_id && filters.course_id !== 'all') query.set('course_id', filters.course_id);
    if (filters.subject_id && filters.subject_id !== 'all') query.set('subject_id', filters.subject_id);
    if (filters.topic_id && filters.topic_id !== 'all') query.set('topic_id', filters.topic_id);
    if (filters.course && filters.course !== 'all') query.set('course', filters.course);
    if (filters.subject && filters.subject !== 'all') query.set('subject', filters.subject);
    if (filters.topic && filters.topic !== 'all') query.set('topic', filters.topic);
    if (filters.subtopic) query.set('subtopic', filters.subtopic);
    if (filters.search) query.set('search', filters.search);
    if (filters.active !== undefined && filters.active !== 'all') {
      query.set('active', filters.active);
    }

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.client.get(`/api/admin/metadata${qs}`, true);
  }

  /**
   * Get distinct hierarchy tree (courses -> subjects -> topics -> subtopics) for cascading filter dropdowns.
   */
  async getHierarchy() {
    return this.client.get('/api/admin/metadata/hierarchy', true);
  }

  /**
   * Create a new course metadata item.
   */
  async create(payload) {
    return this.client.post('/api/admin/metadata', payload, true);
  }

  /**
   * Update an existing course metadata item.
   */
  async update(id, payload) {
    return this.client.put(`/api/admin/metadata/${id}`, payload, true);
  }

  /**
   * Toggle active/inactive status of a metadata entry.
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/metadata/${id}/toggle`, null, true);
  }

  /**
   * Delete a metadata entry and its attached PDF.
   */
  async delete(id) {
    return this.client.delete(`/api/admin/metadata/${id}`, true);
  }

  // ----------------------------------------------------------------
  // Master Subjects (3NF)
  // ----------------------------------------------------------------

  async getSubjects(courseId = null) {
    const qs = courseId && courseId !== 'all' ? `?course_id=${courseId}` : '';
    return this.client.get(`/api/admin/subjects${qs}`, true);
  }

  async createSubject(payload) {
    return this.client.post('/api/admin/subjects', payload, true);
  }

  async updateSubject(id, payload) {
    return this.client.put(`/api/admin/subjects/${id}`, payload, true);
  }

  async deleteSubject(id) {
    return this.client.delete(`/api/admin/subjects/${id}`, true);
  }

  // ----------------------------------------------------------------
  // Master Topics (3NF)
  // ----------------------------------------------------------------

  async getTopics(subjectId = null, courseId = null) {
    const p = new URLSearchParams();
    if (subjectId && subjectId !== 'all') p.set('subject_id', subjectId);
    if (courseId && courseId !== 'all') p.set('course_id', courseId);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return this.client.get(`/api/admin/topics${qs}`, true);
  }

  async createTopic(payload) {
    return this.client.post('/api/admin/topics', payload, true);
  }

  async updateTopic(id, payload) {
    return this.client.put(`/api/admin/topics/${id}`, payload, true);
  }

  async deleteTopic(id) {
    return this.client.delete(`/api/admin/topics/${id}`, true);
  }

  // ----------------------------------------------------------------
  // Master Subtopics (3NF)
  // ----------------------------------------------------------------

  async getSubtopics(topicId = null) {
    const qs = topicId && topicId !== 'all' ? `?topic_id=${topicId}` : '';
    return this.client.get(`/api/admin/subtopics${qs}`, true);
  }

  async createSubtopic(payload) {
    return this.client.post('/api/admin/subtopics', payload, true);
  }

  async updateSubtopic(id, payload) {
    return this.client.put(`/api/admin/subtopics/${id}`, payload, true);
  }

  async deleteSubtopic(id) {
    return this.client.delete(`/api/admin/subtopics/${id}`, true);
  }
}

export const metadataService = new MetadataService();
export default metadataService;
