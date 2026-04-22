import { DoctorFormValues, DoctorSchema } from '@/shared/lib/validation';
import { defaultDoctorSchedule, normalizeDoctorSchedule } from '@/shared/lib/doctor-schedule';
import { Doctor } from '@/shared/types';

export const DoctorService = {
  initialState: (): DoctorFormValues => ({
    firstName: '',
    lastName: '',
    specialty: '',
    phone: '',
    schedule: defaultDoctorSchedule(),
    daysOffText: '',
  }),

  mapToForm: (d: Doctor): DoctorFormValues => ({
    firstName: d.firstName,
    lastName: d.lastName,
    specialty: d.specialty,
    phone: d.phone,
    schedule: normalizeDoctorSchedule(d.schedule),
    daysOffText: d.daysOff?.length ? d.daysOff.join(', ') : '',
  }),

  validate: (form: DoctorFormValues) => {
    const result = DoctorSchema.safeParse(form);
    if (!result.success) return result.error.errors[0].message;
    return null;
  }
};
