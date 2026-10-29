/**
 * Admin API Service Layer for HopeFairy Admin Portal
 * ------------------------------------------------------------------
 * Modularized with dedicated domain Service classes:
 * - AuthService
 * - DestinationService
 * - OfferingService
 * - InquiryService
 * - CourseService
 * - CountryCourseService
 * - TestimonialService
 * - SiteContentService
 * - UserService
 */

import { authService } from './authService.js';
import { destinationService } from './destinationService.js';
import { offeringService } from './offeringService.js';
import { inquiryService } from './inquiryService.js';
import { courseService } from './courseService.js';
import { countryCourseService } from './countryCourseService.js';
import { testimonialService } from './testimonialService.js';
import { siteContentService } from './siteContentService.js';
import { userService } from './userService.js';

export {
  authService,
  destinationService,
  offeringService,
  inquiryService,
  courseService,
  countryCourseService,
  testimonialService,
  siteContentService,
  userService,
};

// ----------------- Auth & OTP -----------------
export const getAdminToken = () => authService.getToken();
export const setAdminAuth = (token, user) => authService.setAuth(token, user);
export const clearAdminAuth = () => authService.clearAuth();
export const getCachedAdminUser = () => authService.getCachedUser();

export const adminLogin = (email, password) => authService.login(email, password);
export const adminRegister = (email, password) => authService.register(email, password);
export const adminApproveRegistration = (token) => authService.approveRegistration(token);
export const adminLogout = () => authService.logout();
export const getAdminMe = () => authService.getMe();
export const sendForgotOtp = (email) => authService.sendForgotOtp(email);
export const verifyForgotOtp = (email, otp) => authService.verifyForgotOtp(email, otp);
export const resetPasswordWithOtp = (email, otp, pw, conf) => authService.resetPassword(email, otp, pw, conf);

// ----------------- Dashboard & Stats -----------------
export const getAdminStats = () => inquiryService.getStats();

// ----------------- Countries & Destinations -----------------
export const getAdminCountries = (params) => destinationService.getAll(params);
export const createAdminCountry = (payload) => destinationService.create(payload);
export const updateAdminCountry = (id, payload) => destinationService.update(id, payload);
export const toggleAdminCountry = (id) => destinationService.toggle(id);
export const deleteAdminCountry = (id) => destinationService.delete(id);

export const getAdminDestinations = getAdminCountries;
export const createAdminDestination = createAdminCountry;
export const updateAdminDestination = updateAdminCountry;
export const toggleAdminDestination = toggleAdminCountry;
export const deleteAdminDestination = deleteAdminCountry;

// ----------------- Inquiries / Leads CRM -----------------
export const getAdminInquiries = (filters) => inquiryService.getAll(filters);
export const updateAdminInquiryStatus = (id, status) => inquiryService.updateStatus(id, status);
export const toggleAdminInquiry = (id) => inquiryService.toggle(id);
export const deleteAdminInquiry = (id) => inquiryService.delete(id);

// ----------------- Services Offerings -----------------
export const getAdminServices = () => offeringService.getAll();
export const uploadAdminServiceImage = (file) => offeringService.uploadImage(file);
export const createAdminService = (payload) => offeringService.create(payload);
export const updateAdminService = (id, payload) => offeringService.update(id, payload);
export const toggleAdminService = (id) => offeringService.toggle(id);
export const deleteAdminService = (id) => offeringService.delete(id);

// ----------------- Site Settings & FAQs -----------------
export const getAdminSettings = () => siteContentService.getSettings();
export const updateAdminSettings = (settings) => siteContentService.updateSettings(settings);
export const getAdminFaqs = () => siteContentService.getAllFaqs();
export const createAdminFaq = (payload) => siteContentService.createFaq(payload);
export const updateAdminFaq = (id, payload) => siteContentService.updateFaq(id, payload);
export const deleteAdminFaq = (id) => siteContentService.delete(id);

// ----------------- Country Courses -----------------
export const getAdminCountryCourses = (filters) => countryCourseService.getAll(filters);
export const createAdminCountryCourse = (payload) => countryCourseService.create(payload);
export const updateAdminCountryCourse = (id, payload) => countryCourseService.update(id, payload);
export const toggleAdminCountryCourse = (id) => countryCourseService.toggle(id);
export const deleteAdminCountryCourse = (id) => countryCourseService.delete(id);

// ----------------- Admin Users -----------------
export const getAdminUsers = () => userService.getAll();
export const createAdminUser = (payload) => userService.create(payload);
export const toggleAdminUser = (id) => userService.toggle(id);
export const toggleAdminUserRole = (id) => userService.toggleRole(id);
export const deleteAdminUser = (id) => userService.delete(id);
export const decryptAdminUserPassword = (id) => userService.decryptPassword(id);

// ----------------- India Courses & Streams -----------------
export const getAdminCourses = (params) => courseService.getAll(params);
export const createAdminCourse = (payload) => courseService.create(payload);
export const updateAdminCourse = (id, payload) => courseService.update(id, payload);
export const toggleAdminCourse = (id) => courseService.toggle(id);
export const deleteAdminCourse = (id) => courseService.delete(id);
export const getAdminIndiaStreams = () => courseService.getStreams();
export const createAdminIndiaStream = (payload) => courseService.createStream(payload);
export const updateAdminIndiaStream = (id, payload) => courseService.updateStream(id, payload);
export const toggleAdminIndiaStream = (id) => courseService.toggleStream(id);
export const deleteAdminIndiaStream = (id) => courseService.deleteStream(id);

// ----------------- Testimonials -----------------
export const getAdminTestimonials = (params) => testimonialService.getAll(params);
export const createAdminTestimonial = (payload) => testimonialService.create(payload);
export const updateAdminTestimonial = (id, payload) => testimonialService.update(id, payload);
export const toggleAdminTestimonial = (id) => testimonialService.toggle(id);
export const uploadAdminTestimonialAvatar = (file) => testimonialService.uploadAvatar(file);
export const deleteAdminTestimonial = (id) => testimonialService.delete(id);
