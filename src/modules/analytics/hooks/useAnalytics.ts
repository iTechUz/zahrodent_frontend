import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { bookingsApi, patientsApi, paymentsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import { canAccessPayments } from '@/shared/config/roles';
import {
  aggregateBookingConversionByMonth,
  aggregateNewPatientsByMonthCounts,
  aggregatePaidRevenueMillions,
  aggregateBookingsBySourceLabel,
  getLastNCalendarMonths,
  REPORT_CHART_COLORS,
} from '@/shared/lib/reporting';

export const useAnalytics = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const role = useStore((s) => s.currentUser?.role);
  const canViewPayments = canAccessPayments(role);
  const buckets6 = useMemo(() => getLastNCalendarMonths(6), []);

  const { data: bookingsRes } = useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => bookingsApi.list(),
    enabled: authed,
  });
  const bookings = bookingsRes?.data ?? [];

  const { data: patientsRes } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list(),
    enabled: authed,
  });
  const patients = patientsRes?.data ?? [];

  const { data: paymentsRes } = useQuery({
    queryKey: queryKeys.payments,
    queryFn: () => paymentsApi.list(),
    enabled: authed && canViewPayments,
  });
  const payments = paymentsRes?.data ?? [];

  const monthlyPatients = useMemo(
    () => aggregateNewPatientsByMonthCounts(patients, buckets6),
    [patients, buckets6],
  );

  const revenueGrowth = useMemo(
    () => aggregatePaidRevenueMillions(payments, buckets6),
    [payments, buckets6],
  );

  const conversionData = useMemo(
    () => aggregateBookingConversionByMonth(bookings, buckets6),
    [bookings, buckets6],
  );

  const sourceData = useMemo(() => aggregateBookingsBySourceLabel(bookings), [bookings]);

  const colors = [...REPORT_CHART_COLORS];

  return {
    monthlyPatients,
    revenueGrowth,
    conversionData,
    sourceData,
    colors,
    canViewPayments,
  };
};
