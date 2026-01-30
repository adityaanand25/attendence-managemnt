import React, { useEffect, useState } from 'react';
import { checkIn, checkOut, fetchMemberAttendance } from '../api/attendance';
import { AttendanceRecord, MemberAttendanceResponse } from '../types/api';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<MemberAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMemberAttendance();
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load attendance');
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
      await checkIn();
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Check-in failed');
    } finally {
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

  const openRecord = data?.attendance.find((r) => !r.check_out_time);

  return (
    <div className="layout">
      <div className="grid two">
        <div className="card">
          <h3>Your Status</h3>
          {loading && <p>Loading...</p>}
          {error && <div className="alert error">{error}</div>}
          {!loading && data && (
            <div className="grid">
              <div className="badge">Role: {data.role}</div>
              <div className="badge">Present: {data.stats.presentDays}</div>
              <div className="badge status-late">Late: {data.stats.lateDays}</div>
              <div className="badge status-absent">Absent: {data.stats.absentDays}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="button" onClick={handleCheckIn} disabled={actionLoading || Boolean(openRecord)}>
              {actionLoading ? 'Processing...' : openRecord ? 'Checked in' : 'Check in'}
            </button>
            <button
              className="button ghost"
              onClick={() => openRecord && handleCheckOut(openRecord.id)}
              disabled={actionLoading || !openRecord}
            >
              {actionLoading ? 'Processing...' : 'Check out'}
            </button>
            <button className="button ghost" onClick={load} disabled={loading}>Refresh</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Attendance History</h3>
        {loading && <p>Loading...</p>}
        {!loading && data && <HistoryTable records={data.attendance} onCheckout={handleCheckOut} />}
      </div>
    </div>
  );
};

const HistoryTable: React.FC<{ records: AttendanceRecord[]; onCheckout: (id: string) => void }> = ({ records, onCheckout }) => {
  if (!records.length) return <p>No attendance yet.</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Check-in</th>
          <th>Check-out</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec) => {
          const open = !rec.check_out_time;
          return (
            <tr key={rec.id}>
              <td>{new Date(rec.check_in_time).toLocaleDateString()}</td>
              <td>{new Date(rec.check_in_time).toLocaleTimeString()}</td>
              <td>{rec.check_out_time ? new Date(rec.check_out_time).toLocaleTimeString() : '—'}</td>
              <td>
                <span className={`badge status-${rec.status === 'present' ? 'present' : rec.status}`}>
                  {rec.status}
                </span>
              </td>
              <td>
                <button className="button ghost" disabled={!open} onClick={() => onCheckout(rec.id)}>
                  {open ? 'Close' : 'Closed'}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
