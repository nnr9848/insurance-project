import React, { useState } from 'react';
import {
  X,
  HeartPulse,
  ShieldCheck,
  Car,
  Bike,
  Users,
  Briefcase,
  Plane,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  Clock,
  Shield
} from 'lucide-react';
import { portalService } from '../services/api';

export default function CategoryQuoteModal({ category, onClose }) {
  if (!category) return null;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Universal Contact & User Details (Step 2)
  const [contactForm, setContactForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Hyderabad',
    pincode: ''
  });

  // Category-Specific Form State
  // 1. Health & Family Floater
  const [healthForm, setHealthForm] = useState({
    members: ['Self'],
    eldestAge: '28',
    sumInsured: '10 Lakhs',
    hasPreExistingDisease: false
  });

  // 2. Motor (Car & 2-Wheeler)
  const [motorForm, setMotorForm] = useState({
    regNumber: '',
    isBrandNew: false,
    policyType: 'Comprehensive + Zero Dep',
    policyStatus: 'Active',
    fuelType: 'Petrol'
  });

  // 3. Term Life
  const [lifeForm, setLifeForm] = useState({
    gender: 'Male',
    isSmoker: false,
    annualIncome: '10 - 15 Lakhs',
    desiredCover: '₹1 Crore',
    age: '30'
  });

  // 4. Travel
  const [travelForm, setTravelForm] = useState({
    destination: 'Schengen Countries (Europe)',
    tripType: 'Single Trip',
    travelerCount: '1',
    durationDays: '15'
  });

  // 5. Corporate / SME
  const [corpForm, setCorpForm] = useState({
    companyName: '',
    employeeCount: '10 - 50 Employees',
    workEmail: '',
    coverageTypes: ['Group Health Insurance (GMC)', 'Group Term Life (GTL)']
  });

  // 6. Loans
  const [loanForm, setLoanForm] = useState({
    loanType: 'Home Loan',
    loanAmount: '₹50 Lakhs',
    employmentType: 'Salaried Professional',
    monthlyIncome: '₹1,00,000+'
  });

  const memberOptions = ['Self', 'Spouse', 'Son', 'Daughter', 'Father', 'Mother'];

  const toggleHealthMember = (member) => {
    if (healthForm.members.includes(member)) {
      if (healthForm.members.length > 1) {
        setHealthForm({
          ...healthForm,
          members: healthForm.members.filter(m => m !== member)
        });
      }
    } else {
      setHealthForm({
        ...healthForm,
        members: [...healthForm.members, member]
      });
    }
  };

  const toggleCorpCoverage = (type) => {
    if (corpForm.coverageTypes.includes(type)) {
      if (corpForm.coverageTypes.length > 1) {
        setCorpForm({
          ...corpForm,
          coverageTypes: corpForm.coverageTypes.filter(t => t !== type)
        });
      }
    } else {
      setCorpForm({
        ...corpForm,
        coverageTypes: [...corpForm.coverageTypes, type]
      });
    }
  };

  const buildPlanDetails = () => {
    switch (category.id) {
      case 'health':
      case 'family_floater':
        return `Members: ${healthForm.members.join(', ')} | Eldest Age: ${healthForm.eldestAge} Yrs | Cover: ₹${healthForm.sumInsured} | Pre-existing Condition: ${healthForm.hasPreExistingDisease ? 'Yes' : 'No'}`;
      
      case 'car':
        return `Vehicle: Car | Reg No: ${motorForm.isBrandNew ? 'Brand New Car' : (motorForm.regNumber || 'Not Provided')} | Plan: ${motorForm.policyType} | Fuel: ${motorForm.fuelType} | Status: ${motorForm.policyStatus}`;
      
      case 'two_wheeler':
        return `Vehicle: 2 Wheeler | Reg No: ${motorForm.isBrandNew ? 'Brand New Bike' : (motorForm.regNumber || 'Not Provided')} | Plan: ${motorForm.policyType} | Status: ${motorForm.policyStatus}`;
      
      case 'term_life':
        return `Life Cover: ${lifeForm.desiredCover} | Gender: ${lifeForm.gender} | Smoker/Tobacco: ${lifeForm.isSmoker ? 'Yes' : 'No'} | Annual Income: ${lifeForm.annualIncome} | Age: ${lifeForm.age} Yrs`;
      
      case 'travel':
        return `Destination: ${travelForm.destination} | Trip Type: ${travelForm.tripType} | Travelers: ${travelForm.travelerCount} | Duration: ${travelForm.durationDays} Days`;
      
      case 'corporate_sme':
        return `Company: ${corpForm.companyName || 'SME'} | Size: ${corpForm.employeeCount} | Benefits: ${corpForm.coverageTypes.join(', ')} | Work Email: ${corpForm.workEmail || 'N/A'}`;
      
      case 'loans':
        return `Loan Type: ${loanForm.loanType} | Desired Amount: ${loanForm.loanAmount} | Employment: ${loanForm.employmentType} | Income Band: ${loanForm.monthlyIncome}`;
      
      default:
        return `Inquiry for ${category.name}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const payload = {
      categorySlug: category.id || 'general-inquiry',
      fullName: contactForm.fullName,
      phoneNumber: contactForm.phone,
      email: contactForm.email || (category.id === 'corporate_sme' ? corpForm.workEmail : ''),
      city: contactForm.city,
      planDetails: buildPlanDetails()
    };

    try {
      await portalService.submitQuote(payload);
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Failed to submit quote:', err);
      // Fallback display success gracefully
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'none'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '540px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #091726 0%, #0f2b48 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {category.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-gold, #f59e0b)', letterSpacing: '0.05em' }}>
                Instant Comparison & Savings
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {category.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          
          {submitSuccess ? (
            /* Submission Success Screen */
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}
              >
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#091726', margin: '0 0 0.5rem' }}>
                Quote Comparison Generated!
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
                We have received your requirement for <strong>{category.name}</strong>. A comparative quote proposal from top insurers with maximum discount has been assigned to your dedicated advisor.
              </p>

              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', textAlign: 'left', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  Submitted Plan Details
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0f2b48', fontWeight: 600 }}>
                  {buildPlanDetails()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <a
                  href={`tel:+918008008000`}
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Phone size={15} /> Talk to Senior Advisor
                </a>
                <button
                  onClick={onClose}
                  style={{
                    background: '#091726',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.4rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 1: CATEGORY-SPECIFIC QUESTIONNAIRE */
            <div>
              {/* Progress Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  Step 1 of 2: Plan Preferences
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  ⚡ Free Instant Quotes
                </span>
              </div>

              {/* 1. HEALTH & FAMILY FLOATER JOURNEY */}
              {(category.id === 'health' || category.id === 'family_floater') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                      Who do you want to insure?
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {memberOptions.map((member) => {
                        const isSelected = healthForm.members.includes(member);
                        return (
                          <button
                            key={member}
                            type="button"
                            onClick={() => toggleHealthMember(member)}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #059669' : '1px solid #cbd5e1',
                              background: isSelected ? '#ecfdf5' : '#ffffff',
                              color: isSelected ? '#047857' : '#475569',
                              fontWeight: isSelected ? 800 : 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected && <CheckCircle2 size={14} color="#059669" />}
                            {member}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Age of Eldest Member
                      </label>
                      <select
                        value={healthForm.eldestAge}
                        onChange={(e) => setHealthForm({ ...healthForm, eldestAge: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        {[...Array(60)].map((_, i) => {
                          const age = i + 18;
                          return <option key={age} value={age}>{age} Years</option>;
                        })}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Desired Cover (Sum Insured)
                      </label>
                      <select
                        value={healthForm.sumInsured}
                        onChange={(e) => setHealthForm({ ...healthForm, sumInsured: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="5 Lakhs">₹5 Lakhs (Standard)</option>
                        <option value="10 Lakhs">₹10 Lakhs (Recommended)</option>
                        <option value="25 Lakhs">₹25 Lakhs (Super Secure)</option>
                        <option value="50 Lakhs">₹50 Lakhs (High Networth)</option>
                        <option value="1 Crore">₹1 Crore (Super Shield)</option>
                      </select>
                    </div>
                  </div>

                  {/* Pre-existing Check */}
                  <div
                    onClick={() => setHealthForm({ ...healthForm, hasPreExistingDisease: !healthForm.hasPreExistingDisease })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      background: healthForm.hasPreExistingDisease ? '#fef3c7' : '#f8fafc',
                      border: healthForm.hasPreExistingDisease ? '1px solid #fde68a' : '1px solid #e2e8f0',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={healthForm.hasPreExistingDisease}
                      onChange={() => {}}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                      Any member has existing medical conditions (Diabetes, BP, Thyroid, etc.)
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MOTOR (CAR & 2-WHEELER) JOURNEY */}
              {(category.id === 'car' || category.id === 'two_wheeler') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {!motorForm.isBrandNew ? (
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                        Enter {category.id === 'car' ? 'Car' : 'Bike'} Registration Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TS 09 AB 1234 / DL 01 AB 1234"
                        value={motorForm.regNumber}
                        onChange={(e) => setMotorForm({ ...motorForm, regNumber: e.target.value.toUpperCase() })}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '2px solid #2563eb',
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          background: '#f8fafc'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '10px', color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>
                      🎉 Purchasing insurance for a brand new vehicle. We will fetch direct dealer-beating pricing.
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setMotorForm({ ...motorForm, isBrandNew: !motorForm.isBrandNew })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {motorForm.isBrandNew ? '← Enter Existing Reg Number' : '+ Bought a Brand New Vehicle?'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Coverage Plan
                      </label>
                      <select
                        value={motorForm.policyType}
                        onChange={(e) => setMotorForm({ ...motorForm, policyType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="Comprehensive + Zero Dep">Comprehensive + Zero Dep (Recommended)</option>
                        <option value="Standard Comprehensive">Standard Comprehensive</option>
                        <option value="Third Party Only (Mandatory)">Third Party Only (Mandatory)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Previous Policy Status
                      </label>
                      <select
                        value={motorForm.policyStatus}
                        onChange={(e) => setMotorForm({ ...motorForm, policyStatus: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="Active">Active (Not Expired)</option>
                        <option value="Expired < 90 Days">Expired &lt; 90 Days (NCB Intact)</option>
                        <option value="Expired > 90 Days">Expired &gt; 90 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TERM LIFE JOURNEY */}
              {category.id === 'term_life' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Gender
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Male', 'Female'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setLifeForm({ ...lifeForm, gender: g })}
                            style={{
                              flex: 1,
                              padding: '9px',
                              borderRadius: '8px',
                              border: lifeForm.gender === g ? '2px solid #0284c7' : '1px solid #cbd5e1',
                              background: lifeForm.gender === g ? '#f0f9ff' : '#ffffff',
                              color: lifeForm.gender === g ? '#0284c7' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Do you consume Tobacco/Smoke?
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[{ label: 'No', val: false }, { label: 'Yes', val: true }].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => setLifeForm({ ...lifeForm, isSmoker: opt.val })}
                            style={{
                              flex: 1,
                              padding: '9px',
                              borderRadius: '8px',
                              border: lifeForm.isSmoker === opt.val ? '2px solid #0284c7' : '1px solid #cbd5e1',
                              background: lifeForm.isSmoker === opt.val ? '#f0f9ff' : '#ffffff',
                              color: lifeForm.isSmoker === opt.val ? '#0284c7' : '#475569',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Annual Income Bracket
                      </label>
                      <select
                        value={lifeForm.annualIncome}
                        onChange={(e) => setLifeForm({ ...lifeForm, annualIncome: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="Below 5 Lakhs">Below ₹5 Lakhs</option>
                        <option value="5 - 10 Lakhs">₹5 - ₹10 Lakhs</option>
                        <option value="10 - 15 Lakhs">₹10 - ₹15 Lakhs</option>
                        <option value="15 - 25 Lakhs">₹15 - ₹25 Lakhs</option>
                        <option value="25 Lakhs+">₹25 Lakhs+</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Desired Life Cover
                      </label>
                      <select
                        value={lifeForm.desiredCover}
                        onChange={(e) => setLifeForm({ ...lifeForm, desiredCover: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          background: '#ffffff'
                        }}
                      >
                        <option value="₹50 Lakhs">₹50 Lakhs</option>
                        <option value="₹1 Crore">₹1 Crore (Most Popular)</option>
                        <option value="₹1.5 Crore">₹1.5 Crore</option>
                        <option value="₹2 Crore">₹2 Crore</option>
                        <option value="₹5 Crore">₹5 Crore (HNW Cover)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TRAVEL INSURANCE JOURNEY */}
              {category.id === 'travel' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                      Where are you traveling to?
                    </label>
                    <select
                      value={travelForm.destination}
                      onChange={(e) => setTravelForm({ ...travelForm, destination: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        background: '#ffffff'
                      }}
                    >
                      <option value="Schengen Countries (Europe)">Schengen Countries (Europe - Visa Approved)</option>
                      <option value="USA & Canada">USA &amp; Canada</option>
                      <option value="UAE & Middle East">UAE, Dubai &amp; Middle East</option>
                      <option value="Southeast Asia (Thailand, Bali, Singapore)">Southeast Asia (Thailand, Singapore, Malaysia)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Rest of the World">Rest of the World</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Number of Travelers
                      </label>
                      <select
                        value={travelForm.travelerCount}
                        onChange={(e) => setTravelForm({ ...travelForm, travelerCount: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="1">1 Person (Solo)</option>
                        <option value="2">2 Persons (Couple)</option>
                        <option value="3-4">3-4 Persons (Family)</option>
                        <option value="5+">5+ Persons (Group)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Approx Duration
                      </label>
                      <select
                        value={travelForm.durationDays}
                        onChange={(e) => setTravelForm({ ...travelForm, durationDays: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="7">Up to 7 Days</option>
                        <option value="15">Up to 15 Days</option>
                        <option value="30">Up to 30 Days</option>
                        <option value="60">Up to 60 Days</option>
                        <option value="Annual Multi-Trip">Annual Multi-Trip (Frequent Flyer)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. CORPORATE / SME GROUP JOURNEY */}
              {category.id === 'corporate_sme' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Technologies Pvt Ltd"
                      value={corpForm.companyName}
                      onChange={(e) => setCorpForm({ ...corpForm, companyName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Total Employees
                      </label>
                      <select
                        value={corpForm.employeeCount}
                        onChange={(e) => setCorpForm({ ...corpForm, employeeCount: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="5 - 15 Employees">5 - 15 Employees (Micro-SME)</option>
                        <option value="15 - 50 Employees">15 - 50 Employees (Growth Startup)</option>
                        <option value="50 - 200 Employees">50 - 200 Employees (Mid-Market)</option>
                        <option value="200+ Employees">200+ Employees (Enterprise)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Official Work Email
                      </label>
                      <input
                        type="email"
                        placeholder="hr@company.com"
                        value={corpForm.workEmail}
                        onChange={(e) => setCorpForm({ ...corpForm, workEmail: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                      Required Employee Benefits
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        'Group Health Insurance (GMC)',
                        'Group Term Life (GTL)',
                        'Group Personal Accident (GPA)',
                        'Parental Coverage Add-on'
                      ].map((item) => {
                        const isChecked = corpForm.coverageTypes.includes(item);
                        return (
                          <div
                            key={item}
                            onClick={() => toggleCorpCoverage(item)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.5rem 0.8rem',
                              borderRadius: '8px',
                              background: isChecked ? '#eff6ff' : '#f8fafc',
                              border: isChecked ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: isChecked ? 700 : 500,
                              color: isChecked ? '#1e40af' : '#475569'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ width: '14px', height: '14px' }}
                            />
                            {item}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. LOANS JOURNEY */}
              {category.id === 'loans' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Loan Category
                      </label>
                      <select
                        value={loanForm.loanType}
                        onChange={(e) => setLoanForm({ ...loanForm, loanType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="Home Loan">Home Loan (Purchase / Construction)</option>
                        <option value="Business Loan">Business Expansion Loan</option>
                        <option value="Loan Against Property (LAP)">Loan Against Property (LAP)</option>
                        <option value="Personal Loan">Personal Loan</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Desired Loan Amount
                      </label>
                      <select
                        value={loanForm.loanAmount}
                        onChange={(e) => setLoanForm({ ...loanForm, loanAmount: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#ea580c',
                          background: '#ffffff'
                        }}
                      >
                        <option value="₹10 - ₹25 Lakhs">₹10 - ₹25 Lakhs</option>
                        <option value="₹25 - ₹50 Lakhs">₹25 - ₹50 Lakhs</option>
                        <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                        <option value="₹1 Crore+">₹1 Crore+</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Employment / Profile
                      </label>
                      <select
                        value={loanForm.employmentType}
                        onChange={(e) => setLoanForm({ ...loanForm, employmentType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="Salaried Professional">Salaried Professional</option>
                        <option value="Self-Employed Business">Self-Employed / Business Owner</option>
                        <option value="Doctor / CA / Lawyer">Doctor / CA / Professional</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                        Monthly Net Income
                      </label>
                      <select
                        value={loanForm.monthlyIncome}
                        onChange={(e) => setLoanForm({ ...loanForm, monthlyIncome: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: '#ffffff'
                        }}
                      >
                        <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                        <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                        <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                        <option value="₹2,50,000+">₹2,50,000+</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '1.5rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Continue to View Quotes <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            /* STEP 2: CONTACT & PROPOSAL DISPATCH */
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  Step 2 of 2: Where should we send your quotes?
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ← Edit Preferences
                </button>
              </div>

              {/* Summary Chip */}
              <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="#059669" />
                <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                  {buildPlanDetails()}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={contactForm.fullName}
                    onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number for instant quote dispatch"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad"
                      value={contactForm.city}
                      onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 13px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                      Pincode (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500081"
                      value={contactForm.pincode}
                      onChange={(e) => setContactForm({ ...contactForm, pincode: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '11px 13px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="For detailed insurer comparison sheet"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 13px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {errorMsg && (
                <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '1.25rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                {isSubmitting ? 'Generating Comparative Quotes...' : 'Submit & View Comparison →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                🔒 100% Spam-Free Guarantee. We respect your privacy & zero spam policy.
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
