/**
 * API Service Layer for HopeFairy
 * ------------------------------------------------------------------
 * Modularized with dedicated domain Service classes:
 * - DestinationService
 * - OfferingService
 * - InquiryService
 * - CourseService
 * - TestPrepService
 * - SiteContentService
 */

import { ApiError } from './httpClient.js';
import { destinationService } from './destinationService.js';
import { offeringService } from './offeringService.js';
import { inquiryService } from './inquiryService.js';
import { courseService } from './courseService.js';
import { testPrepService } from './testPrepService.js';
import { siteContentService } from './siteContentService.js';

export { ApiError };
export { destinationService } from './destinationService.js';
export { offeringService } from './offeringService.js';
export { inquiryService } from './inquiryService.js';
export { courseService } from './courseService.js';
export { testPrepService } from './testPrepService.js';
export { siteContentService } from './siteContentService.js';

// Unified functional facades delegating to class instances
export const getSite = () => siteContentService.getSite();
export const getFaqs = () => siteContentService.getFaqs();
export const getDestinations = (params) => destinationService.getAll(params);
export const getServices = () => offeringService.getAll();
export const getService = (slug) => offeringService.getBySlug(slug);
export const getIndiaAdmissions = () => courseService.getStreams();
export const getTestPrep = () => testPrepService.getAll();
export const submitContact = (payload) => inquiryService.submit(payload);
export const validateContact = (payload) => inquiryService.validate(payload);
