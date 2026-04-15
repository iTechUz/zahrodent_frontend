import type {
  Patient,
  Doctor,
  Booking,
  Visit,
  Payment,
  Service,
  Notification,
} from '@/shared/types';
import type { SessionUser } from '@/shared/types/auth';
import { apiRequest } from './client';

export async function loginRequest(body: { email: string; password: string }) {
  return apiRequest<{ access_token: string; user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

function qs(params: Record<string, string | number | undefined>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const patientsApi = {
  list: (params?: ListParams & { source?: string }) =>
    apiRequest<PaginatedResponse<Patient>>(`/patients${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Patient>(`/patients/${id}`),
  create: (body: Partial<Patient> & Pick<Patient, 'firstName' | 'lastName' | 'age' | 'phone' | 'source'>) =>
    apiRequest<Patient>('/patients', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Patient>) =>
    apiRequest<Patient>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/patients/${id}`, { method: 'DELETE' }),
};

/** POST /doctors — to‘rt majburiy maydon + qolgan Doctor maydonlari ixtiyoriy */
export type DoctorCreatePayload = Pick<Doctor, 'name' | 'specialty' | 'phone' | 'workingHours'> &
  Partial<Doctor>;

export const doctorsApi = {
  list: (params?: ListParams & { specialty?: string }) =>
    apiRequest<PaginatedResponse<Doctor>>(`/doctors${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Doctor>(`/doctors/${id}`),
  create: (body: DoctorCreatePayload) =>
    apiRequest<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Doctor>) =>
    apiRequest<Doctor>(`/doctors/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/doctors/${id}`, { method: 'DELETE' }),
};

export const bookingsApi = {
  list: (params?: ListParams & { status?: string; source?: string; patientId?: string; dateRange?: string }) =>
    apiRequest<PaginatedResponse<Booking>>(`/bookings${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Booking>(`/bookings/${id}`),
  create: (body: Omit<Booking, 'id' | 'createdAt'> & { createdAt?: string }) =>
    apiRequest<Booking>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Booking>) =>
    apiRequest<Booking>(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/bookings/${id}`, { method: 'DELETE' }),
};

export const visitsApi = {
  list: (params?: ListParams & { patientId?: string; doctorId?: string }) =>
    apiRequest<PaginatedResponse<Visit>>(`/visits${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Visit>(`/visits/${id}`),
  create: (body: Omit<Visit, 'id'>) =>
    apiRequest<Visit>('/visits', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Visit>) =>
    apiRequest<Visit>(`/visits/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const servicesApi = {
  list: (params?: ListParams & { category?: string }) =>
    apiRequest<PaginatedResponse<Service>>(`/services${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Service>(`/services/${id}`),
  create: (body: Omit<Service, 'id'>) =>
    apiRequest<Service>('/services', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Service>) =>
    apiRequest<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/services/${id}`, { method: 'DELETE' }),
};

export const paymentsApi = {
  list: (params?: ListParams & { status?: string; patientId?: string; method?: string; dateRange?: string }) =>
    apiRequest<PaginatedResponse<Payment>>(`/payments${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Payment>(`/payments/${id}`),
  create: (body: Omit<Payment, 'id'> & { date?: string }) =>
    apiRequest<Payment>('/payments', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Payment>) =>
    apiRequest<Payment>(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/payments/${id}`, { method: 'DELETE' }),
};

export const notificationsApi = {
  list: (params?: ListParams) =>
    apiRequest<PaginatedResponse<Notification>>(`/notifications${qs(params ?? {})}`),
  create: (body: {
    patientId: string;
    type: Notification['type'];
    message: string;
    status?: Notification['status'];
    sentAt?: string;
  }) => apiRequest<Notification>('/notifications', { method: 'POST', body: JSON.stringify(body) }),
  sendReminders: () =>
    apiRequest<{ created: number }>('/notifications/send-reminders', { method: 'POST', body: '{}' }),
};

