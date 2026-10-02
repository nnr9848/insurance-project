import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Phone, Shield, ArrowRight, CheckCircle2, KeyRound, Smartphone, RefreshCw, MessageSquare } from 'lucide-react';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function Login({ isAdminPortal = false }) {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Customer portal default is 'otp' (Fast SMS verification). Admin portal is strictly 'password'
  const [authMode, setAuthMode] = useState(isAdminPortal ? 'password' : 'otp');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'verify'
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const otpInputRefs = useRef([]);
  const recaptchaVerifierRef = useRef(null);

  const { login, register, firebaseLogin } = useAuth();
  const navigate = useNavigate();

  // Reset default authMode if isAdminPortal changes
  useEffect(() => {
    setAuthMode(isAdminPortal ? 'password' : 'otp');
  }, [isAdminPortal]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Clean up recaptcha verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handlePostLoginRedirect = (user) => {
    const hasCrmAccess = user?.roles?.some(r => [
      'ROLE_SUPER_ADMIN', 
      'ROLE_ADMIN', 
      'ROLE_MANAGER', 
      'ROLE_ADVISOR', 
      'ROLE_STAFF', 
      'ROLE_POSP_AGENT'
    ].includes(r));

    if (redirectUrl) {
      navigate(redirectUrl);
    } else if (hasCrmAccess) {
      navigate('/admin');
    } else {
      navigate('/my-account');
    }
  };

  const setupRecaptcha = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved - will proceed with submit
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try sending OTP again.');
        }
      });
    }
    return recaptchaVerifierRef.current;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const rawPhone = phoneNumber.trim().replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+91${rawPhone}`;
      const appVerifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpStep('verify');
      setCountdown(30);
    } catch (err) {
      console.error('Firebase Phone Auth error:', err);
      if (err?.code === 'auth/invalid-app-credential' || err?.code === 'auth/api-key-not-valid') {
        setError('Firebase project keys not yet configured in .env. Falling back to Password Sign-In.');
      } else {
        setError(err?.message || 'Failed to send OTP. Please try again.');
      }
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (_) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto advance focus
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('OTP session expired. Please request a new OTP.');
      }

      const userCredential = await confirmationResult.confirm(code);
      const idToken = await userCredential.user.getIdToken();

      // Submit Firebase token to Spring Boot backend
      const res = await firebaseLogin({
        idToken,
        fullName: fullName || undefined,
        role: role || 'ROLE_USER'
      });

      handlePostLoginRedirect(res);
    } catch (err) {
      console.error('OTP Verification error:', err);
      setError(err?.response?.data?.message || err?.message || 'Invalid OTP code. Please re-enter.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const user = await register({ fullName, email, phoneNumber, password, role });
        handlePostLoginRedirect(user);
      } else {
        const user = await login(identifier, password);
        handlePostLoginRedirect(user);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', background: '#f8fafc', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div style={{
          background: '#fff',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: isAdminPortal 
                ? 'linear-gradient(135deg, #0f172a, #1e293b)' 
                : 'linear-gradient(135deg, var(--primary-navy), #1e3a8a)',
              color: isAdminPortal ? '#38bdf8' : 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-navy)'
            }}>
              <Shield size={28} />
            </div>
            
            {isAdminPortal ? (
              <>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  background: '#f1f5f9', 
                  color: '#334155', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  letterSpacing: '0.5px', 
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  🔒 Internal Staff Portal
                </div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-navy)', fontWeight: 800 }}>
                  Employee Sign In
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Restricted to Super Admins, Branch Managers, Advisors & POSP staff
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--primary-navy)', fontWeight: 800 }}>
                  {authMode === 'otp' ? 'Customer Sign In' : (isRegister ? 'Create an Account' : 'Policyholder Login')}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {authMode === 'otp' 
                    ? 'Instant 1-tap OTP verification to access your digital policy vault'
                    : 'Manage your active insurance policies, renewals & claims'
                  }
                </p>
              </>
            )}
          </div>

          {/* Mode Switcher Tabs: Shown for customer login so users can pick OTP vs Password */}
          {!isAdminPortal && (
            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <button
                type="button"
                onClick={() => { setAuthMode('otp'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: authMode === 'otp' ? '#ffffff' : 'transparent',
                  color: authMode === 'otp' ? 'var(--primary-navy)' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: authMode === 'otp' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Smartphone size={16} color={authMode === 'otp' ? '#059669' : '#64748b'} />
                Mobile OTP (Fast)
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('password'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: authMode === 'password' ? '#ffffff' : 'transparent',
                  color: authMode === 'password' ? 'var(--primary-navy)' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: authMode === 'password' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <KeyRound size={16} color={authMode === 'password' ? '#2563eb' : '#64748b'} />
                Email & Password
              </button>
            </div>
          )}

          {/* Hidden reCAPTCHA container for Firebase */}
          <div id="recaptcha-container"></div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem', border: '1px solid #f87171' }}>
              {error}
            </div>
          )}

          {/* TAB 1: OTP FLOW (PolicyBazaar Style) */}
          {authMode === 'otp' && (
            <div>
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Mobile Number *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        position: 'absolute',
                        left: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--primary-navy)',
                        pointerEvents: 'none'
                      }}>
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Enter 10-digit mobile"
                        className="form-input"
                        style={{ paddingLeft: '68px', fontSize: '1rem', letterSpacing: '0.5px' }}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      We'll send an official OTP verification code via SMS
                    </span>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Full Name (Optional for first-time login)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Login As
                    </label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="ROLE_USER">Customer / Policyholder</option>
                      <option value="ROLE_POSP_AGENT">Certified POSP Partner</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneNumber.length !== 10}
                    className="btn-submit-quote"
                    style={{ marginTop: '1.25rem', width: '100%' }}
                  >
                    {loading ? 'Sending OTP via SMS...' : (
                      <>
                        Get OTP Code <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* OTP Verification Step */
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.88rem', color: '#475569' }}>
                      Enter 6-digit code sent to <strong style={{ color: 'var(--primary-navy)' }}>+91 {phoneNumber}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOtpStep('phone'); setOtpCode(['', '', '', '', '', '']); }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-gold-hover)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                    >
                      Change Number
                    </button>
                  </div>

                  {/* 6 Digit Box Inputs */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        style={{
                          width: '46px',
                          height: '52px',
                          textAlign: 'center',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          borderRadius: '10px',
                          border: digit ? '2px solid #059669' : '1px solid #cbd5e1',
                          background: digit ? '#ecfdf5' : '#ffffff',
                          color: 'var(--primary-navy)',
                          outline: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.some(d => !d)}
                    className="btn-submit-quote"
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Verifying OTP...' : 'Verify & Continue'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {countdown > 0 ? (
                      <span>Resend OTP in <strong>{countdown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <RefreshCw size={13} /> Resend OTP Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: PASSWORD FLOW (Original & Admin/Staff) */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
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

              <button type="submit" disabled={loading} className="btn-submit-quote" style={{ marginTop: '1.25rem', width: '100%' }}>
                {loading ? 'Authenticating...' : (
                  <>
                    {isRegister ? 'Complete Registration' : 'Sign In to Dashboard'} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Account Registration Link - Only for public Customer Portal */}
          {!isAdminPortal && (
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
          )}



          {/* Cross-Portal Switcher Link */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#64748b'
          }}>
            {isAdminPortal ? (
              <span>
                Looking for policyholder services?{' '}
                <Link to="/login" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                  Switch to Customer Login →
                </Link>
              </span>
            ) : (
              <span>
                Are you an employee or advisor?{' '}
                <Link to="/admin/login" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                  Internal Staff Portal →
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
