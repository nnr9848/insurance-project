import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, HeartPulse, Car, Briefcase, Plane, Banknote, CheckCircle, Send, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { portalService } from '../services/api';

import familyHero from '../assets/slides/family_hero.png';
import healthHero from '../assets/slides/health_hero.jpg';
import vehicleHero from '../assets/slides/vehicle_hero.jpg';
import businessHero from '../assets/slides/business_hero.jpg';
import businessTravelHero from '../assets/slides/business_travel_hero.jpg';
import loansHero from '../assets/slides/loans_hero.jpg';

const slides = [
  {
    badge: 'Life & Family',
    title: 'Comprehensive Family Protection',
    desc: 'Shield your family against unforeseen financial risks with high-value coverage and guaranteed security.',
    image: familyHero,
    categorySlug: 'life-insurance',
    highlight: '₹1 Crore Cover from ₹490/month*'
  },
  {
    badge: 'Health & Wellness',
    title: '100% Cashless Health Care',
    desc: 'Instant coverage across 10,000+ empanelled hospitals with zero waiting hassles and 24x7 desk support.',
    image: healthHero,
    categorySlug: 'health-insurance',
    highlight: 'No Room Rent Capping & Free Health Checkups'
  },
  {
    badge: 'Vehicle & Motor',
    title: 'Zero-Depreciation Vehicle Insurance',
    desc: 'Instant cashless accident repairs, engine protection, and 24x7 pan-India roadside assistance.',
    image: vehicleHero,
    categorySlug: 'vehicle-insurance',
    highlight: 'Save up to 85% with Instant Policy Delivery'
  },
  {
    badge: 'Corporate & SME',
    title: 'Commercial & Corporate Protection',
    desc: 'Group health, commercial property, marine cargo, and comprehensive liability shields for business growth.',
    image: businessHero,
    categorySlug: 'business-insurance',
    highlight: 'Tailored B2B Policies for Startups & Enterprises'
  },
  {
    badge: 'Overseas Travel',
    title: 'International Travel Protection',
    desc: 'Global protection against flight disruptions, emergency hospitalization, and baggage delay.',
    image: businessTravelHero,
    categorySlug: 'travel-insurance',
    highlight: 'Schengen & Worldwide Medical Emergency Shield'
  },
  {
    badge: 'Loans & Finance',
    title: 'Fast Loan Approvals & Financing',
    desc: 'Lowest interest benchmarking on Personal, Home, MSME, and Loan Against Property.',
    image: loansHero,
    categorySlug: 'loans',
    highlight: 'Disbursal in as fast as 24-48 hours'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('health-insurance');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: '',
    coverageAmount: '₹10 Lakhs'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileFormExpanded, setIsMobileFormExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await portalService.submitQuote({
        categorySlug: selectedCategory,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        planDetails: JSON.stringify({ coverageAmount: formData.coverageAmount })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Quote submission error', err);
      alert('Error submitting inquiry. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const slide = slides[currentSlide];

  return (
    <section className="hero-split-section">
      <div className="container">
        <div className="hero-split-grid">
          {/* Left: Interactive Carousel Card with Image BG */}
          <div className="hero-slider-card">
            <div className="hero-slider-img-container">
              <img 
                src={slide.image} 
                alt={slide.title} 
                key={slide.image}
              />
            </div>
            <div className="hero-slider-overlay">
              <span className="hero-badge">{slide.badge}</span>
              <h2 className="hero-slider-title">{slide.title}</h2>
              <p className="hero-slider-desc">{slide.desc}</p>
              
              <div className="hero-slider-highlight" style={{
                background: 'rgba(15, 23, 42, 0.75)',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                width: 'fit-content',
                maxWidth: 'max-content',
                gap: '0.5rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#fef08a'
              }}>
                <CheckCircle size={16} />
                {slide.highlight}
              </div>

              <div className="slider-controls">
                <div className="slider-dots">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="slider-arrow-btn" onClick={handlePrev} aria-label="Previous">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="slider-arrow-btn" onClick={handleNext} aria-label="Next">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Instant Quote Inquiry Form (Collapsible Accordion on Mobile, Always Visible on Desktop) */}
          <div className={`hero-quote-card ${isMobileFormExpanded ? 'mobile-expanded' : 'mobile-collapsed'}`}>
            <div 
              className="quote-card-header"
              onClick={() => setIsMobileFormExpanded(!isMobileFormExpanded)}
            >
              <div className="quote-header-title-row">
                <h3>Get Instant Quote & Callback</h3>
                <button 
                  type="button" 
                  className="quote-accordion-toggle-btn"
                  aria-label="Toggle Quick Quote Form"
                >
                  {isMobileFormExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              <p className="quote-header-desc">Compare India's leading insurers and save up to 40% on your premium.</p>
              
              {/* Mobile Collapsed Hint */}
              {!isMobileFormExpanded && (
                <div className="quote-collapsed-prompt">
                  <span>Tap to open fast quote inquiry</span>
                  <span className="prompt-action">Open Form <ChevronDown size={14} /></span>
                </div>
              )}
            </div>

            <div className="quote-card-body">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Inquiry Received!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Our dedicated insurance expert will contact you at <strong>{formData.phoneNumber}</strong> shortly with customized quotations.
                  </p>
                  <button 
                    onClick={() => { setSubmitted(false); setFormData({ fullName: '', phoneNumber: '', email: '', city: '', coverageAmount: '₹10 Lakhs' }); }}
                    className="btn-submit-quote"
                  >
                    Calculate Another Quote
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="quote-category-tabs">
                    <button
                      type="button"
                      className={`category-tab ${selectedCategory === 'health-insurance' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('health-insurance')}
                    >
                      🏥 Health
                    </button>
                    <button
                      type="button"
                      className={`category-tab ${selectedCategory === 'life-insurance' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('life-insurance')}
                    >
                      🛡️ Life / Term
                    </button>
                    <button
                      type="button"
                      className={`category-tab ${selectedCategory === 'vehicle-insurance' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('vehicle-insurance')}
                    >
                      🚗 Motor
                    </button>
                    <button
                      type="button"
                      className={`category-tab ${selectedCategory === 'business-insurance' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('business-insurance')}
                    >
                      🏢 Business
                    </button>
                    <button
                      type="button"
                      className={`category-tab ${selectedCategory === 'travel-insurance' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('travel-insurance')}
                    >
                      ✈️ Travel
                    </button>
                    <button
                      type="button"
                      className={`category-tab ${selectedCategory === 'loans' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('loans')}
                    >
                      💰 Loans
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="form-input"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        className="form-input"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hyderabad"
                        className="form-input"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Desired Cover / Loan Sum</label>
                    <select
                      className="form-select"
                      value={formData.coverageAmount}
                      onChange={(e) => setFormData({ ...formData, coverageAmount: e.target.value })}
                    >
                      <option value="₹5 Lakhs">₹5 Lakhs Coverage</option>
                      <option value="₹10 Lakhs">₹10 Lakhs Coverage (Most Popular)</option>
                      <option value="₹25 Lakhs">₹25 Lakhs Super Cover</option>
                      <option value="₹50 Lakhs">₹50 Lakhs Premium Shield</option>
                      <option value="₹1 Crore+">₹1 Crore+ Term / Loan</option>
                    </select>
                  </div>

                  <button type="submit" disabled={loading} className="btn-submit-quote">
                    {loading ? 'Processing...' : (
                      <>
                        <Send size={16} /> Get Free Best Quotes
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
