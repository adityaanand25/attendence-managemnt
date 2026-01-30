import { api } from './client';
import { AdminDashboardResponse, AttendanceRecord, MemberAttendanceResponse, AllUsersResponse, LeavesResponse, LeaveRecord } from '../types/api';

export const fetchMemberAttendance = async (): Promise<MemberAttendanceResponse> => {
  const { data } = await api.get<MemberAttendanceResponse>('/api/member/attendance');
  return data;
};

export const checkIn = async (latitude?: number, longitude?: number): Promise<AttendanceRecord> => {
  const { data } = await api.post<{ record: AttendanceRecord }>(
    '/api/member/attendance/checkin',
    { latitude, longitude }
  );
  return data.record;
};

export const checkOut = async (attendanceId: string): Promise<AttendanceRecord> => {
  const { data } = await api.post<{ record: AttendanceRecord }>(
    '/api/member/attendance/checkout',
    { attendance_id: attendanceId }
  );
  return data.record;
};

export const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const { data } = await api.get<AdminDashboardResponse>('/api/admin/dashboard');
  return data;
};

export const fetchAllUsers = async (): Promise<AllUsersResponse> => {
  const { data } = await api.get<AllUsersResponse>('/api/admin/users');
  return data;
};

// Leave Management APIs
export const requestLeave = async (startDate: string, endDate: string, reason: string): Promise<LeaveRecord> => {
  const { data } = await api.post<{ leave: LeaveRecord }>('/api/member/leaves', {
    start_date: startDate,
    end_date: endDate,
    reason
  });
  return data.leave;
};

export const fetchMemberLeaves = async (): Promise<LeavesResponse> => {
  const { data } = await api.get<LeavesResponse>('/api/member/leaves');
  return data;
};

export const fetchAllLeaves = async (): Promise<LeavesResponse> => {
  const { data } = await api.get<LeavesResponse>('/api/admin/leaves');
  return data;
};

export const approveLeave = async (leaveId: string, status: 'approved' | 'rejected', adminNote?: string): Promise<LeaveRecord> => {
  const { data } = await api.post<{ leave: LeaveRecord }>('/api/admin/leaves/approve', {
    leave_id: leaveId,
    status,
    admin_note: adminNote
  });
  return data.leave;
};
