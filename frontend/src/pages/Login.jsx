import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');
  const [contact, setContact] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect target
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register({
          username,
          password,
          email,
          role,
          contact,
          registrationNo
        });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setUsername('');
    setPassword('');
    setEmail('');
    setRole('student');
    setContact('');
    setRegistrationNo('');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 24px' }} className="animate-fade-in">
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Toggle Headers */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
          <button 
            type="button" 
            onClick={() => !isLogin && handleToggle()} 
            style={{ 
              background: 'none', border: 'none', fontSize: '20px', fontWeight: isLogin ? '700' : '500', 
              color: isLogin ? 'var(--sltc-blue)' : 'var(--text-muted)', cursor: 'pointer',
              borderBottom: isLogin ? '3px solid var(--sltc-blue)' : 'none', paddingBottom: '8px'
            }}
          >
            Log In
          </button>
          <button 
            type="button" 
            onClick={() => isLogin && handleToggle()} 
            style={{ 
              background: 'none', border: 'none', fontSize: '20px', fontWeight: !isLogin ? '700' : '500', 
              color: !isLogin ? 'var(--sltc-blue)' : 'var(--text-muted)', cursor: 'pointer',
              borderBottom: !isLogin ? '3px solid var(--sltc-blue)' : 'none', paddingBottom: '8px'
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              className="form-control" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g. jdoe" 
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="email">SLTC Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-control" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="e.g. jdoe@sltc.lk" 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="role">University Role</label>
                <select 
                  id="role" 
                  className="form-control" 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="security">Security Officer</option>
                  <option value="staff">Non-academic Staff</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="registrationNo">Registration / ID Number</label>
                <input 
                  type="text" 
                  id="registrationNo" 
                  className="form-control" 
                  value={registrationNo} 
                  onChange={e => setRegistrationNo(e.target.value)} 
                  placeholder="e.g. CIT-24-01-0369" 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact">Contact Number</label>
                <input 
                  type="text" 
                  id="contact" 
                  className="form-control" 
                  value={contact} 
                  onChange={e => setContact(e.target.value)} 
                  placeholder="e.g. +94 77 123 4567" 
                />
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? (
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
            ) : isLogin ? (
              <>
                <LogIn size={16} />
                <span>Log In</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <span onClick={handleToggle} style={{ color: 'var(--sltc-blue)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                Sign up here
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span onClick={handleToggle} style={{ color: 'var(--sltc-blue)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                Log in here
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
