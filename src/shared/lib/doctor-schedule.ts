import type { DoctorSchedule } from '@/shared/types';

export const DOCTOR_WEEKDAY_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'] as const;

export function defaultDoctorSchedule(): DoctorSchedule[] {
  return DOCTOR_WEEKDAY_LABELS.map((_, day) => ({
    day,
    startTime: '09:00',
    endTime: '17:00',
    isWorking: false,
  }));
}

/** API / seed dan kelgan jadvalni forma uchun 7 kunga to'ldiradi */
export function normalizeDoctorSchedule(raw?: DoctorSchedule[] | null): DoctorSchedule[] {
  const base = defaultDoctorSchedule();
  if (!raw?.length) return base;
  return base.map((slot) => {
    const found = raw.find((s) => Number(s.day) === slot.day);
    if (!found) return slot;
    const start = String(found.startTime ?? '09:00').slice(0, 5);
    const end = String(found.endTime ?? '17:00').slice(0, 5);
    return {
      day: slot.day,
      startTime: start,
      endTime: end,
      isWorking: !!found.isWorking,
    };
  });
}
