export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NOSHOW';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'INSURANCE';
export type PaymentType = 'INCOME' | 'EXPENSE' | 'REFUND' | 'PREPAYMENT';
export type VisitStatus = 'not-started' | 'in-progress' | 'completed';
export type NotificationType = 'sms' | 'telegram';

export interface Patient {
  id: string;
  userId?: string;
  branchId: string;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  address?: string;
  workplace?: string;
  assignedDoctorId?: string;
  assignedDoctor?: {
    user: {
      name: string;
    };
  };
  source: string;
  notes?: string;
  avatar?: string;
  birthDate?: string;
  gender?: string;
  createdAt: string;
  toothChart?: Record<number, ToothRecord>;
  medicalHistory?: any;
  balance?: number;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  specialty: string;
  experienceYears: number;
  phone: string;
  bio?: string;
  avatar?: string;
  isActive: boolean;
  schedule: DoctorSchedule[];
  daysOff?: string[];
}

export interface DoctorSchedule {
  day: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
}

export interface Booking {
  id: string;
  branchId: string;
  patientId: string;
  doctorId: string;
  serviceId?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  source: string;
  notes?: string;
  createdAt: string;
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  bookingId?: string;
  serviceId?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  price: number;
  date: string;
}

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  status: string;
  currency: string;
  date: string;
  description?: string;
  referenceId?: string;
}

export interface ToothRecord {
  toothNumber: number;
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'missing' | 'implant' | 'root-canal';
  notes?: string;
  date?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  service?: string;
  message?: string;
  status: string;
  source: string;
  createdAt: string;
}
