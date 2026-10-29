/**
 * Authentication & Authorization Service
 * ------------------------------------------------------------------
 * Handles token-based admin authentication (Laravel Sanctum),
 * session tokens, and OTP-based password recovery.
 */

import { httpClient } from './httpClient.js';

export class AuthService {
  constructor(client = httpClient) {
    this.client = client;
  }

  getToken() {
    return this.client.getToken();
  }

  setAuth(token, user) {
    return this.client.setAuth(token, user);
  }

  clearAuth() {
    return this.client.clearAuth();
  }

  getCachedUser() {
    return this.client.getCachedUser();
  }

  /**
   * Admin Login with email and password.
   */
  async login(email, password) {
    const result = await this.client.post('/api/admin/login', { email, password }, false);
    if (result.token) {
      this.setAuth(result.token, result.user);
    }
    return result;
  }

  /**
   * Request new admin account registration.
   */
  async register(email, password) {
    return this.client.post('/api/admin/register', { email, password }, false);
  }

  /**
   * One-click email approval for new admin registration.
   */
  async approveRegistration(token) {
    return this.client.post('/api/admin/approve-registration', { token }, false);
  }

  /**
   * Admin logout and session token purge.
   */
  async logout() {
    try {
      await this.client.post('/api/admin/logout', null, true);
    } catch {
      // ignore network errors on logout
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Get authenticated admin user profile.
   */
  async getMe() {
    return this.client.get('/api/admin/me', true);
  }

  /**
   * Send 6-digit OTP code to admin email.
   */
  async sendForgotOtp(email) {
    return this.client.post('/api/admin/forgot-password', { email }, false);
  }

  /**
   * Verify entered OTP code.
   */
  async verifyForgotOtp(email, otp) {
    return this.client.post('/api/admin/verify-otp', { email, otp }, false);
  }

  /**
   * Reset password using verified OTP.
   */
  async resetPassword(email, otp, password, passwordConfirmation) {
    return this.client.post('/api/admin/reset-password', {
      email,
      otp,
      password,
      password_confirmation: passwordConfirmation,
    }, false);
  }
}

export const authService = new AuthService();
