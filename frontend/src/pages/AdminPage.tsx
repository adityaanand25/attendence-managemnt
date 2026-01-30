import React, { useEffect, useState } from 'react';
import { fetchAdminDashboard, fetchAllUsers, fetchAllLeaves, approveLeave } from '../api/attendance';
import { AdminDashboardResponse, AllUsersResponse, LeaveRecord } from '../types/api';
import { useAuth } from '../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [allUsers, setAllUsers] = useState<AllUsersResponse | null>(null);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvalNote, setApprovalNote] = useState<{[key: string]: string}>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminDashboard();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetchAllUsers();
      setAllUsers(res);
    } catch (err: any) {
      console.error('Failed to load all users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadLeaves = async () => {
    setLeavesLoading(true);
    try {
      const res = await fetchAllLeaves();
      setLeaves(res.leaves);
    } catch (err: any) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLeavesLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      await approveLeave(leaveId, status, approvalNote[leaveId] || undefined);
      setApprovalNote({ ...approvalNote, [leaveId]: '' });
      await loadLeaves();
    } catch (err: any) {
      alert('Failed to update leave: ' + (err?.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleDownloadAttendance = async () => {
    try {
      const token = localStorage.getItem('attendance_token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${baseURL}/api/admin/export/attendance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download attendance report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDownloadLeaves = async () => {
    try {
      const token = localStorage.getItem('attendance_token');
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      const response = await fetch(`${baseURL}/api/admin/export/leaves`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download leave report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_requests_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download: ' + (err.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    load();
    loadAllUsers();
    loadLeaves();
  }, []);

  return (
    <div className="layout">
      {/* Hero Section */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px' }}>👑 Admin Dashboard</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Welcome, {user?.full_name || user?.email} - Manage your organization</p>
      </div>

      {/* Stats Overview */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>📊 Overview Statistics</h3>
          <button className="button ghost" onClick={load} disabled={loading}>
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
        {error && <div className="alert error">{error}</div>}
        {data && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <Stat title="👥 Total Users" value={data.stats.total_users} color="#6366f1" />
            <Stat title="👑 Admins" value={data.stats.total_admins} color="#ec4899" />
            <Stat title="👤 Members" value={data.stats.total_members} color="#8b5cf6" />
            <Stat title="📍 Today Check-ins" value={data.stats.today_attendance} color="#10b981" />
          </div>
        )}
      </div>

      {data && (
        <div className="grid two" style={{ marginTop: '24px' }}>
          <div className="card">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👥</span> Recent Users
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.full_name || '—'}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'status-admin' : ''}`}>{u.role}</span></td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <span>📋</span> Recent Attendance
              </h4>
              <button
                className="button"
                onClick={handleDownloadAttendance}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontSize: '13px', padding: '8px 16px' }}
              >
                📥 Download Excel
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_attendance.map((rec) => (
                    <tr key={rec.id}>
                      <td>{rec.full_name || rec.email}</td>
                      <td>{new Date(rec.check_in_time).toLocaleString()}</td>
                      <td>{rec.check_out_time ? new Date(rec.check_out_time).toLocaleString() : '—'}</td>
                      <td><span className={`badge status-${rec.status}`}>{rec.status}</span></td>
                      <td style={{ fontSize: '12px' }}>
                        {rec.latitude && rec.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#10b981', textDecoration: 'none' }}
                          >
                            📍 View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Employees List */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> All Employees ({allUsers?.total || 0})
          </h3>
          <button className="button ghost" onClick={loadAllUsers} disabled={usersLoading}>
            {usersLoading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
        {usersLoading && <p>Loading employees...</p>}
        {!usersLoading && allUsers && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.users.map((u, index) => (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td><strong>{u.full_name || 'N/A'}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'status-admin' : ''}`}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 Member'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>{new Date(u.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!usersLoading && allUsers && allUsers.users.length === 0 && (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No employees found</p>
        )}
      </div>

      {/* Leave Approvals */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#f5576c', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>🏖️</span> Leave Requests Management
          </h3>
          <button
            className="button"
            onClick={handleDownloadLeaves}
            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', fontSize: '13px', padding: '8px 16px' }}
          >
            📥 Download Excel
          </button>
        </div>
        {leavesLoading && <p>Loading leave requests...</p>}
        {!leavesLoading && leaves.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id} style={{ backgroundColor: leave.status === 'pending' ? 'rgba(245, 87, 108, 0.05)' : 'transparent' }}>
                    <td>
                      <strong>{leave.user_name || 'N/A'}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{leave.user_email}</span>
                    </td>
                    <td>
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td style={{ maxWidth: '250px' }}>{leave.reason}</td>
                    <td>
                      <span className={`badge status-${leave.status}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      {leave.status === 'pending' ? (
                        <input
                          className="input"
                          placeholder="Add note (optional)"
                          value={approvalNote[leave.id] || ''}
                          onChange={(e) => setApprovalNote({ ...approvalNote, [leave.id]: e.target.value })}
                          style={{ fontSize: '13px', padding: '6px' }}
                        />
                      ) : (
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                          {leave.admin_note || '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      {leave.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="button"
                            onClick={() => handleApproveLeave(leave.id, 'approved')}
                            style={{ background: '#10b981', fontSize: '12px', padding: '6px 12px' }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="button"
                            onClick={() => handleApproveLeave(leave.id, 'rejected')}
                            style={{ background: '#ef4444', fontSize: '12px', padding: '6px 12px' }}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '14px', color: '#64748b' }}>
                          {leave.approved_by_name ? `By ${leave.approved_by_name}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!leavesLoading && leaves.length === 0 && (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No leave requests yet</p>
        )}
      </div>
    </div>
  );
};

const Stat: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
  <div className="card" style={{ textAlign: 'center', borderTop: `3px solid ${color}` }}>
    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>{title}</div>
    <div style={{ fontSize: '32px', fontWeight: 700, color }}>{value}</div>
  </div>
);
