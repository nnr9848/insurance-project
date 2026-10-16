import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Phone, RefreshCw, X, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { portalService } from '../../services/api';

/**
 * GatedOtpModal
 * A crisp, strict gated OTP verification modal for all frontend quote/lead forms.
 * Rule 10 Compliant: Zero backdrop blur; uses solid, readable rgba(15, 23, 42, 0.65) overlay.
 */
export default function GatedOtpModal({
  isOpen,
  onClose,
  phoneNumber,
  onVerified,
  leadName = 'Customer',
  purposeText = 'instant quote and advisor consultation'
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && phoneNumber) {
      handleTriggerSendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phoneNumber]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && isOpen) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, isOpen]);

  if (!isOpen) return null;

  const cleanPhone = (phoneNumber || '').replace(/\D/g, '').slice(-10);

  const handleTriggerSendOtp = async () => {
    setErrorMsg('');
    setIsSending(true);
    setOtpDigits(['', '', '', '', '', '']);
    try {
      const res = await portalService.sendOtp(cleanPhone);
      setOtpSentMsg(res.message || `OTP sent to +91 ${cleanPhone}`);
      setCountdown(60);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const nextDigits = [...otpDigits];
    nextDigits[idx] = value.slice(-1);
    setOtpDigits(nextDigits);

    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-verify if all 6 digits are entered
    if (value && idx === 5) {
      const fullCode = nextDigits.join('');
      if (fullCode.length === 6) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const nextDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setOtpDigits(nextDigits);
    if (pasted.length === 6) {
      verifyCode(pasted);
    } else if (inputRefs.current[pasted.length]) {
      inputRefs.current[pasted.length].focus();
    }
  };

  const verifyCode = async (codeToVerify) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);
    try {
      const res = await portalService.verifyOtp(cleanPhone, code);
      if (res.success && res.verificationToken) {
        onVerified(res.verificationToken);
      } else {
        setErrorMsg('Invalid verification response. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data || 'Incorrect OTP code. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)', // Rule 10: Crisp solid transparent black overlay, zero blur
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '6px', borderRadius: '10px' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f2b48' }}>Verify Mobile Number</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Anti-Spam Genuine Lead Verification</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: 0, marginBottom: '1.25rem' }}>
            Hi <strong>{leadName}</strong>, to safeguard your request and unlock your {purposeText}, please enter the 6-digit OTP sent to:
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--primary-navy)" />
              <span style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                +91 {cleanPhone}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Change
            </button>
          </div>

          {/* 6 Digit Inputs */}
          <div 
            onPaste={handlePaste}
            style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.25rem' }}
          >
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e.target.value)}
                style={{
                  width: '46px',
                  height: '52px',
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--primary-navy)',
                  borderRadius: '10px',
                  border: digit ? '2px solid var(--primary-navy)' : '1.5px solid #cbd5e1',
                  background: digit ? '#f8faff' : '#ffffff',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            ))}
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {otpSentMsg && !errorMsg && (
            <div style={{
              fontSize: '0.75rem',
              color: '#059669',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              marginBottom: '1rem'
            }}>
              <CheckCircle2 size={14} />
              <span>{otpSentMsg} (Demo / Dev Master: 123456)</span>
            </div>
          )}

          {/* Verify Action Button */}
          <button
            type="button"
            onClick={() => verifyCode()}
            disabled={isVerifying || otpDigits.join('').length !== 6}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--primary-navy)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: isVerifying || otpDigits.join('').length !== 6 ? 'not-allowed' : 'pointer',
              opacity: isVerifying || otpDigits.join('').length !== 6 ? 0.65 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              marginBottom: '1rem'
            }}
          >
            {isVerifying ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Verifying Code...</span>
              </>
            ) : (
              <>
                <span>Verify & Get Instant Callback</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Resend Action & Validity Info */}
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
            {countdown > 0 ? (
              <div>
                <span>Resend code in <strong>{countdown >= 60 ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}` : `${countdown}s`}</strong></span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                  Code is valid for 5 minutes
                </span>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleTriggerSendOtp}
                  disabled={isSending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontWeight: 700,
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    padding: 0
                  }}
                >
                  {isSending ? 'Sending new code...' : 'Resend Code Now'}
                </button>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                  Code is valid for 5 minutes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
