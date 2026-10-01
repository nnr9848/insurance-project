import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Save, 
  X,
  Send,
  Eye,
  RefreshCw,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { customerReviewService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CustomerReviewsAdminView() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'INTERNAL_ESCALATION' | 'PUBLISHED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Review for Modal / Drawer
  const [selectedReview, setSelectedReview] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState('PUBLISHED');
  const [saving, setSaving] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await customerReviewService.getAllReviewsAdmin();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load reviews for admin:', err);
      showToast('Could not load reviews: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openReviewDetails = (rev) => {
    setSelectedReview(rev);
    setResolutionNotes(rev.resolutionNotes || '');
    setAdminResponse(rev.adminResponse || '');
    setNewStatus(rev.status || 'PUBLISHED');
  };

  const handleSaveResolution = async () => {
    if (!selectedReview) return;
    try {
      setSaving(true);
      await customerReviewService.updateReviewStatus(selectedReview.id, {
        status: newStatus,
        resolutionNotes,
        adminResponse
      });
      showToast('Review updated and resolution saved successfully!', 'success');
      setSelectedReview(null);
      fetchReviews();
    } catch (err) {
      showToast('Failed to update review: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      r.customerName?.toLowerCase().includes(query) ||
      r.customerPhone?.includes(query) ||
      r.policyType?.toLowerCase().includes(query) ||
      r.reviewText?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const escalationsCount = reviews.filter((r) => r.status === 'INTERNAL_ESCALATION').length;
  const publishedCount = reviews.filter((r) => r.status === 'PUBLISHED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Urgent Escalations (Negative reviews intercepted before Google) */}
        <div style={{
          background: escalationsCount > 0 ? '#fff7ed' : '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: escalationsCount > 0 ? '1.5px solid #fdba74' : '1px solid var(--border-subtle)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
              Intercepted Grievances
            </span>
            <AlertCircle size={20} color="#ea580c" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#9a3412' }}>
            {escalationsCount}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#c2410c' }}>
            {escalationsCount > 0 
              ? 'Urgent: Unsatisfied customers intercepted before posting on Google!' 
              : 'Zero active grievances pending resolution.'}
          </p>
        </div>

        {/* Published Reviews */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
              Published Social Proof
            </span>
            <CheckCircle2 size={20} color="#059669" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-navy)' }}>
            {publishedCount}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Public testimonials showcased on website homepage
          </p>
        </div>

        {/* Total Reviews */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-navy)', textTransform: 'uppercase' }}>
              Total Submissions
            </span>
            <Star size={20} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-navy)' }}>
            {reviews.length}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            Ratings submitted directly by portal visitors
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by customer name, phone, or feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterStatus === 'ALL' ? '1.5px solid var(--primary-navy)' : '1px solid var(--border-subtle)',
              background: filterStatus === 'ALL' ? 'var(--primary-navy)' : '#ffffff',
              color: filterStatus === 'ALL' ? '#ffffff' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            All ({reviews.length})
          </button>

          <button
            onClick={() => setFilterStatus('INTERNAL_ESCALATION')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterStatus === 'INTERNAL_ESCALATION' ? '1.5px solid #ea580c' : '1px solid var(--border-subtle)',
              background: filterStatus === 'INTERNAL_ESCALATION' ? '#ea580c' : '#ffffff',
              color: filterStatus === 'INTERNAL_ESCALATION' ? '#ffffff' : '#ea580c',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚠️ Escalations ({escalationsCount})
          </button>

          <button
            onClick={() => setFilterStatus('PUBLISHED')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterStatus === 'PUBLISHED' ? '1.5px solid #059669' : '1px solid var(--border-subtle)',
              background: filterStatus === 'PUBLISHED' ? '#059669' : '#ffffff',
              color: filterStatus === 'PUBLISHED' ? '#ffffff' : '#059669',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Published ({publishedCount})
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-navy)' }}>CUSTOMER</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-navy)' }}>RATING</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-navy)' }}>POLICY</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-navy)' }}>FEEDBACK</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-navy)' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-navy)' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    No customer reviews found matching your search.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((rev) => {
                  const isEscalation = rev.status === 'INTERNAL_ESCALATION';
                  return (
                    <tr 
                      key={rev.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        background: isEscalation ? 'rgba(255, 247, 237, 0.5)' : '#ffffff',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Customer Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.9rem' }}>
                          {rev.customerName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={12} /> {rev.customerPhone}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {rev.city || 'Hyderabad'}
                        </div>
                      </td>

                      {/* Rating */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < rev.rating ? '#f59e0b' : '#e2e8f0'} 
                              color={i < rev.rating ? '#f59e0b' : '#e2e8f0'} 
                            />
                          ))}
                        </div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: rev.rating >= 4 ? '#059669' : '#ea580c',
                          display: 'block',
                          marginTop: '2px'
                        }}>
                          {rev.rating} / 5 Stars
                        </span>
                      </td>

                      {/* Policy */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: 'var(--primary-navy)',
                          whiteSpace: 'nowrap'
                        }}>
                          {rev.policyType}
                        </span>
                      </td>

                      {/* Feedback Text */}
                      <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                        {rev.reviewTitle && (
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.84rem', marginBottom: '2px' }}>
                            "{rev.reviewTitle}"
                          </div>
                        )}
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#475569',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {rev.reviewText}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {rev.status === 'PUBLISHED' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#ecfdf5',
                            color: '#059669',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '9999px'
                          }}>
                            <CheckCircle2 size={12} /> Published
                          </span>
                        )}
                        {rev.status === 'INTERNAL_ESCALATION' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#fff7ed',
                            color: '#ea580c',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            border: '1px solid #fdba74'
                          }}>
                            <AlertCircle size={12} /> Needs Call
                          </span>
                        )}
                        {rev.status === 'REJECTED' && (
                          <span style={{
                            background: '#f1f5f9',
                            color: '#94a3b8',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '9999px'
                          }}>
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => openReviewDetails(rev)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isEscalation ? '#ea580c' : 'var(--primary-navy)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={14} /> Resolve / Moderate
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Moderation & Grievance Resolution Modal */}
      {selectedReview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Customer Review Moderation & Grievance
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Review ID: #{selectedReview.id} • Submitted by {selectedReview.customerName}
                </span>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Details Box */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <strong style={{ color: 'var(--primary-navy)', fontSize: '0.92rem' }}>{selectedReview.customerName}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedReview.city || 'Hyderabad'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <a
                    href={`tel:${selectedReview.customerPhone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#ecfdf5',
                      color: '#059669',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textDecoration: 'none'
                    }}
                  >
                    <Phone size={14} /> Call {selectedReview.customerPhone}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill={i < selectedReview.rating ? '#f59e0b' : '#e2e8f0'} color={i < selectedReview.rating ? '#f59e0b' : '#e2e8f0'} />
                ))}
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: selectedReview.rating >= 4 ? '#059669' : '#ea580c' }}>
                  ({selectedReview.rating} / 5 Stars)
                </span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 'auto' }}>
                  {selectedReview.policyType}
                </span>
              </div>

              {selectedReview.reviewTitle && (
                <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.88rem', marginBottom: '4px' }}>
                  "{selectedReview.reviewTitle}"
                </div>
              )}
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                {selectedReview.reviewText}
              </p>
            </div>

            {/* Resolution Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px' }}>
                  Review Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="PUBLISHED">PUBLISHED (Visible to Public on Website)</option>
                  <option value="INTERNAL_ESCALATION">INTERNAL_ESCALATION (Private Grievance)</option>
                  <option value="REJECTED">REJECTED (Do Not Display)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px' }}>
                  Internal Grievance Resolution Notes (Staff Audit Log)
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record callback summary, customer satisfaction resolution, or next steps..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px' }}>
                  Official Public Admin Response (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="e.g. Thank you for your feedback! We are thrilled to protect your family..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveResolution}
                  style={{
                    background: 'var(--primary-navy)',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Resolution'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
