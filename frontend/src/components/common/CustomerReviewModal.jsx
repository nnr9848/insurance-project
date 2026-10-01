import React, { useState } from 'react';
import { 
  Star, 
  X, 
  ShieldCheck, 
  HeartHandshake, 
  PhoneCall, 
  CheckCircle2, 
  Send,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { customerReviewService } from '../../services/api';

export default function CustomerReviewModal({ isOpen, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [policyType, setPolicyType] = useState('Health Insurance');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [city, setCity] = useState('Hyderabad');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { isPositive: boolean, message: string }
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isLowRating = rating <= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !reviewText.trim()) {
      setErrorMsg('Please enter your Name, Phone Number, and Feedback.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await customerReviewService.submitReview({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        policyType,
        rating,
        reviewTitle: reviewTitle.trim() || null,
        reviewText: reviewText.trim(),
        city: city.trim() || 'Hyderabad'
      });

      setSubmitResult({
        isPositive: res.isPositive,
        message: res.message
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not submit your review. Please try again or call our helpline.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitResult(null);
    setErrorMsg('');
    setRating(5);
    setReviewText('');
    setReviewTitle('');
    onClose();
  };

  return (
    <div 
      className="review-modal-backdrop"
      onClick={handleResetAndClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="review-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isLowRating ? '#fff7ed' : '#f8fafc',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          transition: 'background 0.3s ease'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              {isLowRating ? 'We Value Your Feedback & Resolution' : 'Rate Your Experience with Aadhiraksha'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {isLowRating 
                ? 'Your feedback helps us resolve any inconvenience immediately.' 
                : 'Help others choose the right protection with your verified review.'}
            </p>
          </div>

          <button
            onClick={handleResetAndClose}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>

          {submitResult ? (
            /* Submission Result State */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              {submitResult.isPositive ? (
                <div>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.2rem',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.2)'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                    Thank You for Your 5-Star Trust!
                  </h4>
                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    Your review has been verified and published on our platform. Honest experiences like yours empower families across India to choose dependable insurance.
                  </p>

                  {/* Google Review Booster Card */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    border: '1.5px solid #a7f3d0',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    </div>
                    <p style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-navy)', margin: '0 0 10px' }}>
                      Would you mind taking 30 seconds to paste this on our Google Business Profile too?
                    </p>
                    <a
                      href="https://maps.google.com/?q=Aadhiraksha+Insurance+Marketing+ECIL+Hyderabad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="google-review-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#1a73e8',
                        color: '#ffffff',
                        padding: '10px 20px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.25)'
                      }}
                    >
                      Share on Google Reviews <ExternalLink size={15} />
                    </a>
                  </div>

                  <button
                    onClick={handleResetAndClose}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      color: 'var(--primary-navy)',
                      padding: '10px 24px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Negative Rating Interception Result */
                <div>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#fff7ed',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.2rem',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.2)'
                  }}>
                    <HeartHandshake size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9a3412', marginBottom: '8px' }}>
                    We Apologize & Will Make This Right
                  </h4>
                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5, maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                    Your grievance has been logged directly with our <strong>Senior Customer Grievance & Escalations Desk</strong>. A senior support specialist will call you at <strong>{customerPhone}</strong> within 2 business hours.
                  </p>

                  <div style={{
                    background: '#fffbeb',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid #fde68a',
                    marginBottom: '1.5rem',
                    textAlign: 'left',
                    fontSize: '0.84rem',
                    color: '#92400e'
                  }}>
                    <strong>Direct Hotline:</strong> Need immediate assistance? Call our Senior Manager directly at <a href="tel:+918367415156" style={{ fontWeight: 800, color: '#b45309' }}>+91 8367415156</a>.
                  </div>

                  <button
                    onClick={handleResetAndClose}
                    style={{
                      background: 'var(--primary-navy)',
                      border: 'none',
                      color: '#ffffff',
                      padding: '10px 24px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Close Window
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Review Entry Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Interactive Star Rating Selector */}
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                  Select Your Overall Rating
                </span>
                <div style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const active = (hoverRating || rating) >= starVal;
                    return (
                      <button
                        type="button"
                        key={starVal}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          transform: (hoverRating || rating) === starVal ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.15s ease'
                        }}
                        aria-label={`${starVal} stars`}
                      >
                        <Star 
                          size={34} 
                          fill={active ? '#f59e0b' : 'none'} 
                          color={active ? '#f59e0b' : '#cbd5e1'} 
                        />
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.82rem', fontWeight: 700, color: isLowRating ? '#ea580c' : '#059669' }}>
                  {rating === 5 && 'Outstanding Experience! ★★★★★'}
                  {rating === 4 && 'Very Good Service ★★★★☆'}
                  {rating === 3 && 'Average — Let us know what went wrong ★★★☆☆'}
                  {rating === 2 && 'Disappointed — We want to fix this ★★☆☆☆'}
                  {rating === 1 && 'Unacceptable — Escalate to Senior Management ★☆☆☆☆'}
                </div>
              </div>

              {/* Negative Feedback Interception Banner */}
              {isLowRating && (
                <div style={{
                  background: '#fff7ed',
                  border: '1px solid #fdba74',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <AlertCircle size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.82rem', color: '#9a3412', lineHeight: 1.4 }}>
                    <strong>We are deeply committed to 100% customer satisfaction.</strong> Please tell us what happened so our Senior Resolution Team can contact you directly and make things right.
                  </div>
                </div>
              )}

              {/* Policy Type & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Policy / Service *
                  </label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      background: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Family Health Floater">Family Health Floater</option>
                    <option value="Term Life Insurance">Term Life Insurance</option>
                    <option value="Car Insurance">Car Insurance</option>
                    <option value="Two Wheeler Insurance">Two Wheeler Insurance</option>
                    <option value="Senior Citizen Health">Senior Citizen Health</option>
                    <option value="Claim Support Desk">Claim Support Desk</option>
                    <option value="Commercial / Business">Commercial / Business</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Your City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Hyderabad, Secunderabad"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Customer Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98480 12345"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Review Headline (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Headline / Short Summary (Optional)
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder={isLowRating ? 'Brief issue summary' : 'e.g. Excellent cashless claim support'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Review Body */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Detailed Experience / Feedback *
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={
                    isLowRating
                      ? 'Please describe the problem you faced so our senior manager can investigate and resolve it immediately...'
                      : 'Share what you liked most about our service, advisors, or claim assistance...'
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: isLowRating 
                    ? 'linear-gradient(135deg, #ea580c, #c2410c)' 
                    : 'linear-gradient(135deg, var(--primary-navy), var(--primary-navy-dark))',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                  marginTop: '4px'
                }}
              >
                {submitting ? (
                  'Submitting...'
                ) : isLowRating ? (
                  <>
                    <PhoneCall size={18} /> Submit for Urgent Manager Resolution
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Review & Rating
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Your contact details are strictly kept private and only used for verified buyer verification.
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
