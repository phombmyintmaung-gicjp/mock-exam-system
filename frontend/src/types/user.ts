export type UserRole = 1 | 2; // 1 = admin, 2 = employee

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  targetCertification?: string;
  is_active?: boolean;
  approval_status?: ApprovalStatus;
  created_at?: string;
}
