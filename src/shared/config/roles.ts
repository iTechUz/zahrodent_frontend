import type { UserRole } from '@/shared/types/auth';

/** To'lovlar API ruxsati (Admin va Super Admin uchun) */
export function canAccessPayments(role: UserRole | undefined | null): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/** Rol bo'yicha marshrutga ruxsat (UI + ProtectedRoute) */
export const roleAccess: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    '/',
    '/bookings',
    '/patients',
    '/doctors',
    '/services',
    '/finance',
    '/analytics',
    '/notifications',
    '/leads',
    '/settings',
    '/users',
    '/branches'
  ],
  ADMIN: [
    '/',
    '/bookings',
    '/patients',
    '/doctors',
    '/services',
    '/finance',
    '/analytics',
    '/notifications',
    '/leads',
    '/settings',
    '/users',
  ],
  DOCTOR: ['/', '/bookings', '/patients', '/settings'],
  RECEPTIONIST: ['/', '/bookings', '/patients', '/services', '/notifications', '/leads', '/settings'],
};

export const roleConfig: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Platforma Egasi', color: 'bg-purple-600/15 text-purple-600 border-purple-600/30' },
  ADMIN: { label: 'Administrator', color: 'bg-primary/15 text-primary border-primary/30' },
  DOCTOR: { label: 'Shifokor', color: 'bg-info/15 text-info border-info/30' },
  RECEPTIONIST: { label: 'Qabulxona', color: 'bg-warning/15 text-warning border-warning/30' },
};
