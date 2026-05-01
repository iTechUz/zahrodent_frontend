import { BookingStatus, PaymentMethod, PaymentType, VisitStatus } from '../types';

export const BOOKING_SOURCES = ['DIRECT', 'TG_BOT', 'INSTAGRAM', 'WEB', 'PHONE'];

export const BOOKING_SOURCE_LABELS: Record<string, string> = {
  DIRECT: 'Shaxsan',
  TG_BOT: 'Telegram Bot',
  INSTAGRAM: 'Instagram',
  WEB: 'Veb-sayt',
  PHONE: 'Telefon',
};

export const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NOSHOW'];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Kutilmoqda',
  CONFIRMED: 'Tasdiqlangan',
  CANCELLED: 'Bekor qilingan',
  COMPLETED: 'Yakunlangan',
  NOSHOW: 'Kelmadi',
};

export const PAYMENT_TYPES: PaymentType[] = ['INCOME', 'EXPENSE', 'REFUND', 'PREPAYMENT'];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  INCOME: 'Kirim',
  EXPENSE: 'Chiqim',
  REFUND: 'Qaytarish',
  PREPAYMENT: 'Avans',
};

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'TRANSFER', 'INSURANCE'];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  TRANSFER: "O'tkazma",
  INSURANCE: "Sug'urta",
};

export const PAYMENT_STATUSES = ['COMPLETED', 'PENDING', 'FAILED'];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  COMPLETED: "To'langan",
  PENDING: 'Kutilmoqda',
  FAILED: 'Xato',
};

export const VISIT_STATUS_LABELS: Record<VisitStatus, string> = {
  'not-started': 'Boshlanmagan',
  'in-progress': 'Jarayonda',
  completed: 'Yakunlangan',
};

export const VISIT_STATUSES: VisitStatus[] = ['not-started', 'in-progress', 'completed'];
