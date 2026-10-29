/**
 * User & Account Administration Service
 * ------------------------------------------------------------------
 * Handles administrator and staff user accounts, role toggling,
 * account status, and password management.
 */

import { httpClient } from './httpClient.js';

export class UserService {
  constructor(client = httpClient) {
    this.client = client;
  }

  /**
   * List all admin/staff user accounts.
   */
  async getAll() {
    return this.client.get('/api/admin/users', true);
  }

  /**
   * Create new admin/staff user.
   */
  async create(payload) {
    return this.client.post('/api/admin/users', payload, true);
  }

  /**
   * Toggle user active/inactive status.
   */
  async toggle(id) {
    return this.client.patch(`/api/admin/users/${id}/toggle`, null, true);
  }

  /**
   * Toggle user role between admin and standard user.
   */
  async toggleRole(id) {
    return this.client.patch(`/api/admin/users/${id}/role`, null, true);
  }

  /**
   * Delete user account.
   */
  async delete(id) {
    return this.client.delete(`/api/admin/users/${id}`, true);
  }

  /**
   * Reveal encrypted password for authorized administrator.
   */
  async decryptPassword(id) {
    return this.client.get(`/api/admin/users/${id}/decrypt-password`, true);
  }

  /**
   * Directly update a user's password (Super Admin privilege).
   */
  async updatePassword(id, password) {
    return this.client.put(`/api/admin/users/${id}/password`, { password }, true);
  }

  /**
   * Generate unique password reset link for user.
   */
  async generateResetLink(id) {
    return this.client.post(`/api/admin/users/${id}/reset-link`, null, true);
  }
}

export const userService = new UserService();
