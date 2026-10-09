import React, { useState, useEffect } from 'react';
import { 
  FolderCheck, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  Trash2, 
  Eye, 
  RefreshCw, 
  ExternalLink,
  Plus,
  Send,
  AlertCircle,
  X
} from 'lucide-react';
import { crmService } from '../../services/api';
import { CrmTablePaginationBar, CrmTopMiniPager } from './common/CrmTablePaginationBar';

const DOC_TYPES = [
  { id: 'AADHAAR', label: 'Aadhaar Card' },
  { id: 'PAN', label: 'PAN Card' },
  { id: 'PREVIOUS_POLICY', label: 'Previous Policy Copy' },
  { id: 'MEDICAL_RECORD', label: 'Medical Discharge / Reports' },
  { id: 'RC_BOOK', label: 'Vehicle RC Book' },
  { id: 'PROPOSAL_FORM', label: 'Signed Proposal Form' },
  { id: 'SALARY_SLIP', label: 'Salary Slip / Income Proof' },
  { id: 'GST_CERTIFICATE', label: 'Business GST Certificate' },
  { id: 'OTHER', label: 'Other Document' }
];

export default function DocumentLockerView({ onOpenClient360 }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    const saved = localStorage.getItem('document_locker_page_size');
    return saved ? parseInt(saved, 10) : 10;
  });

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    try {
      localStorage.setItem('document_locker_page_size', String(newSize));
    } catch (e) {
      // ignore
    }
  };

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [uploadData, setUploadData] = useState({
    clientId: '',
    documentType: 'AADHAAR',
    fileName: '',
    fileUrl: '',
    fileSizeBytes: 1500000,
    fileType: 'application/pdf'
  });
  const [uploading, setUploading] = useState(false);

  // Verification Review Modal State
  const [verifyDoc, setVerifyDoc] = useState(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchClients();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await crmService.getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await crmService.getClients();
      setClients(data || []);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.clientId || !uploadData.fileName) {
      alert('Please select a client and provide a file name.');
      return;
    }

    setUploading(true);
    try {
      const sampleUrl = uploadData.fileUrl || `https://storage.googleapis.com/aadhiraksha-kyc/doc-${Date.now()}.pdf`;
      await crmService.uploadDocument({
        ...uploadData,
        clientId: Number(uploadData.clientId),
        fileUrl: sampleUrl
      });
      setShowUploadModal(false);
      setUploadData({
        clientId: '',
        documentType: 'AADHAAR',
        fileName: '',
        fileUrl: '',
        fileSizeBytes: 1500000,
        fileType: 'application/pdf'
      });
      fetchDocuments();
    } catch (err) {
      alert('Failed to upload document: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (status) => {
    if (!verifyDoc) return;
    setVerifying(true);
    try {
      await crmService.verifyDocument(verifyDoc.id, {
        status,
        notes: verifyNotes
      });
      setVerifyDoc(null);
      setVerifyNotes('');
      fetchDocuments();
    } catch (err) {
      alert('Failed to update verification status: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action will be logged in the audit trail.')) {
      return;
    }
    try {
      await crmService.deleteDocument(docId);
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSendChecklistWhatsApp = async (client) => {
    try {
      const res = await crmService.requestDocumentsChecklist(client.id, [
        'AADHAAR',
        'PAN',
        'PREVIOUS_POLICY',
        'MEDICAL_RECORD'
      ]);
      if (res.whatsAppUrl) {
        window.open(res.whatsAppUrl, '_blank');
      }
    } catch (err) {
      alert('Failed to generate WhatsApp document checklist: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      (d.fileName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (d.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (d.documentType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (d.clientPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.verificationStatus === statusFilter;
    const matchesType = typeFilter === 'ALL' || d.documentType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return { label: 'Verified ✓', bg: '#dcfce7', text: '#15803d', icon: <CheckCircle2 size={13} /> };
      case 'REJECTED':
        return { label: 'Rejected ✗', bg: '#fee2e2', text: '#b91c1c', icon: <XCircle size={13} /> };
      case 'PENDING_REVIEW':
      default:
        return { label: 'Pending Review', bg: '#fef3c7', text: '#b45309', icon: <Clock size={13} /> };
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '1.2 MB';
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  };

  // Pagination calculation
  const totalRecords = filteredDocs.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      maxHeight: 'calc(100vh - 120px)',
      gap: '0.75rem',
      overflow: 'hidden'
    }}>
      
      {/* 1. Sleek Compact Header Bar (Industry Standard SaaS) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0 0 0.25rem 0',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderCheck size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy, #0f2b48)', margin: 0, letterSpacing: '-0.02em' }}>
                Document Locker & KYC Vault
              </h2>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                border: '1px solid #e2e8f0'
              }}>
                {filteredDocs.length} files
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              KYC verification, proposal forms, policy archives & compliance documents
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowUploadModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f59e0b',
              color: '#091726',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Upload size={14} /> Upload KYC Doc
          </button>

          <button
            onClick={fetchDocuments}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#0f2b48',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} color="#059669" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Stats Bar (Compact & Sleek) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '10px',
        flexShrink: 0
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <FileText size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Documents</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>{documents.length}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <CheckCircle2 size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Verified & Approved</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {documents.filter(d => d.verificationStatus === 'VERIFIED').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <Clock size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending KYC Review</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {documents.filter(d => d.verificationStatus === 'PENDING_REVIEW').length}
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
            <XCircle size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Rejected / Re-upload Due</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.2 }}>
              {documents.filter(d => d.verificationStatus === 'REJECTED').length}
            </div>
          </div>
        </div>
      </div>

      {/* Control & Search Bar (Pinned at top of table) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 280px' }}>
          <form 
            role="search"
            onSubmit={(e) => e.preventDefault()}
            style={{ position: 'relative', width: '100%', margin: 0 }}
          >
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="search"
              name="doc-locker-search-filter"
              id="doc-locker-search-filter"
              autoComplete="search"
              data-lpignore="true"
              data-form-type="other"
              placeholder="Search file name, client, phone, doc type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '7px 12px 7px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </form>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              background: '#f8fafc'
            }}
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Doc Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.8rem',
              color: '#334155',
              fontWeight: 600,
              outline: 'none',
              background: '#f8fafc'
            }}
          >
            <option value="ALL">All Document Types</option>
            {DOC_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          {/* Top Mini Pager */}
          <CrmTopMiniPager
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Main Table Card (Viewport-locked Flex container) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #cbd5e1', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading digital documents...</div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <FolderCheck size={40} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>No documents uploaded yet</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Click "Upload KYC Document" to attach files to any client.</div>
          </div>
        ) : (
          <>
            <div className="crm-table-scroll-container" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <table className="crm-table" style={{ minWidth: '1060px' }}>
                <thead className="crm-table-head">
                  <tr>
                    <th className="crm-table-th" style={{ minWidth: '220px' }}>Document Name & Type</th>
                    <th className="crm-table-th" style={{ minWidth: '180px' }}>Client</th>
                    <th className="crm-table-th" style={{ minWidth: '150px' }}>Size & Date</th>
                    <th className="crm-table-th" style={{ minWidth: '150px' }}>Uploaded By</th>
                    <th className="crm-table-th" style={{ minWidth: '150px' }}>Verification</th>
                    <th className="crm-table-th" style={{ minWidth: '150px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
              <tbody>
                {paginatedDocs.map((d) => {
                  const badge = getStatusBadge(d.verificationStatus);

                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}>
                      
                      {/* Name & Type */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f2b48', fontSize: '0.85rem' }}>
                              {d.fileName}
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                              {d.documentType.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#0f2b48' }}>{d.clientName}</span>
                          {onOpenClient360 && (
                            <button
                              onClick={() => onOpenClient360({ id: d.clientId })}
                              style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 0 }}
                              title="Open Client 360"
                            >
                              <ExternalLink size={12} />
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{d.clientPhone}</div>
                      </td>

                      {/* Size & Date */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b' }}>
                        <div>{formatFileSize(d.fileSizeBytes)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                      </td>

                      {/* Uploaded By */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#0f2b48', fontSize: '0.82rem' }}>
                          {d.uploadedByName || 'System'}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: badge.bg,
                          color: badge.text,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {badge.icon} {badge.label}
                        </span>
                        {d.verificationNotes && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {d.verificationNotes}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setVerifyDoc(d)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <ShieldCheck size={13} /> Verify
                          </button>

                          <button
                            onClick={() => handleDelete(d.id)}
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Delete Document"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pinned Bottom Pagination Footer */}
          <CrmTablePaginationBar
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            unitName="documents"
          />
        </>
      )}
    </div>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>Attach KYC / Proposal File</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Upload to client's secure document locker</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Target Client *
                </label>
                <select
                  required
                  value={uploadData.clientId}
                  onChange={(e) => setUploadData({ ...uploadData, clientId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="">-- Select Client from CRM --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phoneNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Document Type *
                </label>
                <select
                  value={uploadData.documentType}
                  onChange={(e) => setUploadData({ ...uploadData, documentType: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  {DOC_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Document File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aadhaar_Card_Front_Back.pdf"
                  value={uploadData.fileName}
                  onChange={(e) => setUploadData({ ...uploadData, fileName: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f59e0b', color: '#091726', fontWeight: 800, cursor: 'pointer' }}
                >
                  {uploading ? 'Uploading...' : 'Save to Locker'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {verifyDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'none',
          zIndex: 13000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                Verify Document: {verifyDoc.fileName}
              </h3>
              <button
                onClick={() => setVerifyDoc(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 1rem 0' }}>
              Client: <strong>{verifyDoc.clientName}</strong> ({verifyDoc.documentType})
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Verification / Rejection Notes (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Validated with UIDAI Aadhaar portal. Name and DOB match proposal exactly."
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => handleVerify('REJECTED')}
                disabled={verifying}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}
              >
                Reject Document
              </button>
              <button
                onClick={() => handleVerify('VERIFIED')}
                disabled={verifying}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
              >
                Approve & Mark Verified
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
