export type UserRole = 'admin' | 'doctor' | 'receptionist';

/** API login javabi — parolsiz sessiya foydalanuvchisi */
export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  specialty?: string;
  avatar?: string;
  doctorId?: string; // Doctor record id (doctor role only)
}
