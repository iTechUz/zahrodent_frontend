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
  phone: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  source: string;
  notes?: string;
  medicalHistory?: any;
  toothChart?: any;
  balance: number;
  assignedDoctorId?: string;
  assignedDoctor?: Doctor;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
}

export interface Doctor {
  id: string;
  userId: string;
  name: string; // Flattened from user.name
  phone?: string; // Flattened from user.phone
  email?: string; // Flattened from user.email
  avatar?: string; // Flattened from user.avatar
  specialty: string;
  experienceYears: number;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  availabilities?: DoctorAvailability[];
  schedule?: DoctorSchedule[];
  user?: { // Keep this just in case, though flattened is primary
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
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
  basePrice: number;
  duration: number;
  description?: string;
  branchId?: string;
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
  updatedAt: string;
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
}

export interface Visit {
  id: string;
  branchId: string;
  patientId: string;
  doctorId: string;
  bookingId?: string;
  serviceId?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  price: number;
  date: string;
  createdAt: string;
  patient?: Patient;
  doctor?: Doctor;
  service?: Service;
}

export interface Payment {
  id: string;
  branchId: string;
  patientId: string;
  doctorId?: string;
  bookingId?: string;
  visitId?: string;
  serviceId?: string;
  amount: number;
  discount?: number;
  type: PaymentType;
  method: PaymentMethod;
  status: string;
  currency: string;
  referenceId?: string;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface ToothRecord {
  toothNumber: number;
  condition: 'healthy' | 'cavity' | 'filled' | 'crown' | 'missing' | 'implant' | 'root-canal';
  notes?: string;
  date?: string;
}

export interface Lead {
  id: string;
  branchId?: string;
  patientId?: string;
  name: string;
  phone: string;
  service?: string;
  message?: string;
  status: string;
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorEfficiencyStats {
  doctorId: string;
  name: string;
  specialty: string;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  conversionRate: number;
  avgCheck: number;
}

export interface PatientComment {
  id: string;
  branchId: string;
  patientId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
}

export interface BranchSubscription {
  id: string;
  branchId: string;
  planId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED';
  startDate: string;
  endDate: string | null;
  branch: {
    id: string;
    name: string;
    isActive: boolean;
  };
  plan: SubscriptionPlan;
  createdAt: string;
}

export interface SaasMetrics {
  totalPlans: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
  mrr: number;
  arr: number;
  subscriptions: BranchSubscription[];
}
