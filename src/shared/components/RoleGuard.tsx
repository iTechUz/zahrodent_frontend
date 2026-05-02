import { useStore } from '@/store/useStore';
import type { UserRole } from '@/shared/types/auth';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  /** Ruxsat berilgan rollar. Hech bo'lmasa bittasi mos kelsa ko'rsatiladi. */
  roles: UserRole[];
  /** Ruxsat yo'q bo'lganda ko'rsatiladigan kontent (ixtiyoriy) */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Faqat ko'rsatilgan roldagi foydalanuvchilarga kontent ko'rsatadi.
 *
 * @example
 * // Faqat adminlar ko'radi
 * <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']}>
 *   <DeleteButton />
 * </RoleGuard>
 *
 * // Agar ruxsat yo'q bo'lsa fallback ko'rsatadi
 * <RoleGuard roles={['ADMIN']} fallback={<ReadOnlyView />}>
 *   <EditableView />
 * </RoleGuard>
 */
export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const role = useStore((s) => s.currentUser?.role);
  if (!role || !roles.includes(role as UserRole)) return <>{fallback}</>;
  return <>{children}</>;
}

// ─── Convenience wrappers ───────────────────────────────────────────────────

/** Faqat SUPER_ADMIN ko'radi */
export function SuperAdminOnly({ children, fallback }: Omit<RoleGuardProps, 'roles'>) {
  return <RoleGuard roles={['SUPER_ADMIN']} fallback={fallback}>{children}</RoleGuard>;
}

/** ADMIN yoki SUPER_ADMIN ko'radi */
export function AdminOnly({ children, fallback }: Omit<RoleGuardProps, 'roles'>) {
  return <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={fallback}>{children}</RoleGuard>;
}

/** Faqat DOCTOR ko'radi */
export function DoctorOnly({ children, fallback }: Omit<RoleGuardProps, 'roles'>) {
  return <RoleGuard roles={['DOCTOR']} fallback={fallback}>{children}</RoleGuard>;
}

/** DOCTOR emas — ya'ni admin/receptionist/super_admin ko'radi */
export function NotDoctor({ children, fallback }: Omit<RoleGuardProps, 'roles'>) {
  return <RoleGuard roles={['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST']} fallback={fallback}>{children}</RoleGuard>;
}

/** Faqat RECEPTIONIST ko'radi */
export function ReceptionistOnly({ children, fallback }: Omit<RoleGuardProps, 'roles'>) {
  return <RoleGuard roles={['RECEPTIONIST']} fallback={fallback}>{children}</RoleGuard>;
}

/**
 * Hook versiyasi — JSX'siz shartli mantiq uchun
 * @example
 * const { isAdmin, isDoctor, can } = useRole();
 * if (can(['ADMIN'])) { ... }
 */
export function useRole() {
  const role = useStore((s) => s.currentUser?.role) as UserRole | undefined;

  return {
    role,
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isSuperAdmin: role === 'SUPER_ADMIN',
    isDoctor: role === 'DOCTOR',
    isReceptionist: role === 'RECEPTIONIST',
    /** Berilgan rollar ichida hozirgi rol bormi */
    can: (roles: UserRole[]) => !!role && roles.includes(role),
  };
}
