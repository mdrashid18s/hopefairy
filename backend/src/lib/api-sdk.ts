/**
 * Enterprise NGO Platform — Shared API Client & OOP Service Layer
 * 50-Year Senior Architecture Standard:
 * - Single parameterized execution functions for maximum code reusability across Frontend & Backend
 * - Class-based encapsulation for each business section
 * - Robust error handling, typed request/response contracts, and token abstraction
 */

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  dev_otp?: string;
  errors?: Record<string, string | string[]>;
  pagination?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  meta?: any;
}

export interface EnquiryItem {
  id: number;
  type: 'general' | 'volunteer' | 'partner' | 'csr';
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'archived';
  admin_notes: string | null;
  ip_address: string | null;
  consent_given: boolean;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  resolver?: { id: number; name: string; email: string } | null;
}

export interface DonationItem {
  id: number;
  reference: string;
  amount: number | string;
  currency: string;
  designation: 'general' | 'education' | 'health' | 'livelihoods' | 'environment';
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  wants_80g: boolean;
  pan_masked: string | null;
  donor_address: string | null;
  is_indian_citizen: boolean;
  consent_updates: boolean;
  payment_status: 'pledged' | 'pending' | 'verified' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string | null;
  receipt_number: string | null;
  verified_by: number | null;
  verified_at: string | null;
  admin_notes: string | null;
  created_at: string;
  verifier?: { id: number; name: string; email: string } | null;
}

export interface DonationTotals {
  verified_amount: number;
  pledged_amount: number;
  total_amount: number;
  total_80g_amount: number;
  total_count: number;
  verified_count: number;
  pledged_count: number;
}

export interface DashboardStats {
  verified_amount: number;
  pledged_amount: number;
  total_donations: number;
  total_enquiries: number;
  new_enquiries: number;
  resolved_enquiries: number;
  active_programmes: number;
  districts_covered: number;
}

// ============================================================================
// CORE HTTP CLIENT CLASS
// ============================================================================
export class ApiClient {
  private baseUrl: string;
  private tokenProvider: () => string | null;

  constructor(options?: { baseUrl?: string; tokenProvider?: () => string | null }) {
    this.baseUrl = options?.baseUrl || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1');
    this.tokenProvider = options?.tokenProvider || (() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('ngo_admin_token');
      }
      return null;
    });
  }

  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.tokenProvider();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
          errors: data.errors,
          data: data,
        };
      }

      return data as ApiResponse<T>;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network connection error. Please verify the API server is active.',
      };
    }
  }
}

// ============================================================================
// SECTION 1: ENQUIRY SERVICE CLASS (Unified Parameterized Method)
// ============================================================================
export class EnquiryService {
  constructor(private client: ApiClient) {}

