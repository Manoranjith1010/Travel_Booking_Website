const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const readToken = () => window.localStorage.getItem('travel-loop-token');

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = readToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

export const api = {
  async bootstrap() {
    return request('/bootstrap');
  },
  async register(formData) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
  async login(formData) {
    const payload = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    window.localStorage.setItem('travel-loop-token', payload.token);
    return payload;
  },
  logout() {
    window.localStorage.removeItem('travel-loop-token');
  },
  async searchTrips(query) {
    return request(`/trips?${new URLSearchParams(query).toString()}`);
  },
  async createBooking(formData) {
    return request('/bookings', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
  async getBookings() {
    return request('/bookings');
  },
  async getAdminSummary() {
    return request('/admin/summary');
  },
  async createPaymentIntent(formData) {
    return request('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
};
