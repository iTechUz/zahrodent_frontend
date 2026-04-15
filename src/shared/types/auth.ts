export type UserRole = 'admin' | 'doctor' | 'receptionist';

/** API login javabi — parolsiz sessiya foydalanuvchisi */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialty?: string;
  avatar?: string;
}
