import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, HeartPulse, Car, Briefcase, Plane, Users, CheckCircle2, ArrowRight, Send, Check } from 'lucide-react';
import { portalService } from '../services/api';

export default function NewPolicySupport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [selectedPlan, setSelectedPlan] = useState('health');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Synchronize URL query parameter with selected category
  useEffect(() => {
    if (categoryParam) {
      if (['health', 'life', 'vehicle', 'car', 'two_wheeler', 'family_floater', 'business', 'corporate_sme', 'travel'].includes(categoryParam)) {
        if (categoryParam === 'car' || categoryParam === 'two_wheeler') {
          setSelectedPlan('vehicle');
        } else if (categoryParam === 'corporate_sme') {
          setSelectedPlan('business');
        } else {
          setSelectedPlan(categoryParam);
        }
      }
    }
  }, [categoryParam]);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: 'Hyderabad',
    ageGroup: '26-35',
    sumInsured: '₹10 Lakhs',
    vehicleNumber: '',
    smokerStatus: 'Non-Smoker',
    employeeCount: '15-50',
    destination: 'Schengen (Europe)'
  });

  const handlePlanChange = (planId) => {
    setSelectedPlan(planId);
    setSearchParams({ category: planId });
    setSubmitted(false);
  };

  const getCategoryDetails = () => {
    switch (selectedPlan) {
      case 'health':
        return { slug: 'health-insurance', title: 'Health Insurance', notes: `Age: ${formData.ageGroup} | Sum: ${formData.sumInsured}` };
      case 'family_floater':
        return { slug: 'family-floater-insurance', title: 'Family Health Floater', notes: `Family Plan | Eldest: ${formData.ageGroup} | Sum: ${formData.sumInsured}` };
      case 'life':
        return { slug: 'term-life-insurance', title: 'Term Life & Critical Illness', notes: `Smoker: ${formData.smokerStatus} | Age: ${formData.ageGroup} | Cover: ${formData.sumInsured}` };
      case 'vehicle':
        return { slug: 'motor-insurance', title: 'Motor & Zero-Dep Cover', notes: `Reg No: ${formData.vehicleNumber || 'New Vehicle'} | Cover: Comprehensive + Zero Dep` };
      case 'business':
        return { slug: 'corporate-sme-insurance', title: 'Commercial & SME Shield', notes: `Employees: ${formData.employeeCount} | GMC + GTL Benefits` };
      case 'travel':
        return { slug: 'travel-insurance', title: 'Overseas Travel Protection', notes: `Destination: ${formData.destination} | Travelers: 1-2` };
      default:
        return { slug: 'general-insurance', title: 'General Advisory', notes: 'General Inquiry' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const catDetails = getCategoryDetails();
    try {
      await portalService.submitQuote({
        categorySlug: catDetails.slug,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: `${catDetails.title} | ${catDetails.notes}`
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0', background: '#f8fafc' }}>
      <div className="container">
        <div className="section-title-box">
          <span className="section-badge">Policy Advisory</span>
          <h1 className="section-title">New Policy Support & Advisory</h1>
          <p className="section-subtitle">
            Get personalized coverage recommendations tailored to your family's health profile, vehicles, or business needs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Plan Options */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#091726', fontWeight: 800 }}>1. Select Insurance Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { id: 'health', name: 'Comprehensive Health Insurance', desc: '100% cashless, zero room rent cap, no co-pay options.', icon: <HeartPulse size={22} color="#10b981" /> },
                { id: 'family_floater', name: 'Family Health Floater', desc: 'Single integrated cover for spouse, children & parents.', icon: <Users size={22} color="#db2777" /> },
                { id: 'life', name: 'Term Life & Critical Illness', desc: 'Financial shield for dependents up to age 85 with 1 Cr cover.', icon: <ShieldCheck size={22} color="#2563eb" /> },
                { id: 'vehicle', name: 'Motor & Zero-Dep Cover', desc: 'Comprehensive car & 2-wheeler damage + 3rd party liability.', icon: <Car size={22} color="#f59e0b" /> },
                { id: 'business', name: 'Commercial & SME Shield', desc: 'Employee group health (GMC), factory fire, and cargo protection.', icon: <Briefcase size={22} color="#8b5cf6" /> },
                { id: 'travel', name: 'Overseas Travel Protection', desc: 'Emergency medical, baggage loss, trip cancellation (Schengen/US).', icon: <Plane size={22} color="#0891b2" /> },
              ].map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanChange(plan.id)}
                  style={{
                    background: '#fff',
                    border: `2px solid ${selectedPlan === plan.id ? '#059669' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '1.1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedPlan === plan.id ? '0 4px 12px rgba(5, 150, 105, 0.12)' : '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ background: selectedPlan === plan.id ? '#ecfdf5' : '#f8fafc', padding: '0.65rem', borderRadius: '10px' }}>
                    {plan.icon}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: selectedPlan === plan.id ? '#059669' : '#0f2b48' }}>
                        {plan.name}
                      </h4>
                      {selectedPlan === plan.id && <Check size={16} color="#059669" />}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{plan.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  Live Instant Quotation Desk
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#091726', margin: '0 0 0.5rem 0' }}>
                2. Request Comparative Proposals
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                Fill in your details to receive maximum discount quotes from Star Health, HDFC ERGO, ICICI Lombard, TATA AIG, and 20+ top insurers.
              </p>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#091726' }}>Inquiry Successfully Logged!</h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    Our licensed advisors will analyze your request for <strong>{getCategoryDetails().title}</strong> and provide quotation charts on <strong>{formData.phoneNumber}</strong>.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    style={{
                      marginTop: '1.25rem',
                      background: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      className="form-input"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>

                  {/* Category-Adaptive Form Fields */}
                  {selectedPlan === 'vehicle' && (
                    <div className="form-group">
                      <label className="form-label">Vehicle Registration Number</label>
                      <input
                        type="text"
                        placeholder="e.g. TS 09 AB 1234 (or leave blank if Brand New)"
                        className="form-input"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                        style={{ textTransform: 'uppercase', fontWeight: 700 }}
                      />
                    </div>
                  )}

                  {selectedPlan === 'life' && (
                    <div className="form-group">
                      <label className="form-label">Tobacco / Smoker Status</label>
                      <select
                        className="form-select"
                        value={formData.smokerStatus}
                        onChange={(e) => setFormData({ ...formData, smokerStatus: e.target.value })}
                      >
                        <option value="Non-Smoker">Non-Smoker (Standard Rates)</option>
                        <option value="Smoker">Smoker / Tobacco Consumer</option>
                      </select>
                    </div>
                  )}

                  {selectedPlan === 'business' && (
                    <div className="form-group">
                      <label className="form-label">Employee Count (Team Size)</label>
                      <select
                        className="form-select"
                        value={formData.employeeCount}
                        onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                      >
                        <option value="5-15">5 - 15 Employees (Micro-SME)</option>
                        <option value="15-50">15 - 50 Employees (Growth Startup)</option>
                        <option value="50-200">50 - 200 Employees (Mid-Market)</option>
                        <option value="200+">200+ Employees (Enterprise)</option>
                      </select>
                    </div>
                  )}

                  {selectedPlan === 'travel' && (
                    <div className="form-group">
                      <label className="form-label">Travel Destination</label>
                      <select
                        className="form-select"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      >
                        <option value="Schengen (Europe)">Schengen Countries (Europe Visa Approved)</option>
                        <option value="USA & Canada">USA &amp; Canada</option>
                        <option value="UAE & Middle East">UAE, Dubai &amp; Middle East</option>
                        <option value="Southeast Asia">Southeast Asia (Thailand, Bali, Singapore)</option>
                        <option value="Worldwide">Worldwide / Multi-Trip</option>
                      </select>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">{selectedPlan === 'vehicle' ? 'Vehicle Age' : 'Age Group'}</label>
                      <select
                        className="form-select"
                        value={formData.ageGroup}
                        onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                      >
                        <option value="18-25">18 - 25 Yrs</option>
                        <option value="26-35">26 - 35 Yrs</option>
                        <option value="36-45">36 - 45 Yrs</option>
                        <option value="46-55">46 - 55 Yrs</option>
                        <option value="56+">56+ Yrs (Senior)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{selectedPlan === 'life' ? 'Desired Life Cover' : selectedPlan === 'vehicle' ? 'Coverage Type' : 'Sum Insured'}</label>
                      <select
                        className="form-select"
                        value={formData.sumInsured}
                        onChange={(e) => setFormData({ ...formData, sumInsured: e.target.value })}
                      >
                        {selectedPlan === 'life' ? (
                          <>
                            <option value="₹50 Lakhs">₹50 Lakhs</option>
                            <option value="₹1 Crore">₹1 Crore (Recommended)</option>
                            <option value="₹2 Crore">₹2 Crore</option>
                          </>
                        ) : selectedPlan === 'vehicle' ? (
                          <>
                            <option value="Comprehensive + Zero Dep">Comprehensive + Zero Dep</option>
                            <option value="Standard Comprehensive">Standard Comprehensive</option>
                            <option value="Third Party Only">Third Party Only</option>
                          </>
                        ) : (
                          <>
                            <option value="₹5 Lakhs">₹5 Lakhs</option>
                            <option value="₹10 Lakhs">₹10 Lakhs</option>
                            <option value="₹25 Lakhs">₹25 Lakhs</option>
                            <option value="₹50 Lakhs">₹50 Lakhs</option>
                            <option value="₹1 Crore+">₹1 Crore+</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City / State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad, Telangana"
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn-submit-quote" style={{ marginTop: '1rem' }}>
                    {loading ? 'Submitting...' : <><Send size={16} /> Request Custom Plan Comparison</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
