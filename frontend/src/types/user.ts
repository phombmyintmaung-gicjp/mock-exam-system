export type UserRole = 'admin' | 'employee';

export interface Department {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  targetCertification?: string;
}
