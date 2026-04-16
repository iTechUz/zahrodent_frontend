import type {
  Patient,
  Doctor,
  Booking,
  Visit,
  Payment,
  Service,
  Notification,
  NotificationRecipient,
  DoctorEfficiencyStats,
} from '@/shared/types';
import type { SessionUser } from '@/shared/types/auth';
import { apiRequest } from './client';

export async function loginRequest(body: { phone: string; password: string }) {
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
  stats: () => apiRequest<{ total: number; newThisMonth: number; topSource: string }>('/patients/stats'),
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
  stats: () => apiRequest<{ total: number; activeToday: number; totalVisits: number }>('/doctors/stats'),
  efficiency: () => apiRequest<DoctorEfficiencyStats[]>('/doctors/efficiency'),
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
  stats: () => apiRequest<{ today: number; pending: number; completedToday: number }>('/bookings/stats'),
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
  stats: () => apiRequest<{ totalCount: number; categoriesCount: number; avgPrice: number }>('/services/stats'),
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
  stats: () => apiRequest<{ totalRevenue: number; pendingAmount: number; todayRevenue: number }>('/payments/stats'),
  doctorStats: () => apiRequest<{ doctorId: string; total: number }[]>('/payments/doctor-stats'),
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
  getRecipients: (params: { startDate?: string; endDate?: string; targetType?: 'patient'|'doctor' }) =>
    apiRequest<NotificationRecipient[]>(`/notifications/recipients${qs(params)}`),
  bulkSend: (body: { targetIds: string[]; targetType: 'patient' | 'doctor'; message: string }) =>
    apiRequest<{ sent: number; failed: number; total: number }>('/notifications/bulk-send', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const usersApi = {
  list: () => apiRequest<SessionUser[]>('/users'),
  get: (id: string) => apiRequest<SessionUser>(`/users/${id}`),
  create: (body: {
    name: string;
    phone: string;
    password: string;
    role: 'admin' | 'doctor' | 'receptionist';
    specialty?: string;
    avatar?: string;
  }) => apiRequest<SessionUser>('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (
    id: string,
    body: Partial<{
      name: string;
      phone: string;
      password: string;
      role: 'admin' | 'doctor' | 'receptionist';
      specialty?: string;
      avatar?: string;
    }>,
  ) =>
    apiRequest<SessionUser>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => apiRequest<{ id: string }>(`/users/${id}`, { method: 'DELETE' }),
};

