import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, UserPlus, Stethoscope, CreditCard } from 'lucide-react';
import { patientsApi, bookingsApi, paymentsApi, doctorsApi, visitsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import { canAccessPayments } from '@/shared/config/roles';
import {
  aggregateBookingsBySourceWithColors,
  aggregateNewPatientsByMonthForDashboard,
  aggregatePaidRevenueByMonthSom,
  countNewPatientsInMonthKeys,
  getLastNCalendarMonths,
  monthOverMonthHint,
  paidRevenueInMonthKeys,
} from '@/shared/lib/reporting';

function startOfCurrentMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function currentAndPrevMonthKeys() {
  const now = new Date();
  const keyCurrent = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const keyPrev = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  return { keyCurrent, keyPrev };
}

export const useDashboard = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const role = useStore((s) => s.currentUser?.role);
  const canViewPayments = canAccessPayments(role);
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = startOfCurrentMonth();

  const { data: patientsRes } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list({ limit: 1000 }),
    enabled: authed,
  });
  const patients = patientsRes?.data ?? [];

  const { data: bookingsRes } = useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => bookingsApi.list({ limit: 1000 }),
    enabled: authed,
  });
  const bookings = bookingsRes?.data ?? [];

  const { data: paymentsRes } = useQuery({
    queryKey: queryKeys.payments,
    queryFn: () => paymentsApi.list({ limit: 1000 }),
    enabled: authed && canViewPayments,
  });
  const payments = paymentsRes?.data ?? [];

  const { data: doctorsRes } = useQuery({
    queryKey: queryKeys.doctors,
    queryFn: () => doctorsApi.list({ limit: 100 }),
    enabled: authed,
  });
  const doctors = doctorsRes?.data ?? [];

  const { data: visitsRes } = useQuery({
    queryKey: queryKeys.visits,
    queryFn: () => visitsApi.list({ limit: 1000 }),
    enabled: authed,
  });
  const visits = visitsRes?.data ?? [];

  const todayBookings = bookings.filter((b) => b.date === today);
  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const newPatients = patients.filter((p) => p.createdAt >= monthStart).length;
  const completedToday = todayBookings.filter((b) => b.status === 'completed').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const unpaidPayments = payments.filter((p) => p.status !== 'paid');
  const totalDebt = unpaidPayments.reduce((s, p) => s + p.amount, 0);
  const activeDoctors = doctors.filter((d) =>
    visits.some((v) => v.doctorId === d.id && v.status === 'in-progress'),
  ).length;

  const buckets6 = useMemo(() => getLastNCalendarMonths(6), []);

  const patientGrowth = useMemo(
    () => aggregateNewPatientsByMonthForDashboard(patients, buckets6),
    [patients, buckets6],
  );

  const revenueData = useMemo(
    () => aggregatePaidRevenueByMonthSom(payments, buckets6),
    [payments, buckets6],
  );

  const sourceData = useMemo(() => aggregateBookingsBySourceWithColors(bookings), [bookings]);

  const { keyCurrent, keyPrev } = useMemo(() => currentAndPrevMonthKeys(), []);
  const newMom = useMemo(
    () => countNewPatientsInMonthKeys(patients, keyCurrent, keyPrev),
    [patients, keyCurrent, keyPrev],
  );
  const revMom = useMemo(
    () => paidRevenueInMonthKeys(payments, keyCurrent, keyPrev),
    [payments, keyCurrent, keyPrev],
  );

  const newPatientsTrend = monthOverMonthHint(newMom.current, newMom.previous);
  const revenueTrend = monthOverMonthHint(revMom.current, revMom.previous);

  const quickActions = useMemo(() => {
    const all = [
      { label: 'Yangi qabul', icon: CalendarDays, path: '/bookings', color: 'bg-primary/10 text-primary' },
      { label: "Bemor qo'shish", icon: UserPlus, path: '/patients', color: 'bg-info/10 text-info' },
      { label: "To'lov qayd etish", icon: CreditCard, path: '/finance', color: 'bg-success/10 text-success' },
      { label: 'Shifokorlar', icon: Stethoscope, path: '/doctors', color: 'bg-warning/10 text-warning' },
    ];
    if (!canViewPayments) {
      return all.filter((a) => a.path !== '/finance');
    }
    return all;
  }, [canViewPayments]);

  return {
    patients,
    bookings,
    payments,
    doctors,
    todayBookings,
    totalRevenue,
    newPatients,
    completedToday,
    pendingBookings,
    totalDebt,
    unpaidCount: unpaidPayments.length,
    activeDoctors,
    quickActions,
    navigate,
    patientGrowth,
    revenueData,
    sourceData,
    newPatientsTrend,
    revenueTrend,
    canViewPayments,
  };
};
