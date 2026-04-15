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

function qs(params: Record<string, string | undefined>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') u.set(k, v);
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

export const patientsApi = {
  list: (search?: string) =>
    apiRequest<Patient[]>(`/patients${qs({ search })}`),
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
  list: () => apiRequest<Doctor[]>('/doctors'),
  get: (id: string) => apiRequest<Doctor>(`/doctors/${id}`),
  create: (body: DoctorCreatePayload) =>
    apiRequest<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Doctor>) =>
    apiRequest<Doctor>(`/doctors/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/doctors/${id}`, { method: 'DELETE' }),
};

export const bookingsApi = {
  list: (params?: { search?: string; status?: string; source?: string; patientId?: string }) =>
    apiRequest<Booking[]>(`/bookings${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Booking>(`/bookings/${id}`),
  create: (body: Omit<Booking, 'id' | 'createdAt'> & { createdAt?: string }) =>
    apiRequest<Booking>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Booking>) =>
    apiRequest<Booking>(`/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/bookings/${id}`, { method: 'DELETE' }),
};

export const visitsApi = {
  list: (params?: { patientId?: string; doctorId?: string }) =>
    apiRequest<Visit[]>(`/visits${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Visit>(`/visits/${id}`),
  create: (body: Omit<Visit, 'id'>) =>
    apiRequest<Visit>('/visits', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Visit>) =>
    apiRequest<Visit>(`/visits/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const servicesApi = {
  list: (params?: { search?: string; category?: string }) =>
    apiRequest<Service[]>(`/services${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Service>(`/services/${id}`),
  create: (body: Omit<Service, 'id'>) =>
    apiRequest<Service>('/services', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Service>) =>
    apiRequest<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/services/${id}`, { method: 'DELETE' }),
};

export const paymentsApi = {
  list: (params?: { search?: string; status?: string; patientId?: string }) =>
    apiRequest<Payment[]>(`/payments${qs(params ?? {})}`),
  get: (id: string) => apiRequest<Payment>(`/payments/${id}`),
  create: (body: Omit<Payment, 'id'> & { date?: string }) =>
    apiRequest<Payment>('/payments', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Payment>) =>
    apiRequest<Payment>(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/payments/${id}`, { method: 'DELETE' }),
};

export const notificationsApi = {
  list: () => apiRequest<Notification[]>('/notifications'),
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