  /**
   * Unified Enquiry Function: Handles all operations (public submit & admin list/manage)
   * simply by altering the input parameters.
   */
  public async handle(params: {
    action: 'submit' | 'list' | 'get' | 'update_status';
    payload?: {
      type: string;
      name: string;
      email: string;
      phone?: string;
      message: string;
      consent?: boolean;
      website?: string;
    };
    filters?: {
      status?: string;
      type?: string;
      search?: string;
      page?: number;
      per_page?: number;
    };
    id?: number;
    statusUpdate?: {
      status: string;
      admin_notes?: string;
    };
  }): Promise<ApiResponse> {
    switch (params.action) {
      case 'submit':
        return this.client.request('/enquiries', {
          method: 'POST',
          body: JSON.stringify(params.payload),
        });

      case 'list': {
        const query = new URLSearchParams();
        if (params.filters?.status) query.set('status', params.filters.status);
        if (params.filters?.type) query.set('type', params.filters.type);
        if (params.filters?.search) query.set('search', params.filters.search);
        if (params.filters?.page) query.set('page', String(params.filters.page));
        if (params.filters?.per_page) query.set('per_page', String(params.filters.per_page));

        return this.client.request(`/enquiries?${query.toString()}`, {
          method: 'GET',
        });
      }

      case 'get':
        return this.client.request(`/enquiries/${params.id}`, {
          method: 'GET',
        });

      case 'update_status':
        return this.client.request(`/enquiries/${params.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify(params.statusUpdate),
        });

      default:
        throw new Error(`Unsupported action: ${(params as any).action}`);
    }
  }
}

// ============================================================================
// SECTION 2: DONATION SERVICE CLASS (Unified Parameterized Method)
// ============================================================================
export class DonationService {
  constructor(private client: ApiClient) {}

  /**
   * Unified Donation Function: Handles pledges, ledger listing, totals, and verification
   * through a single parameterized signature.
   */
  public async handle(params: {
    action: 'pledge' | 'list' | 'totals' | 'verify' | 'razorpay_order' | 'razorpay_verify';
    payload?: {
      reference?: string;
      amount: number;
      designation: string;
      name: string;
      email: string;
      phone: string;
      wants80G?: boolean;
      pan?: string;
      address?: string;
      isIndianCitizen: boolean;
      consentUpdates?: boolean;
      website?: string;
    };
    filters?: {
      status?: string;
      designation?: string;
      search?: string;
      page?: number;
      per_page?: number;
    };
    id?: number;
    verifyData?: {
      transaction_id?: string;
      admin_notes?: string;
    };
    razorpayData?: {
      reference: string;
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    };
  }): Promise<ApiResponse> {
    switch (params.action) {
      case 'pledge':
        return this.client.request('/donations', {
          method: 'POST',
          body: JSON.stringify(params.payload),
        });

      case 'razorpay_order':
        return this.client.request('/donations/razorpay-order', {
          method: 'POST',
          body: JSON.stringify(params.payload),
        });

      case 'razorpay_verify':
        return this.client.request('/donations/razorpay-verify', {
          method: 'POST',
          body: JSON.stringify(params.razorpayData),
        });

      case 'list': {
        const query = new URLSearchParams();
        if (params.filters?.status) query.set('status', params.filters.status);
        if (params.filters?.designation) query.set('designation', params.filters.designation);
        if (params.filters?.search) query.set('search', params.filters.search);
        if (params.filters?.page) query.set('page', String(params.filters.page));
        if (params.filters?.per_page) query.set('per_page', String(params.filters.per_page));

        return this.client.request(`/donations?${query.toString()}`, {
          method: 'GET',
        });
      }

      case 'totals':
        return this.client.request('/donations/totals', {
          method: 'GET',
        });

      case 'verify':
        return this.client.request(`/donations/${params.id}/verify`, {
          method: 'PATCH',
          body: JSON.stringify(params.verifyData),
        });

      default:
        throw new Error(`Unsupported action: ${(params as any).action}`);
    }
  }
}

// ============================================================================
// SECTION 3: AUTHENTICATION SERVICE CLASS
// ============================================================================
export class AuthService {
  constructor(private client: ApiClient) {}

  public async handle(params: {
    action: 'login' | 'logout' | 'me' | 'forgot_password' | 'reset_password';
    credentials?: { email: string; password: string };
    forgotEmail?: string;
    resetPayload?: { email: string; otp: string; password: string };
  }): Promise<ApiResponse> {
    switch (params.action) {
      case 'login':
        return this.client.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify(params.credentials),
        });

      case 'logout':
        return this.client.request('/auth/logout', {
          method: 'POST',
        });

      case 'me':
        return this.client.request('/auth/me', {
          method: 'GET',
        });

      case 'forgot_password':
        return this.client.request('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: params.forgotEmail }),
        });

      case 'reset_password':
        return this.client.request('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(params.resetPayload),
        });

      default:
        throw new Error(`Unsupported action: ${(params as any).action}`);
    }
  }
}

// ============================================================================
// SECTION 4: DASHBOARD SERVICE CLASS
// ============================================================================
export class DashboardService {
  constructor(private client: ApiClient) {}

  public async handle(params: { action: 'overview' }): Promise<ApiResponse> {
    switch (params.action) {
      case 'overview':
        return this.client.request('/dashboard/overview', {
          method: 'GET',
        });

      default:
        throw new Error(`Unsupported action: ${(params as any).action}`);
    }
  }
}

// ============================================================================
// UNIFIED NGO PLATFORM SERVICE (Single Entry Point for Frontend and Backend)
// ============================================================================
export class NgoPlatform {
  public client: ApiClient;
  public enquiries: EnquiryService;
  public donations: DonationService;
  public auth: AuthService;
  public dashboard: DashboardService;

  constructor(options?: { baseUrl?: string; tokenProvider?: () => string | null }) {
    this.client = new ApiClient(options);
    this.enquiries = new EnquiryService(this.client);
    this.donations = new DonationService(this.client);
    this.auth = new AuthService(this.client);
    this.dashboard = new DashboardService(this.client);
  }
}

// Singleton instances for universal consumption
export const ngoApi = new NgoPlatform();
