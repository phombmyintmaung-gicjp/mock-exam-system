export type UserRole = 'admin' | 'employee';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

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
  is_active?: boolean;
  approval_status?: ApprovalStatus;
  created_at?: string;
}
