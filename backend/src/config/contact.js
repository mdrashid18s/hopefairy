/**
 * HopeFairy — Master Contact, Business Profile & Communication Configuration
 * =========================================================================
 * SINGLE SOURCE OF TRUTH (SSOT) FOR ALL CONTACT & PROFILE DETAILS:
 * Agar aapko phone number, email, WhatsApp, address, timing ya social links
 * change karna ho, toh sirf IS EK FILE me change karein.
 * 
 * Ye values automatically pure project me update ho jayengi:
 * - Header / Navbar (Call button, Helpdesk popup, Mobile menu)
 * - Footer (Phone, Email, Address, Timing, Social links)
 * - Floating WhatsApp Button & WhatsApp chat links
 * - Contact Page (/contact-us) & Quick Inquiry Forms
 * - FAQ Sidebar & Query Sections
 * - SEO Metadata & Schema.org Organization Rich Snippets
 */

// ============================================================================
// 1. PRIMARY CONTACT PHONE & CALLING (Change number here)
// ============================================================================
export const CONTACT_PHONE = {
  countryCode: '91',
  mobileNumber: '98116 09755', // Space ke sath format (e.g. '98116 09755')
  supportNumber: '98116 09755',
  
  get digits() {
    return `${this.countryCode}${this.mobileNumber.replace(/\D/g, '')}`;
  },
  get display() {
    return `+${this.countryCode} ${this.mobileNumber}`;
  },
  get href() {
    return `tel:+${this.digits}`;
  },
  get schema() {
    return this.display.replace(/\s+/g, '-');
  },
};

// ============================================================================
// 2. WHATSAPP CHAT CONFIGURATION (Change WhatsApp details here)
// ============================================================================
export const CONTACT_WHATSAPP = {
  countryCode: '91',
  number: '98116 09755',
  defaultMessage: 'Hi HopeFairy, I want to inquire about study abroad admissions and career counselling.',
  
  get digits() {
    return `${this.countryCode}${this.number.replace(/\D/g, '')}`;
  },
  get display() {
    return `+${this.countryCode} ${this.number}`;
  },
  get href() {
    return `https://wa.me/${this.digits}?text=${encodeURIComponent(this.defaultMessage)}`;
  },
  get cleanHref() {
    return `https://wa.me/${this.digits}`;
  },
};

// ============================================================================
// 3. EMAIL ADDRESSES (Change emails here)
// ============================================================================
export const CONTACT_EMAIL = {
  primary: 'info@hopefairy.com',
  admissions: 'info@hopefairy.com',
  support: 'info@hopefairy.com',
  
  get href() {
    return `mailto:${this.primary}`;
  },
};

// ============================================================================
// 4. PHYSICAL OFFICE ADDRESS & LOCATIONS (Change address here)
// ============================================================================
export const CONTACT_ADDRESS = {
  companyName: 'HopeFairy',
  legalName: 'HopeFairy Overseas Education & Career Counselling',
  
  // Display location for footer and headers
  location: 'India',
  displayLocation: 'India (HQ) · New Delhi · Dubai (GCC Desk)',
  
  // Detailed Headquarters Address
  headquarters: {
    building: 'HopeFairy Advisory Centre',
    street: 'Corporate Tower, Business Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400051',
    country: 'India',
    countryCode: 'IN',
    fullAddress: 'HopeFairy Advisory Centre, Business Park, Mumbai, Maharashtra 400051, India',
    googleMapsUrl: 'https://maps.google.com/?q=HopeFairy+Mumbai',
  },

  // Gulf / GCC Desk (Dubai)
  gulfDesk: {
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    fullAddress: 'Business Bay, Downtown Dubai, United Arab Emirates',
    description: 'Dedicated helpline for Gulf NRI students applying for DASA, CIWG & Global Universities',
  },
};

// ============================================================================
// 5. WORKING & OFFICE HOURS (Change operating timings here)
// ============================================================================
export const CONTACT_HOURS = {
  display: 'Mon – Sat · 10:00 AM – 7:00 PM IST',
  days: 'Monday – Saturday',
  timing: '10:00 AM – 7:00 PM IST',
  sunday: 'Closed (Available 24/7 on WhatsApp for urgent queries)',
};

// ============================================================================
// 6. SOCIAL MEDIA PROFILES (Change social links here)
// ============================================================================
export const CONTACT_SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/hopefairy', icon: 'instagram' },
  { label: 'Facebook', href: 'https://facebook.com/hopefairy', icon: 'facebook' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/hopefairy', icon: 'linkedin' },
  { label: 'YouTube', href: 'https://youtube.com/@hopefairy', icon: 'youtube' },
];

// ============================================================================
// 7. BRAND & CREDITS
// ============================================================================
export const BRAND_CONFIG = {
  name: 'HopeFairy',
  tagline: 'Where Dreams Meet Destinations',
  designedBy: 'Areez Software',
  designedByUrl: 'https://areezsoftware.com/',
};

// ============================================================================
// BACKWARD-COMPATIBLE EXPORTS (Pure project me seamless compatibility ke liye)
// ============================================================================
export const PHONE_DISPLAY = CONTACT_PHONE.display;
export const PHONE_HREF = CONTACT_PHONE.href;
export const PHONE_SCHEMA = CONTACT_PHONE.schema;
export const WHATSAPP_HREF = CONTACT_WHATSAPP.cleanHref;
export const PRIMARY_EMAIL = CONTACT_EMAIL.primary;
export const EMAIL_HREF = CONTACT_EMAIL.href;
export const OFFICE_LOCATION = CONTACT_ADDRESS.displayLocation;
export const OFFICE_HOURS = CONTACT_HOURS.display;
