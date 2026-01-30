import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, getDashboardPath } from '../context/AuthContext';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const authedUser = await signUp({ email, password, full_name: fullName, role });
      navigate(getDashboardPath(authedUser.role));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '-100px',
          right: '-100px',
          filter: 'blur(80px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          bottom: '-50px',
          left: '-50px',
          filter: 'blur(80px)'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 1 }}
      >
        {/* Shine effect overlay */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            pointerEvents: 'none',
            zIndex: 2
          }}
          animate={{
            left: ['-100%', '200%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut"
          }}
        />

        <motion.div 
          className="card"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 90px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3)',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ textAlign: 'center', marginBottom: '32px' }}
          >
            {/* Floating Worko Badge */}
            <motion.div
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '8px 24px',
                borderRadius: '50px',
                marginBottom: '20px',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            >
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 900, 
                background: 'linear-gradient(to right, #ffffff, #f0f0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                WORKO
              </span>
            </motion.div>
            
            <motion.div
              style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🎉
            </motion.div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '32px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 900,
              letterSpacing: '-0.5px'
            }}>Join Us Today!</h2>
            <p style={{ margin: '12px 0 0 0', color: '#64748b', fontSize: '15px' }}>Create your account and start tracking</p>
          </motion.div>

          <form className="form" onSubmit={handleSubmit}>
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span style={{ color: '#667eea', fontWeight: 600, fontSize: '14px' }}>Full Name</span>
              <motion.input 
                className="input" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="John Doe"
                style={{ marginTop: '6px' }}
                whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)' }}
              />
            </motion.label>
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <span style={{ color: '#667eea', fontWeight: 600, fontSize: '14px' }}>Email</span>
              <motion.input 
                className="input" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                style={{ marginTop: '6px' }}
                whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)' }}
              />
            </motion.label>
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span style={{ color: '#667eea', fontWeight: 600, fontSize: '14px' }}>Password</span>
              <motion.input 
                className="input" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                style={{ marginTop: '6px' }}
                whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)' }}
              />
            </motion.label>
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <span style={{ color: '#667eea', fontWeight: 600, fontSize: '14px' }}>Role</span>
              <motion.select 
                className="input" 
                value={role} 
                onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
                style={{ marginTop: '6px' }}
                whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)' }}
              >
                <option value="member">👤 Member</option>
                <option value="admin">👑 Admin</option>
              </motion.select>
            </motion.label>
            {error && (
              <motion.div 
                className="alert error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {error}
              </motion.div>
            )}
            <motion.button 
              className="button" 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '17px',
                fontWeight: 700,
                padding: '16px',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                letterSpacing: '0.5px'
              }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: '0 15px 40px rgba(102, 126, 234, 0.5), 0 0 30px rgba(118, 75, 162, 0.3)',
                y: -2
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {/* Button glow effect */}
              <motion.span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  pointerEvents: 'none'
                }}
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <span style={{ position: 'relative', zIndex: 1 }}>
                {loading ? '⏳ Creating Account...' : '🎯 Create Account'}
              </span>
            </motion.button>
          </form>
          <motion.p 
            style={{ textAlign: 'center', marginTop: '24px', color: '#64748b' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Already registered? <Link to="/login" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};
