import { BookingSchema, BookingFormValues } from "@/shared/lib/validation";
import { Booking } from '@/shared/types';

export const BookingService = {
  initialState: (): BookingFormValues => ({
    patientId: '',
    doctorId: '',
    serviceId: '',
    date: '',
    time: '',
    duration: 30,
    source: 'DIRECT',
    status: 'PENDING',
    notes: '',
    branchId: '',
  }),

  mapToForm: (b: Booking): BookingFormValues => {
    const startDate = new Date(b.startTime);
    const endDate   = new Date(b.endTime);
    const duration  = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    return {
      patientId:  b.patientId,
      doctorId:   b.doctorId,
      serviceId:  b.serviceId || '',
      branchId:   b.branchId  || '',
      date: startDate.toISOString().split('T')[0],
      time: startDate.toTimeString().substring(0, 5),
      duration,
      source: b.source,
      status: b.status,
      notes:  b.notes || '',
    };
  },

  validate: (form: BookingFormValues) => {
    const result = BookingSchema.safeParse(form);
    if (!result.success) return result.error.errors[0].message;
    return null;
  }
};
