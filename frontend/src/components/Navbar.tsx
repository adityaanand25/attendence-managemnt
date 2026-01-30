import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, getDashboardPath } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link 
        className="brand" 
        to={user ? getDashboardPath(user.role) : '/'}
        style={{ textDecoration: 'none' }}
      >
        <motion.div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '6px 16px',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
            animate={{
              boxShadow: [
                '0 4px 15px rgba(102, 126, 234, 0.3)',
                '0 6px 20px rgba(118, 75, 162, 0.4)',
                '0 4px 15px rgba(102, 126, 234, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span style={{ 
              fontSize: '20px', 
              fontWeight: 900, 
              background: 'linear-gradient(to right, #ffffff, #f0f0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '1.5px',
              textTransform: 'uppercase'
            }}>
              WORKO
            </span>
          </motion.div>
          <motion.span
            style={{ fontSize: '24px' }}
            animate={{ rotate: [0, 20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            💼
          </motion.span>
        </motion.div>
      </Link>
      <div className="nav-actions">
        {user ? (
          <>
            <span>{user.email}</span>
            <Link className="button ghost" to={getDashboardPath(user.role)}>Dashboard</Link>
            {user.role === 'admin' && (
              <Link className="button ghost" to="/admin">Admin</Link>
            )}
            <button className="button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="button ghost" to="/login">Login</Link>
            <Link className="button" to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};
