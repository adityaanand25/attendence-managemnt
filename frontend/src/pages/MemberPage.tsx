import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { checkIn, checkOut, fetchMemberAttendance, requestLeave, fetchMemberLeaves } from '../api/attendance';
import { AttendanceRecord, MemberAttendanceResponse, LeaveRecord } from '../types/api';
import { useAuth } from '../context/AuthContext';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const MemberPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<MemberAttendanceResponse | null>(null);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMemberAttendance();
      setData(res);
      const leavesRes = await fetchMemberLeaves();
      setLeaves(leavesRes.leaves);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError(null);
    try {
      // Get geolocation if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await checkIn(latitude, longitude);
            await load();
            setActionLoading(false);
          },
          async (error) => {
            console.warn('Geolocation error:', error);
            // Proceed with check-in without location
            await checkIn();
            await load();
            setActionLoading(false);
          }
        );
      } else {
        // Browser doesn't support geolocation
        await checkIn();
        await load();
        setActionLoading(false);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Check-in failed');
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      await checkOut(id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      await requestLeave(leaveForm.startDate, leaveForm.endDate, leaveForm.reason);
      setLeaveForm({ startDate: '', endDate: '', reason: '' });
      setShowLeaveForm(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Leave request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const openRecord = data?.attendance.find((r) => !r.check_out_time);
  const todayRecord = data?.attendance.find((r) => {
    const recordDate = new Date(r.check_in_time).toDateString();
    const today = new Date().toDateString();
    return recordDate === today;
  });

  return (
    <motion.div 
      className="layout"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero Section */}
      <motion.div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)', 
          color: 'white', 
          padding: '40px',
          boxShadow: '0 20px 60px rgba(20, 184, 166, 0.3)'
        }}
        variants={fadeInUp}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.h1 
          style={{ margin: 0, fontSize: '36px', fontWeight: 800 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome, {user?.full_name || user?.email} 👋
        </motion.h1>
        <motion.p 
          style={{ margin: '8px 0 0 0', opacity: 0.95, fontSize: '16px' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          Member Dashboard - Track your work journey with Worko
        </motion.p>
      </motion.div>

      {/* Status Cards */}
      <motion.div 
        className="grid two" 
        style={{ marginTop: '24px' }}
        variants={staggerContainer}
      >
        <motion.div 
          className="card" 
          style={{ 
            borderLeft: '4px solid #10b981',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(255, 255, 255, 1) 100%)'
          }}
          variants={fadeInUp}
          whileHover={{ y: -5, boxShadow: '0 25px 70px rgba(16, 185, 129, 0.15)' }}
        >
          <h3 style={{ marginTop: 0, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📅</span> Today's Status
          </h3>
          {loading && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Loading...
            </motion.p>
          )}
          {!loading && todayRecord && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>
                Check-in: <strong style={{ color: '#0d9488' }}>{new Date(todayRecord.check_in_time).toLocaleTimeString()}</strong>
              </div>
              {todayRecord.check_out_time && (
                <div style={{ fontSize: '14px', color: '#475569', marginBottom: '8px' }}>
                  Check-out: <strong style={{ color: '#0d9488' }}>{new Date(todayRecord.check_out_time).toLocaleTimeString()}</strong>
                </div>
              )}
              {todayRecord.latitude && todayRecord.longitude && (
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                  Location: <a
                    href={`https://www.google.com/maps?q=${todayRecord.latitude},${todayRecord.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#14b8a6', textDecoration: 'none', fontWeight: 600 }}
                  >
                    📍 View on Map
                  </a>
                </div>
              )}
              <motion.span 
                className={`badge status-${todayRecord.status}`} 
                style={{ marginTop: '8px' }}
                whileHover={{ scale: 1.05 }}
              >
                {todayRecord.status.toUpperCase()}
              </motion.span>
            </motion.div>
          )}
          {!loading && !todayRecord && (
            <p style={{ color: '#64748b' }}>No attendance recorded today</p>
          )}
        </motion.div>

        <motion.div 
          className="card" 
          style={{ 
            borderLeft: '4px solid #3b82f6',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 1) 100%)'
          }}
          variants={fadeInUp}
          whileHover={{ y: -5, boxShadow: '0 25px 70px rgba(59, 130, 246, 0.15)' }}
        >
          <h3 style={{ marginTop: 0, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡</span> Quick Actions
          </h3>
          {error && (
            <motion.div 
              className="alert error" 
              style={{ marginBottom: '12px' }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <motion.button 
              className="button" 
              onClick={handleCheckIn} 
              disabled={actionLoading || Boolean(openRecord)}
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                border: 'none'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {actionLoading ? '⏳ Processing...' : openRecord ? '✓ Already Checked In' : '📍 Check In Now'}
            </motion.button>
            <motion.button
              className="button ghost"
              onClick={() => openRecord && handleCheckOut(openRecord.id)}
              disabled={actionLoading || !openRecord}
              style={{ width: '100%', borderColor: '#14b8a6', color: '#14b8a6' }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(20, 184, 166, 0.05)' }}
              whileTap={{ scale: 0.98 }}
            >
              {actionLoading ? '⏳ Processing...' : '🚪 Check Out'}
            </motion.button>
            <motion.button 
              className="button ghost" 
              onClick={load} 
              disabled={loading}
              style={{ width: '100%', borderColor: '#3b82f6', color: '#3b82f6' }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              whileTap={{ scale: 0.98 }}
            >
              🔄 Refresh
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Statistics */}
      {!loading && data && (
        <motion.div 
          className="grid" 
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginTop: '24px' }}
          variants={staggerContainer}
        >
          <StatCard title="Total Days" value={data.stats.totalDays} color="#14b8a6" icon="📊" />
          <StatCard title="Present" value={data.stats.presentDays} color="#10b981" icon="✅" />
          <StatCard title="Late" value={data.stats.lateDays} color="#f59e0b" icon="⏰" />
          <StatCard title="Absent" value={data.stats.absentDays} color="#ef4444" icon="❌" />
        </motion.div>
      )}

      {/* Attendance History */}
      <motion.div 
        className="card" 
        style={{ marginTop: '24px' }}
        variants={fadeInUp}
        whileHover={{ boxShadow: '0 25px 70px rgba(20, 184, 166, 0.1)' }}
      >
        <h3 style={{ color: '#0d9488', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📋</span> Attendance History
        </h3>
        {loading && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Loading...
          </motion.p>
        )}
        {!loading && data && <HistoryTable records={data.attendance} onCheckout={handleCheckOut} />}
      </motion.div>

      {/* Leave Management */}
      <motion.div 
        className="card"
        style={{ marginTop: '24px' }}
        variants={fadeInUp}
        whileHover={{ boxShadow: '0 25px 70px rgba(20, 184, 166, 0.1)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ color: '#0d9488', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>🏖️</span> Leave Requests
          </h3>
          <motion.button
            className="button"
            onClick={() => setShowLeaveForm(!showLeaveForm)}
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➕ Request Leave
          </motion.button>
        </div>

        {showLeaveForm && (
          <motion.form
            onSubmit={handleLeaveRequest}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginBottom: '24px', padding: '20px', background: 'rgba(20, 184, 166, 0.05)', borderRadius: '12px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <label>
                <span style={{ fontWeight: 600, color: '#14b8a6', fontSize: '14px' }}>Start Date</span>
                <input
                  type="date"
                  className="input"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  required
                  style={{ marginTop: '6px' }}
                />
              </label>
              <label>
                <span style={{ fontWeight: 600, color: '#14b8a6', fontSize: '14px' }}>End Date</span>
                <input
                  type="date"
                  className="input"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  required
                  style={{ marginTop: '6px' }}
                />
              </label>
            </div>
            <label style={{ display: 'block', marginBottom: '16px' }}>
              <span style={{ fontWeight: 600, color: '#14b8a6', fontSize: '14px' }}>Reason</span>
              <textarea
                className="input"
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                required
                rows={3}
                placeholder="Please provide reason for leave..."
                style={{ marginTop: '6px', resize: 'vertical' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                type="submit"
                className="button"
                disabled={actionLoading}
                style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {actionLoading ? '⏳ Submitting...' : '✓ Submit Request'}
              </motion.button>
              <motion.button
                type="button"
                className="button ghost"
                onClick={() => setShowLeaveForm(false)}
                style={{ borderColor: '#94a3b8', color: '#94a3b8' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                ✕ Cancel
              </motion.button>
            </div>
          </motion.form>
        )}

        {!loading && leaves.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(255, 255, 255, 1) 100%)' }}>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Note</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave, index) => (
                  <motion.tr
                    key={leave.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(20, 184, 166, 0.03)' }}
                  >
                    <td style={{ fontWeight: 600 }}>
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </td>
                    <td>{leave.reason}</td>
                    <td>
                      <motion.span
                        className={`badge status-${leave.status}`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {leave.status}
                      </motion.span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '14px' }}>{leave.admin_note || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && leaves.length === 0 && (
          <motion.p
            style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No leave requests yet. Click "Request Leave" to submit one! 🏖️
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

const StatCard: React.FC<{ title: string; value: number; color: string; icon: string }> = ({ title, value, color, icon }) => (
  <motion.div 
    className="card" 
    style={{ 
      textAlign: 'center', 
      borderTop: `3px solid ${color}`,
      background: `linear-gradient(135deg, ${color}10 0%, rgba(255, 255, 255, 1) 100%)`
    }}
    variants={fadeInUp}
    whileHover={{ 
      y: -8, 
      scale: 1.05,
      boxShadow: `0 25px 70px ${color}30`,
      borderTopWidth: '4px'
    }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <motion.div 
      style={{ fontSize: '32px', marginBottom: '8px' }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.2 }}
    >
      {icon}
    </motion.div>
    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>{title}</div>
    <motion.div 
      style={{ fontSize: '36px', fontWeight: 800, color }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      {value}
    </motion.div>
  </motion.div>
);

const HistoryTable: React.FC<{ records: AttendanceRecord[]; onCheckout: (id: string) => void }> = ({ records, onCheckout }) => {
  if (!records.length) return (
    <motion.p 
      style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      No attendance records yet. Start by checking in! 🚀
    </motion.p>
  );
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead>
          <tr style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(255, 255, 255, 1) 100%)' }}>
            <th>Date</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec, index) => {
            const open = !rec.check_out_time;
            return (
              <motion.tr 
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(20, 184, 166, 0.03)' }}
              >
                <td style={{ fontWeight: 600 }}>{new Date(rec.check_in_time).toLocaleDateString()}</td>
                <td style={{ color: '#14b8a6' }}>{new Date(rec.check_in_time).toLocaleTimeString()}</td>
                <td style={{ color: rec.check_out_time ? '#0d9488' : '#94a3b8' }}>
                  {rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString() : '—'}
                </td>
                <td>
                  <motion.span 
                    className={`badge status-${rec.status === 'present' ? 'present' : rec.status}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {rec.status}
                  </motion.span>
                </td>
                <td style={{ fontSize: '13px', color: '#64748b' }}>
                  {rec.latitude && rec.longitude ? (
                    <a
                      href={`https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#14b8a6', textDecoration: 'none' }}
                    >
                      📍 {rec.latitude.toFixed(4)}, {rec.longitude.toFixed(4)}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  <motion.button 
                    className="button ghost" 
                    disabled={!open} 
                    onClick={() => onCheckout(rec.id)}
                    style={{ 
                      fontSize: '12px', 
                      padding: '6px 14px',
                      borderColor: open ? '#14b8a6' : '#e2e8f0',
                      color: open ? '#14b8a6' : '#94a3b8'
                    }}
                    whileHover={open ? { scale: 1.05 } : {}}
                    whileTap={open ? { scale: 0.95 } : {}}
                  >
                    {open ? '🚪 Close' : '✓ Closed'}
                  </motion.button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
