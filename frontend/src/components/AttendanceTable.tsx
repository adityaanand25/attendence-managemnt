import React from 'react';
import { AttendanceRecord } from '../types/api';

type Props = {
  records: AttendanceRecord[];
  onCheckout?: (id: string) => void;
};

export const AttendanceTable: React.FC<Props> = ({ records, onCheckout }) => {
  if (!records.length) return <p>No attendance yet.</p>;

  return (
    <div className="card">
      <h3>Attendance History</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            {onCheckout && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => {
            const open = !rec.check_out_time && onCheckout;
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
                {onCheckout && (
                  <td>
                    <button
                      className="button ghost"
                      disabled={!open}
                      onClick={() => onCheckout(rec.id)}
                    >
                      {open ? 'Check out' : 'Closed'}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
