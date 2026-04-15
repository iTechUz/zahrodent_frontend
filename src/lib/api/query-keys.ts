export const queryKeys = {
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  bookings: ['bookings'] as const,
  doctors: ['doctors'] as const,
  visits: ['visits'] as const,
  services: ['services'] as const,
  payments: ['payments'] as const,
  notifications: ['notifications'] as const,
};
