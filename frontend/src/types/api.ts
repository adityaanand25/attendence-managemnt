export type UserRole = 'admin' | 'member';

export type User = {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  user_metadata?: Record<string, unknown>;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
  message: string;
};

export type AttendanceRecord = {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time: string | null;
  status: 'present' | 'late' | 'absent';
  notes: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  full_name?: string;
  email?: string;
};

export type MemberAttendanceResponse = {
  message: string;
  user_id: string;
  role: UserRole;
  attendance: AttendanceRecord[];
  stats: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    absentDays: number;
  };
};

export type AdminDashboardResponse = {
  message: string;
  user_role: UserRole;
  stats: {
    total_users: number;
    total_admins: number;
    total_members: number;
    today_attendance: number;
  };
  users: Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    created_at: string;
  }>;
  recent_attendance: AttendanceRecord[];
};

export type AllUsersResponse = {
  message: string;
  total: number;
  users: Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
  }>;
};

export type LeaveRecord = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  approved_by_name?: string;
};

export type LeavesResponse = {
  leaves: LeaveRecord[];
};
