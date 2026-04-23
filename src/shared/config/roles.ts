import type { UserRole } from '@/shared/types/auth';

/** Backend `ROLES_FINANCE` — to'lovlar API faqat admin */
export function canAccessPayments(role: UserRole | undefined | null): boolean {
  return role === 'admin';
}

/** Rol bo'yicha marshrutga ruxsat (UI + ProtectedRoute) */
export const roleAccess: Record<UserRole, string[]> = {
  admin: [
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
  doctor: ['/', '/bookings', '/patients', '/settings'],
  receptionist: ['/', '/bookings', '/patients', '/services', '/notifications', '/leads', '/settings'],
};

export const roleConfig: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Administrator', color: 'bg-primary/15 text-primary border-primary/30' },
  doctor: { label: 'Shifokor', color: 'bg-info/15 text-info border-info/30' },
  receptionist: { label: 'Qabulxona', color: 'bg-warning/15 text-warning border-warning/30' },
};
