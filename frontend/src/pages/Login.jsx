import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Phone, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('admin@aadhiraksha.com');
  const [password, setPassword] = useState('Admin@12345');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({ fullName, email, phoneNumber, password, role });
        navigate('/');
      } else {
        const user = await login(identifier, password);
        const hasCrmAccess = user?.roles?.some(r => [
          'ROLE_SUPER_ADMIN', 
          'ROLE_ADMIN', 
          'ROLE_MANAGER', 
          'ROLE_ADVISOR', 
          'ROLE_STAFF', 
          'ROLE_POSP_AGENT'
        ].includes(r));

        if (hasCrmAccess) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '4rem 0', background: '#f8fafc', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div style={{
          background: '#fff',
          padding: '2.5rem',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary-navy), #1e3a8a)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-navy)'
            }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-navy)' }}>
              {isRegister ? 'Create an Account' : 'Portal Sign In'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Access POSP partner desk, policy tracking & staff management
            </p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid #f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    className="form-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="ROLE_USER">Customer / Policyholder</option>
                    <option value="ROLE_POSP_AGENT">POSP Insurance Agent</option>
                  </select>
                </div>
              </>
            )}

            {!isRegister && (
              <div className="form-group">
                <label className="form-label">Email or Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="admin@aadhiraksha.com or phone"
                  className="form-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit-quote" style={{ marginTop: '1.25rem' }}>
              {loading ? 'Authenticating...' : (
                <>
                  {isRegister ? 'Complete Registration' : 'Sign In to Dashboard'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  style={{ color: 'var(--accent-gold-hover)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account yet?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  style={{ color: 'var(--accent-gold-hover)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Register Now
                </button>
              </span>
            )}
          </div>

          {!isRegister && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1.1rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⚡ Quick Demo Logins
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1-Tap to Autofill</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { role: 'Super Admin', email: 'admin@aadhiraksha.com', pass: 'Admin@12345', badge: '👑 Admin' },
                  { role: 'Branch Manager', email: 'manager@aadhiraksha.com', pass: 'Manager@12345', badge: '👔 Manager' },
                  { role: 'Insurance Advisor', email: 'advisor@aadhiraksha.com', pass: 'Advisor@12345', badge: '🎯 Advisor' },
                  { role: 'POSP Agent', email: 'posp@aadhiraksha.com', pass: 'Posp@12345', badge: '🤝 POSP Partner' },
                  { role: 'Customer', email: 'customer@aadhiraksha.com', pass: 'Customer@12345', badge: '👤 Client' }
                ].map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIdentifier(demo.email);
                      setPassword(demo.pass);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      border: identifier === demo.email ? '1.5px solid #059669' : '1px solid #cbd5e1',
                      background: identifier === demo.email ? '#ecfdf5' : '#ffffff',
                      color: identifier === demo.email ? '#065f46' : '#334155',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Click to fill: ${demo.email}`}
                  >
                    {demo.badge}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: '#64748b' }}>
                Selected: <code>{identifier}</code> | Password: <code>{password}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
