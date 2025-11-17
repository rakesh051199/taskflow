/**
 * API Client for backend integration
 * Handles all HTTP requests, authentication, and error handling
 */

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  localStorage.getItem('taskflow_api_base') || 
  'http://localhost:3001';

function getBaseUrl(): string {
  return localStorage.getItem('taskflow_api_base') || DEFAULT_BASE_URL;
}

function getAuthHeaders(): HeadersInit {
  const token = sessionStorage.getItem('taskflow_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('taskflow_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${getBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = await response.json();
    const newToken = data.data?.token || data.token;

    if (newToken) {
      sessionStorage.setItem('taskflow_token', newToken);
      return newToken;
    }
    throw new Error('No token in refresh response');
  } catch (error) {
    sessionStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_refresh_token');
    sessionStorage.removeItem('taskflow_user');
    throw error;
  }
}

/**
 * Base request function with authentication and error handling
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    let token = sessionStorage.getItem('taskflow_token');

    // Check if token is expired and refresh if needed
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '#/login';
        }
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }

    const res = await fetch(`${getBaseUrl()}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let message = `Request failed: ${res.status}`;
      try {
        const data = await res.json();
        if (data?.message) message = data.message;
        if (data?.error) {
          message = typeof data.error === 'string' 
            ? data.error 
            : data.error?.message || message;
        }
      } catch {
        // ignore JSON parse errors
      }

      // Handle 401 - try to refresh token
      if (res.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          // Retry the original request with new token
          const retryRes = await fetch(`${getBaseUrl()}${path}`, {
            ...options,
            headers: {
              ...getAuthHeaders(),
              ...(options.headers || {}),
            },
          });

          if (!retryRes.ok) {
            sessionStorage.removeItem('taskflow_token');
            localStorage.removeItem('taskflow_refresh_token');
            sessionStorage.removeItem('taskflow_user');
            if (typeof window !== 'undefined') {
              window.location.href = '#/login';
            }
            throw new ApiError('Session expired. Please login again.', 401);
          }

          return retryRes.status === 204 ? null as T : await retryRes.json();
        } catch (refreshError) {
          sessionStorage.removeItem('taskflow_token');
          localStorage.removeItem('taskflow_refresh_token');
          sessionStorage.removeItem('taskflow_user');
          if (typeof window !== 'undefined') {
            window.location.href = '#/login';
          }
          throw new ApiError('Session expired. Please login again.', 401);
        }
      }

      throw new ApiError(message, res.status);
    }

    if (res.status === 204) return null as T;
    return res.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * API Client Methods
 */
export const api = {
  // Auth methods
  async signup(body: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    return request<{
      data?: { user: any; token: string; refreshToken: string };
      user?: any;
      token?: string;
      refreshToken?: string;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async login(email: string, password: string) {
    return request<{
      data?: { user: any; token: string; refreshToken: string };
      user?: any;
      token?: string;
      refreshToken?: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return request('/api/auth/logout', { method: 'POST' });
  },

  async getCurrentUser() {
    return request<{ data?: { user: any }; user?: any }>('/api/auth/me');
  },

  async refreshToken(refreshToken: string) {
    return request<{
      data?: { token: string };
      token?: string;
    }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  // Task methods (require projectId)
  async listTasks(projectId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    assignedTo?: string;
    overdue?: boolean;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== '')
        .reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
    ).toString();

    return request<{
      data?: any[];
      items?: any[];
      meta?: { pagination: any };
      pagination?: any;
    }>(`/api/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`);
  },

  async getTask(projectId: string, taskId: string) {
    return request<{ data?: any }>(`/api/projects/${projectId}/tasks/${taskId}`);
  },

  async createTask(projectId: string, body: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    assignedTo?: string;
  }) {
    return request<{ data?: any }>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateTask(projectId: string, taskId: string, body: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    assignedTo?: string;
  }) {
    return request<{ data?: any }>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async deleteTask(projectId: string, taskId: string) {
    return request(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Dashboard methods
  async getDashboardStats(projectId: string) {
    return request<{ data?: any }>(`/api/projects/${projectId}/dashboard`);
  },

  async getStatusOverTime(projectId: string, dateRange: string = '30days') {
    return request<{ data?: any[] }>(
      `/api/projects/${projectId}/dashboard/status-over-time?dateRange=${dateRange}`
    );
  },
};

/**
 * Set API base URL
 */
export function setApiBaseUrl(url: string): void {
  localStorage.setItem('taskflow_api_base', url);
}

/**
 * Get current API base URL
 */
export function getApiBaseUrl(): string {
  return getBaseUrl();
}

