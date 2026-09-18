import React, { useState, useEffect } from 'react';
import { 
  Columns, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Building2, 
  User, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { crmService } from '../../services/api';

export default function SalesPipelineView({ onOpenClient360, onOpenCallModal, onOpenMeetingModal }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const PIPELINE_STAGES = [
    { id: 'NEW_LEAD', label: 'New Lead', color: '#0284c7', bg: '#e0f2fe' },
    { id: 'CONTACTED', label: 'Contacted', color: '#d97706', bg: '#fef3c7' },
    { id: 'FOLLOWUP', label: 'Follow-up Due', color: '#ea580c', bg: '#ffedd5' },
    { id: 'INTERESTED', label: 'Interested', color: '#16a34a', bg: '#dcfce7' },
    { id: 'QUOTATION', label: 'Quotation', color: '#4f46e5', bg: '#e0e7ff' },
    { id: 'MEETING', label: 'Meeting Scheduled', color: '#9333ea', bg: '#f3e8ff' },
    { id: 'DOCUMENTS', label: 'Documents / KYC', color: '#0d9488', bg: '#ccfbf1' },
    { id: 'PAYMENT', label: 'Payment Pending', color: '#ca8a04', bg: '#fef9c3' },
    { id: 'POLICY_ISSUED', label: 'Policy Issued 🎉', color: '#059669', bg: '#d1fae5' }
  ];

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await crmService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to load pipeline leads:', err);
      // Fallback demo leads
      setLeads([
        {
          id: 1,
          clientCode: 'CL-801245',
          fullName: 'Ahmed Ali',
          companyName: 'Ali Logistics Pvt Ltd',
          phoneNumber: '+91 9849012345',
          insuranceType: 'Health Insurance',
          sumInsured: '₹10 Lakhs',
          estimatedPremium: 18500,
          stage: 'FOLLOWUP',
          priority: 'HIGH',
          assignedAdvisorName: 'Rajesh Kumar'
        },
        {
          id: 2,
          clientCode: 'CL-801246',
          fullName: 'Venkatesh Rao',
          companyName: 'VR Software Solutions',
          phoneNumber: '+91 9988112233',
          insuranceType: 'Term Life Insurance',
          sumInsured: '₹1 Crore',
          estimatedPremium: 14200,
          stage: 'QUOTATION',
          priority: 'HIGH',
          assignedAdvisorName: 'Rajesh Kumar'
        },
        {
          id: 3,
          clientCode: 'CL-801247',
          fullName: 'Dr. Sunita Deshmukh',
          companyName: 'Apollo Clinic ECIL',
          phoneNumber: '+91 9849556677',
          insuranceType: 'Vehicle / Motor Insurance',
          sumInsured: '₹8 Lakhs IDV',
          estimatedPremium: 9800,
          stage: 'MEETING',
          priority: 'MEDIUM',
          assignedAdvisorName: 'Priya Sharma'
        },
        {
          id: 4,
          clientCode: 'CL-801248',
          fullName: 'Kiran Patel',
          companyName: 'Patel Engineering Works',
          phoneNumber: '+91 9700114455',
          insuranceType: 'Group / SME Insurance',
          sumInsured: '₹50 Lakhs',
          estimatedPremium: 85000,
          stage: 'DOCUMENTS',
          priority: 'HIGH',
          assignedAdvisorName: 'Priya Sharma'
        },
        {
          id: 5,
          clientCode: 'CL-801249',
          fullName: 'Rohan Sharma',
          companyName: 'Individual',
          phoneNumber: '+91 9123456789',
          insuranceType: 'Two Wheeler Insurance',
          sumInsured: '₹65,000 IDV',
          estimatedPremium: 1450,
          stage: 'POLICY_ISSUED',
          priority: 'LOW',
          assignedAdvisorName: 'Rajesh Kumar'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const moveStage = async (leadId, newStage) => {
    try {
      await crmService.updateLead(leadId, { stage: newStage });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    } catch (err) {
      alert('Failed to update stage: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredLeads = leads.filter(l => 
    l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.clientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phoneNumber.includes(searchQuery)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Search & Pipeline Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        background: '#ffffff',
        padding: '1rem 1.25rem',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search pipeline by client name, code, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.88rem', color: '#0f2b48' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
          <span>Total Pipeline Value: <span style={{ color: '#059669' }}>₹{leads.reduce((acc, curr) => acc + (Number(curr.estimatedPremium) || 0), 0).toLocaleString()}</span></span>
          <span>Active Deals: <span style={{ color: '#0284c7' }}>{leads.length}</span></span>
        </div>
      </div>

      {/* Kanban Board Container (Horizontal Scroll) */}
      <div style={{
        display: 'flex',
        gap: '14px',
        overflowX: 'auto',
        paddingBottom: '1rem',
        minHeight: '650px',
        alignItems: 'flex-start'
      }}>
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
          const stageTotal = stageLeads.reduce((acc, curr) => acc + (Number(curr.estimatedPremium) || 0), 0);

          return (
            <div
              key={stage.id}
              style={{
                width: '300px',
                minWidth: '300px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                maxHeight: '75vh',
                overflowY: 'auto'
              }}
            >
              {/* Column Header */}
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                position: 'sticky',
                top: 0,
                zIndex: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: stage.color }}>
                    {stage.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: stage.bg, color: stage.color, padding: '2px 8px', borderRadius: '9999px' }}>
                    {stageLeads.length}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Vol: ₹{stageTotal.toLocaleString()}
                </div>
              </div>

              {/* Lead Cards List */}
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stageLeads.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', fontStyle: 'italic' }}>
                    No leads in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div 
                          onClick={() => onOpenClient360 && onOpenClient360(lead)}
                          style={{ fontWeight: 800, color: '#0f2b48', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                          {lead.fullName}
                        </div>
                        {lead.priority === 'HIGH' && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>
                            HIGH
                          </span>
                        )}
                      </div>

                      {lead.companyName && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {lead.companyName}
                        </div>
                      )}

                      <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, marginTop: '6px' }}>
                        {lead.insuranceType}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.75rem', color: '#475569' }}>
                        <span>Cover: <strong>{lead.sumInsured || '-'}</strong></span>
                        <span style={{ color: '#059669', fontWeight: 700 }}>₹{Number(lead.estimatedPremium || 0).toLocaleString()}</span>
                      </div>

                      {/* Quick stage mover dropdown */}
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <select
                          value={lead.stage}
                          onChange={(e) => moveStage(lead.id, e.target.value)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 6px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s.id} value={s.id}>Move to: {s.label}</option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => onOpenCallModal && onOpenCallModal({ clientId: lead.id, clientName: lead.fullName, clientPhone: lead.phoneNumber, insuranceType: lead.insuranceType })}
                            style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                            title="Log Call"
                          >
                            <Phone size={12} />
                          </button>
                          <button
                            onClick={() => onOpenMeetingModal && onOpenMeetingModal(lead)}
                            style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                            title="Schedule Meet"
                          >
                            <Calendar size={12} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
