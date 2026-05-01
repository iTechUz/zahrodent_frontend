import { z } from 'zod';

export const phoneSchema = z.string().regex(/^\+998\d{9}$/, "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak");
export const requiredString = (name: string) => z.string().min(1, `${name} kiritilishi shart`);
export const positiveNumber = (name: string) => z.preprocess(
  (val) => Number(val),
  z.number().min(0, `${name} manfiy bo'lishi mumkin emas`)
);

export const PatientSchema = z.object({
  branchId: requiredString('Filial'),
  firstName: requiredString('Ism'),
  lastName: requiredString('Familiya'),
  phone: phoneSchema,
  age: positiveNumber('Yosh'),
  address: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  source: z.string().optional().default('DIRECT'),
  notes: z.string().optional(),
  assignedDoctorId: z.string().optional().or(z.literal('')),
});

export const BookingSchema = z.object({
  branchId: requiredString('Filial'),
  patientId: requiredString('Bemor'),
  doctorId: requiredString('Shifokor'),
  serviceId: z.string().optional().or(z.literal('')),
  date: requiredString('Sana'),
  time: requiredString('Vaqt'),
  duration: z.number().optional().default(30),
  source: z.string().min(1, 'Manba tanlang'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOSHOW']),
  notes: z.string().optional(),
});

export const ServiceSchema = z.object({
  name: requiredString('Xizmat nomi'),
  category: requiredString('Kategoriya'),
  price: positiveNumber('Narxi'),
  duration: positiveNumber('Davomiyligi'),
  description: z.string().optional(),
});

export const PaymentSchema = z.object({
  patientId: requiredString('Bemor'),
  amount: positiveNumber('Summa'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'INSURANCE']),
  type: z.enum(['INCOME', 'EXPENSE', 'REFUND', 'PREPAYMENT']),
  status: z.string().default('COMPLETED'),
  description: z.string().optional(),
});

export const DoctorAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.number().optional().default(30),
});

export const DoctorSchema = z.object({
  userId: requiredString('Foydalanuvchi'),
  specialty: requiredString('Mutaxassislik'),
  experienceYears: positiveNumber('Tajriba (yil)'),
  phone: phoneSchema,
  bio: z.string().optional(),
  availabilities: z.array(DoctorAvailabilitySchema).optional(),
});

export const VisitSchema = z.object({
  patientId: requiredString('Bemor'),
  doctorId: requiredString('Shifokor'),
  serviceId: z.string().optional().or(z.literal('')),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  price: positiveNumber('Narxi'),
});

export type PatientFormValues = z.infer<typeof PatientSchema>;
export type BookingFormValues = z.infer<typeof BookingSchema>;
export type ServiceFormValues = z.infer<typeof ServiceSchema>;
export type PaymentFormValues = z.infer<typeof PaymentSchema>;
export type DoctorFormValues = z.infer<typeof DoctorSchema>;
export type VisitFormValues = z.infer<typeof VisitSchema>;
