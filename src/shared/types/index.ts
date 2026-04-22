export type BookingSource = 'walk-in' | 'telegram' | 'website' | 'phone';
export type BookingStatus = 'pending' | 'confirmed' | 'arrived' | 'no-show' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'insurance';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';
export type VisitStatus = 'not-started' | 'in-progress' | 'completed';
export type NotificationType = 'sms' | 'telegram';

export interface NotificationRecipient {
  id: string; // patient id
  firstName: string;
  lastName: string;
  phone: string;
  bookingId: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:mm
  patientName?: string; // used when targetType is doctor
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  address: string;
  workplace: string;
  assignedDoctorId?: string;
  assignedDoctor?: {
    firstName: string;
    lastName: string;
  };
  source: BookingSource;
  notes: string;
  avatar?: string;
  createdAt: string;
  toothChart?: Record<number, ToothRecord>;
  balance?: number;
}

export interface PatientComment {
  id: string;
  content: string;
  createdAt: string;
  patientId: string;
  authorId: string;
  author: {
    name: string;
    avatar?: string;
  };
}

export interface ToothRecord {
  toothNumber: number;
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'missing' | 'implant' | 'root-canal';
  notes?: string;
  date?: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  avatar?: string;
  schedule?: DoctorSchedule[];
  daysOff?: string[];
}

export interface DoctorSchedule {
  day: number; // 0=Du, 1=Se, ...6=Ya
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // minutes
  description?: string;
}

export interface Booking {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  source: BookingSource;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  serviceId?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  bookingId?: string;
  date: string;
  status: VisitStatus;
  price: number;
  diagnosis: string;
  treatment: string;
  notes: string;
}

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  description: string;
  discount?: number;
  serviceId?: string;
  visitId?: string;
}

export interface Notification {
  id: string;
  patientId: string;
  type: NotificationType;
  message: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
}

export interface DoctorEfficiencyStats {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  totalBookings: number;
  totalVisits: number;
  totalRevenue: number;
  conversionRate: number;
  avgCheck: number;
}
