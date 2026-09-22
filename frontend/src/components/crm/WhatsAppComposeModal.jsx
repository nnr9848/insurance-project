import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  FileText, 
  FolderCheck, 
  CreditCard, 
  Calendar,
  User,
  Phone
} from 'lucide-react';
import WhatsAppIcon from '../common/WhatsAppIcon';
import { formatWhatsAppNumber } from '../../utils/crmDeduplication';

/**
 * Enterprise WhatsApp Templates for Insurance Advisory
 */
const WHATSAPP_TEMPLATES = [
  {
    id: 'INTRO',
    label: '👋 Intro & Welcome',
    icon: Sparkles,
    generate: ({ clientName, insuranceType, advisorName }) => 
`Hello *${clientName || 'Valued Client'}*,

Thank you for contacting *Aadhiraksha InsurTech*. My name is *${advisorName || 'your Advisor'}*, and I will be assisting you with your *${insuranceType || 'Insurance'}* plan requirements.

Would you have 5 minutes today for a quick call to discuss the best benefits and customized options for you?`
  },
  {
    id: 'QUOTATION',
    label: '📄 Quote Comparison Shared',
    icon: FileText,
    generate: ({ clientName, insuranceType, sumInsured, advisorName }) => 
`Hello *${clientName || 'Client'}*,

As discussed, I have prepared customized plan comparisons for your *${insuranceType || 'Insurance'}*${sumInsured ? ` with coverage of *${sumInsured}*` : ''}.

Key benefits include:
✅ Cashless hospitalization across 10,000+ top hospitals
✅ 0% Copay & No Room Rent Capping options
✅ Cumulative bonus & annual free health checkups

Please review the attached details and let me know if you have any questions.`
  },
  {
    id: 'DOCS_KYC',
    label: '📑 KYC & Docs Request',
    icon: FolderCheck,
    generate: ({ clientName, insuranceType }) => 
`Dear *${clientName || 'Client'}*,

To proceed with your *${insuranceType || 'Insurance'}* proposal submission, kindly share copies of the following documents:

1️⃣ Aadhaar Card & PAN Card
2️⃣ Passport size photograph
3️⃣ Previous policy copy (if porting/renewing)
4️⃣ Recent medical diagnostic reports (if applicable)

You can share the clear photos/PDFs directly on this WhatsApp chat.`
  },
  {
    id: 'PAYMENT',
    label: '💳 Payment & Policy Issuance',
    icon: CreditCard,
    generate: ({ clientName, insuranceType, sumInsured }) => 
`Dear *${clientName || 'Client'}*,

Great news! Your *${insuranceType || 'Insurance'}* proposal${sumInsured ? ` (${sumInsured})` : ''} has been reviewed and approved by the insurer underwriting team.

Kindly complete the secure premium payment using the insurer link to issue your instant policy number and 80D tax exemption certificate. Let me know once done!`
  },
  {
    id: 'CALLBACK',
    label: '⏰ Callback Follow-up',
    icon: Calendar,
    generate: ({ clientName, advisorName }) => 
`Hello *${clientName || 'Client'}*,

This is *${advisorName || 'your Advisor'}* following up from *Aadhiraksha InsurTech*. 

I tried reaching you regarding your insurance inquiry. Please let me know what time is most convenient for you for a brief conversation.`
  }
];

export default function WhatsAppComposeModal({
  isOpen,
  onClose,
  client,
  advisorName,
  onMessageSent
}) {
  if (!isOpen || !client) return null;

  const rawPhone = client.whatsappNumber || client.phoneNumber || '';
  const cleanPhone = formatWhatsAppNumber(rawPhone);

  const [selectedTemplateId, setSelectedTemplateId] = useState('INTRO');
  const [customMessage, setCustomMessage] = useState(() => {
    const initialTpl = WHATSAPP_TEMPLATES[0];
    return initialTpl.generate({
      clientName: client.fullName || client.name,
      insuranceType: client.insuranceType || 'Health Insurance',
      sumInsured: client.sumInsured,
      advisorName: advisorName || 'Advisor'
    });
  });

  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setCustomMessage(template.generate({
      clientName: client.fullName || client.name,
      insuranceType: client.insuranceType || 'Health Insurance',
      sumInsured: client.sumInsured,
      advisorName: advisorName || 'Advisor'
    }));
  };

  const handleCopyMessage = () => {
    if (!customMessage) return;
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!cleanPhone) {
      alert('Client does not have a valid WhatsApp or mobile phone number.');
      return;
    }

    const encodedText = encodeURIComponent(customMessage.trim());
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, '_blank');

    if (onMessageSent) {
      const templateObj = WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId);
      onMessageSent({
        templateLabel: templateObj?.label || 'Custom Message',
        messageText: customMessage.trim(),
        recipientPhone: cleanPhone
      });
    }

    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        zIndex: 13500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          background: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: '#22c55e',
              color: '#ffffff',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <WhatsAppIcon size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#166534' }}>
                WhatsApp Direct Outreach
              </h3>
              <div style={{ fontSize: '0.73rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>To: <strong>{client.fullName || 'Client'}</strong></span>
                <span>•</span>
                <span>+{cleanPhone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#15803d',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Quick Template Chips */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f2b48', display: 'block', marginBottom: '6px' }}>
              Choose Message Template:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {WHATSAPP_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: isSelected ? '#dcfce7' : '#f8fafc',
                      color: isSelected ? '#15803d' : '#475569',
                      border: `1px solid ${isSelected ? '#86efac' : '#e2e8f0'}`,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '0.73rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Text Area */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f2b48' }}>
                Preview & Edit Message:
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: copied ? '#16a34a' : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                lineHeight: 1.45,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fafafa'
              }}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              * Automatically logs to client audit timeline
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '7px 14px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={!cleanPhone || !customMessage.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  background: '#22c55e',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: !cleanPhone || !customMessage.trim() ? 'not-allowed' : 'pointer',
                  opacity: !cleanPhone || !customMessage.trim() ? 0.6 : 1,
                  boxShadow: '0 2px 6px rgba(34, 197, 94, 0.3)'
                }}
              >
                <WhatsAppIcon size={14} color="#ffffff" />
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
