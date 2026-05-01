import type { Booking, Patient, Payment } from '@/shared/types';
import { BOOKING_SOURCE_LABELS } from '@/shared/constants';

/** Grafik segmentlari uchun palitra (UI konstanta, ma'lumot emas) */
export const REPORT_CHART_COLORS = [
  'hsl(174, 62%, 38%)',
  'hsl(210, 80%, 52%)',
  'hsl(38, 92%, 50%)',
  'hsl(152, 60%, 40%)',
  'hsl(280, 50%, 45%)',
  'hsl(0, 60%, 50%)',
] as const;

const MONTHS_UZ = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'Iyn',
  'Iyl',
  'Avg',
  'Sen',
  'Okt',
  'Noy',
  'Dek',
];

export type MonthBucket = { key: string; label: string };

/** Oxirgi n ta to'liq oy (YYYY-MM kalit + qisqa yozuv) */
export function getLastNCalendarMonths(n: number, ref = new Date()): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({ key, label: MONTHS_UZ[d.getMonth()] });
  }
  return buckets;
}

function monthKeyFromDateString(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  if (typeof dateStr === 'string') return dateStr.slice(0, 7);
  if (dateStr instanceof Date) return dateStr.toISOString().slice(0, 7);
  return '';
}

/** Dashboard AreaChart: month + patients */
export function aggregateNewPatientsByMonthForDashboard(
  patients: Patient[],
  buckets: MonthBucket[],
): { month: string; patients: number }[] {
  const counts = new Map<string, number>();
  for (const b of buckets) counts.set(b.key, 0);
  for (const p of patients) {
    const k = monthKeyFromDateString(p.createdAt);
    if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return buckets.map((b) => ({ month: b.label, patients: counts.get(b.key) ?? 0 }));
}

/** Dashboard BarChart: month + revenue (so'm) */
export function aggregatePaidRevenueByMonthSom(
  payments: Payment[],
  buckets: MonthBucket[],
): { month: string; revenue: number }[] {
  const sums = new Map<string, number>();
  for (const b of buckets) sums.set(b.key, 0);
  for (const p of payments) {
    if (p.status !== 'paid' && p.status !== 'COMPLETED') continue;
    const k = monthKeyFromDateString(p.date);
    if (sums.has(k)) sums.set(k, (sums.get(k) ?? 0) + Number(p.amount));
  }
  return buckets.map((b) => ({ month: b.label, revenue: sums.get(b.key) ?? 0 }));
}

/** Analytics: month + count (Area dataKey "count") */
export function aggregateNewPatientsByMonthCounts(
  patients: Patient[],
  buckets: MonthBucket[],
): { month: string; count: number }[] {
  const rows = aggregateNewPatientsByMonthForDashboard(patients, buckets);
  return rows.map((r) => ({ month: r.month, count: r.patients }));
}

/** Analytics BarChart: mln so'm */
export function aggregatePaidRevenueMillions(
  payments: Payment[],
  buckets: MonthBucket[],
): { month: string; revenue: number }[] {
  const som = aggregatePaidRevenueByMonthSom(payments, buckets);
  return som.map((r) => ({
    month: r.month,
    revenue: Math.round((r.revenue / 1_000_000) * 10) / 10,
  }));
}

/** Qabul yozilgan / yakunlangan (oy bo'yicha) */
export function aggregateBookingConversionByMonth(
  bookings: Booking[],
  buckets: MonthBucket[],
): { month: string; booked: number; completed: number }[] {
  const booked = new Map<string, number>();
  const completed = new Map<string, number>();
  for (const b of buckets) {
    booked.set(b.key, 0);
    completed.set(b.key, 0);
  }
  for (const b of bookings) {
    const k = monthKeyFromDateString(b.date);
    if (!booked.has(k)) continue;
    booked.set(k, (booked.get(k) ?? 0) + 1);
    if (b.status === 'completed') {
      completed.set(k, (completed.get(k) ?? 0) + 1);
    }
  }
  return buckets.map((b) => ({
    month: b.label,
    booked: booked.get(b.key) ?? 0,
    completed: completed.get(b.key) ?? 0,
  }));
}

export function aggregateBookingsBySourceLabel(bookings: Booking[]): { name: string; value: number }[] {
  const sourceCount = bookings.reduce(
    (acc, b) => {
      acc[b.source] = (acc[b.source] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(sourceCount).map(([key, value]) => ({
    name: BOOKING_SOURCE_LABELS[key as keyof typeof BOOKING_SOURCE_LABELS] || key,
    value,
  }));
}

/** Pie: label + soni + rang */
export function aggregateBookingsBySourceWithColors(bookings: Booking[]): {
  name: string;
  value: number;
  color: string;
}[] {
  const rows = aggregateBookingsBySourceLabel(bookings);
  return rows.map((r, i) => ({
    ...r,
    color: REPORT_CHART_COLORS[i % REPORT_CHART_COLORS.length],
  }));
}

/** Shu oy va o'tgan oyda ro'yxatga olingan bemorlar soni (trend uchun) */
export function countNewPatientsInMonthKeys(patients: Patient[], keyCurrent: string, keyPrev: string) {
  let cur = 0;
  let prev = 0;
  for (const p of patients) {
    const k = monthKeyFromDateString(p.createdAt);
    if (k === keyCurrent) cur += 1;
    else if (k === keyPrev) prev += 1;
  }
  return { current: cur, previous: prev };
}

export function paidRevenueInMonthKeys(payments: Payment[], keyCurrent: string, keyPrev: string) {
  let cur = 0;
  let prev = 0;
  for (const p of payments) {
    if (p.status !== 'paid' && p.status !== 'COMPLETED') continue;
    const k = monthKeyFromDateString(p.date);
    if (k === keyCurrent) cur += Number(p.amount);
    else if (k === keyPrev) prev += Number(p.amount);
  }
  return { current: cur, previous: prev };
}

export function monthOverMonthHint(current: number, previous: number): { text: string; up: boolean } | null {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) return { text: `Joriy davr: ${current}`, up: true };
  const pct = ((current - previous) / previous) * 100;
  return {
    text: `${pct >= 0 ? '+' : ''}${Math.round(pct)}% o'tgan oyga`,
    up: pct >= 0,
  };
}
