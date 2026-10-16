import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Folder,
  Plus,
  Trash2,
  UploadCloud,
  Eye,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  ChevronRight,
  FolderPlus,
  Layers,
  Edit2,
  X,
  ArrowLeft
} from 'lucide-react';
import { portalService } from '../../services/api';
import { useBusinessProfile } from '../../context/BusinessProfileContext';
import { useToast } from '../../context/ToastContext';

export default function GalleryManagerView() {
  const { businessProfile, refreshBusinessProfile } = useBusinessProfile();
  const toast = useToast();

  const [albums, setAlbums] = useState([]);
  const [activeAlbumId, setActiveAlbumId] = useState(null);
  const [mobileDetailView, setMobileDetailView] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumSubtitle, setNewAlbumSubtitle] = useState('');

  // Album Edit Modal State (Streamlined: Title + Optional Subtitle)
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState('');
  const [editAlbumSubtitle, setEditAlbumSubtitle] = useState('');

  // Photo Edit Modal State (Streamlined: 1 Caption field only)
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState('');

  const fileInputRef = useRef(null);

  // Helper to normalize image URL (fixing legacy /api/documents/view-file/ to /api/crm/documents/view-file/)
  const normalizeImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/api/documents/view-file/')) {
      return url.replace('/api/documents/view-file/', '/api/crm/documents/view-file/');
    }
    return url;
  };

  // Initialize albums from businessProfile JSON (or auto-populate defaults if empty)
  useEffect(() => {
    let loaded = false;
    if (businessProfile?.aboutGalleryPhotosJson) {
      try {
        const raw = JSON.parse(businessProfile.aboutGalleryPhotosJson);
        if (Array.isArray(raw) && raw.length > 0) {
          const isAlbumStructure = Array.isArray(raw[0].photos);
          if (isAlbumStructure) {
            const sanitized = raw.map(alb => ({
              ...alb,
              coverImage: normalizeImageUrl(alb.coverImage),
              photos: (alb.photos || []).map(p => ({
                ...p,
                imageUrl: normalizeImageUrl(p.imageUrl || p.image)
              }))
            }));
            setAlbums(sanitized);
            if (!activeAlbumId && sanitized.length > 0) setActiveAlbumId(sanitized[0].id);
            loaded = true;
          } else {
            // Group legacy flat items into albums by category
            const grouped = [
              {
                id: 'album-hq',
                title: 'Headquarters & Advisory Suites',
                subtitle: 'ECIL, Hyderabad - 4th Floor Mytri Constructions',
                category: 'office',
                tag: 'Headquarters',
                photos: raw.filter(p => p.category === 'office')
              },
              {
                id: 'album-conclaves',
                title: 'POSP & Financial Advisor Conclaves',
                subtitle: 'Annual conventions across Telangana & Andhra Pradesh',
                category: 'conclave',
                tag: 'Advisor Network',
                photos: raw.filter(p => p.category === 'conclave')
              },
              {
                id: 'album-claims',
                title: '24/7 Claim Concierge Desk',
                subtitle: 'Cashless hospitalization assistance in action',
                category: 'claims',
                tag: 'Claim Support',
                photos: raw.filter(p => p.category === 'claims')
              },
              {
                id: 'album-community',
                title: 'Community Camps & Public Outreach',
                subtitle: 'Financial wellness and policyholder educational camps',
                category: 'community',
                tag: 'Community Camp',
                photos: raw.filter(p => p.category === 'community')
              },
              {
                id: 'album-awards',
                title: 'Industry Awards & Insurer Honours',
                subtitle: 'Stellar speed & compliance recognitions',
                category: 'awards',
                tag: 'Awards & Honours',
                photos: raw.filter(p => p.category === 'awards')
              }
            ].filter(a => a.photos.length > 0);

            if (grouped.length > 0) {
              setAlbums(grouped);
              if (!activeAlbumId) setActiveAlbumId(grouped[0].id);
              loaded = true;
            }
          }
        }
      } catch (err) {
        console.warn('Could not parse aboutGalleryPhotosJson:', err);
      }
    }

    // Auto-fallback: If no albums exist yet in the database, automatically populate the 5 curated default albums
    if (!loaded && businessProfile) {
      const fallbackDefaults = [
        {
          id: 'album-hq',
          title: 'Corporate Headquarters & Advisory Suites',
          subtitle: 'ECIL, Hyderabad - 4th Floor Mytri Constructions',
          category: 'office',
          tag: 'Headquarters',
          photos: [
            {
              id: 101,
              title: 'Executive Advisory Suite',
              subtitle: 'Personalized face-to-face consultation desks',
              imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
              tag: 'Headquarters'
            },
            {
              id: 102,
              title: 'Policy Onboarding Wing',
              subtitle: 'Digital instant proposal issuance infrastructure',
              imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
              tag: 'Headquarters'
            }
          ]
        },
        {
          id: 'album-conclaves',
          title: 'Annual POSP & Advisor Conclaves',
          subtitle: 'Empowering 1,200+ certified regional advisors across Telangana & AP',
          category: 'conclave',
          tag: 'Advisor Network',
          photos: [
            {
              id: 201,
              title: 'Regional Advisor Leadership Summit',
              subtitle: 'Novotel Hitec City Conclave',
              imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
              tag: 'Advisor Network'
            }
          ]
        },
        {
          id: 'album-claims',
          title: '24/7 Claim Concierge Desk',
          subtitle: 'Physical claim managers assisting cashless hospital admissions',
          category: 'claims',
          tag: 'Claim Support',
          photos: [
            {
              id: 301,
              title: 'Claim Settlement Concierge in Action',
              subtitle: 'Hospital TPA coordination suite',
              imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
              tag: 'Claim Support'
            }
          ]
        },
        {
          id: 'album-awards',
          title: 'Industry Awards & Partner Honours',
          subtitle: 'Top Performance recognition for settlement speed & ethical compliance',
          category: 'awards',
          tag: 'Awards & Honours',
          photos: [
            {
              id: 401,
              title: 'Best Regional InsurTech Marketing Firm',
              subtitle: 'Annual Financial Services Summit Award',
              imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80',
              tag: 'Awards & Honours'
            }
          ]
        },
        {
          id: 'album-community',
          title: 'Family Financial Wellness & Motor Camps',
          subtitle: 'Educating policyholders on porting rights and cashless claims',
          category: 'community',
          tag: 'Community Camp',
          photos: [
            {
              id: 501,
              title: 'Secunderabad Road Safety & Zero-Dep Camp',
              subtitle: 'Community outreach initiative',
              imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
              tag: 'Community Camp'
            }
          ]
        }
      ];
      setAlbums(fallbackDefaults);
      if (!activeAlbumId) setActiveAlbumId('album-hq');
    }
  }, [businessProfile]);

  // Sync albums helper to backend
  const persistAlbums = async (updatedAlbums) => {
    setAlbums(updatedAlbums);
    try {
      await portalService.updateBusinessProfile({
        aboutGalleryPhotosJson: JSON.stringify(updatedAlbums)
      });
      await refreshBusinessProfile();
    } catch (err) {
      console.error('Failed to sync gallery albums:', err);
      toast.error('Failed to save gallery changes: ' + (err.response?.data?.message || err.message));
    }
  };

  // Populate curated default albums
  const handleLoadDefaults = async () => {
    const defaults = [
      {
        id: 'album-hq',
        title: 'Corporate Headquarters & Advisory Suites',
        subtitle: 'ECIL, Hyderabad - 4th Floor Mytri Constructions',
        category: 'office',
        tag: 'Headquarters',
        photos: [
          {
            id: 101,
            title: 'Executive Advisory Suite',
            subtitle: 'Personalized face-to-face consultation desks',
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
            tag: 'Headquarters'
          },
          {
            id: 102,
            title: 'Policy Onboarding Wing',
            subtitle: 'Digital instant proposal issuance infrastructure',
            imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
            tag: 'Headquarters'
          }
        ]
      },
      {
        id: 'album-conclaves',
        title: 'Annual POSP & Advisor Conclaves',
        subtitle: 'Empowering 1,200+ certified regional advisors across Telangana & AP',
        category: 'conclave',
        tag: 'Advisor Network',
        photos: [
          {
            id: 201,
            title: 'Regional Advisor Leadership Summit',
            subtitle: 'Novotel Hitec City Conclave',
            imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
            tag: 'Advisor Network'
          }
        ]
      },
      {
        id: 'album-claims',
        title: '24/7 Claim Concierge Desk',
        subtitle: 'Physical claim managers assisting cashless hospital admissions',
        category: 'claims',
        tag: 'Claim Support',
        photos: [
          {
            id: 301,
            title: 'Claim Settlement Concierge in Action',
            subtitle: 'Hospital TPA coordination suite',
            imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
            tag: 'Claim Support'
          }
        ]
      },
      {
        id: 'album-awards',
        title: 'Industry Awards & Partner Honours',
        subtitle: 'Top Performance recognition for settlement speed & ethical compliance',
        category: 'awards',
        tag: 'Awards & Honours',
        photos: [
          {
            id: 401,
            title: 'Best Regional InsurTech Marketing Firm',
            subtitle: 'Annual Financial Services Summit Award',
            imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80',
            tag: 'Awards & Honours'
          }
        ]
      },
      {
        id: 'album-community',
        title: 'Family Financial Wellness & Motor Camps',
        subtitle: 'Educating policyholders on porting rights and cashless claims',
        category: 'community',
        tag: 'Community Camp',
        photos: [
          {
            id: 501,
            title: 'Secunderabad Road Safety & Zero-Dep Camp',
            subtitle: 'Community outreach initiative',
            imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
            tag: 'Community Camp'
          }
        ]
      }
    ];

    await persistAlbums(defaults);
    setActiveAlbumId('album-hq');
    toast.success('Initialized 5 Curated Corporate Albums with photos!');
  };

  // Create new album
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) {
      toast.error('Album Title is required.');
      return;
    }

    const newAlbum = {
      id: 'album-' + Date.now(),
      title: newAlbumTitle.trim(),
      subtitle: newAlbumSubtitle.trim(),
      category: 'corporate',
      tag: 'Corporate Album',
      photos: []
    };

    const updated = [...albums, newAlbum];
    await persistAlbums(updated);
    setActiveAlbumId(newAlbum.id);
    setIsCreatingAlbum(false);
    setNewAlbumTitle('');
    setNewAlbumSubtitle('');
    toast.success(`Album "${newAlbum.title}" created successfully!`);
  };

  // Delete an entire album
  const handleDeleteAlbum = async (albumId) => {
    const target = albums.find(a => a.id === albumId);
    if (!target) return;
    if (!window.confirm(`Are you sure you want to delete the album "${target.title}" and its ${target.photos.length} photo(s)?`)) return;

    const updated = albums.filter(a => a.id !== albumId);
    await persistAlbums(updated);
    if (activeAlbumId === albumId) {
      setActiveAlbumId(updated.length > 0 ? updated[0].id : null);
    }
    toast.success(`Album "${target.title}" deleted.`);
  };

  // Upload multiple photos to the currently active album
  const handleBatchUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !activeAlbumId) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      toast.error('Please select image files (PNG, JPG, WEBP).');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    const uploadedPhotos = [];

    const activeAlbum = albums.find(a => a.id === activeAlbumId);

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await portalService.uploadGalleryImage(formData);
          if (res?.url) {
            uploadedPhotos.push({
              id: Date.now() + Math.random(),
              title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              subtitle: '',
              imageUrl: res.url,
              tag: activeAlbum ? (activeAlbum.tag || 'Corporate Photo') : 'Corporate Photo'
            });
            successCount++;
          }
        } catch (itemErr) {
          console.error('Failed to upload file:', file.name, itemErr);
        }
      }

      if (uploadedPhotos.length > 0) {
        const updatedAlbums = albums.map(alb => {
          if (alb.id === activeAlbumId) {
            return {
              ...alb,
              photos: [...uploadedPhotos, ...alb.photos]
            };
          }
          return alb;
        });

        await persistAlbums(updatedAlbums);
        toast.success(`Added ${successCount} photo${successCount > 1 ? 's' : ''} to "${activeAlbum.title}"!`);
      } else {
        toast.error('Failed to upload photos.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove a photo from an album
  const handleDeletePhoto = async (photoId) => {
    if (!activeAlbumId) return;
    const updatedAlbums = albums.map(alb => {
      if (alb.id === activeAlbumId) {
        return {
          ...alb,
          photos: alb.photos.filter(p => p.id !== photoId)
        };
      }
      return alb;
    });

    await persistAlbums(updatedAlbums);
    toast.success('Photo removed from album.');
  };

  // Save Album metadata edits (Streamlined: Title + Subtitle)
  const handleSaveAlbumEdit = async (e) => {
    e.preventDefault();
    if (!editingAlbum) return;

    const updated = albums.map(a => {
      if (a.id === editingAlbum.id) {
        return {
          ...a,
          title: editAlbumTitle.trim() || a.title,
          subtitle: editAlbumSubtitle.trim()
        };
      }
      return a;
    });

    await persistAlbums(updated);
    setEditingAlbum(null);
    toast.success('Album details updated successfully!');
  };

  // Save Photo caption edits (Streamlined: 1 Caption field only, optional)
  const handleSavePhotoEdit = async (e) => {
    e.preventDefault();
    if (!editingPhoto || !activeAlbumId) return;

    const newCaption = editPhotoTitle.trim();

    const updated = albums.map(a => {
      if (a.id === activeAlbumId) {
        return {
          ...a,
          photos: a.photos.map(p => {
            const isMatch = String(p.id) === String(editingPhoto.id) || 
                            (p.imageUrl && p.imageUrl === editingPhoto.imageUrl);
            if (isMatch) {
              return {
                ...p,
                title: newCaption,
                subtitle: ''
              };
            }
            return p;
          })
        };
      }
      return a;
    });

    await persistAlbums(updated);
    setEditingPhoto(null);
    toast.success('Photo caption updated successfully!');
  };

  const activeAlbum = albums.find(a => a.id === activeAlbumId);
  const totalPhotos = albums.reduce((acc, a) => acc + (a.photos?.length || 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. Header Hub Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
          }}>
            <Camera size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 4px' }}>
              Corporate Media & Outreach Albums
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Create albums (HQ, Conclaves, Claims Desk, Awards) and batch upload photos into each album.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {albums.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDefaults}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} color="#f59e0b" />
              <span>Load 5 Curated Default Albums</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCreatingAlbum(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
            }}
          >
            <FolderPlus size={15} />
            <span>+ Create New Album</span>
          </button>
        </div>
      </div>

      {/* 2. Create Album Modal / Drawer */}
      {isCreatingAlbum && (
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #0284c7',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 6px 18px rgba(2, 132, 199, 0.08)'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f2b48', margin: '0 0 1rem' }}>
            Create New Photo Album
          </h4>
          <form onSubmit={handleCreateAlbum} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Album Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2026 Annual Conclave or ECIL Headquarters"
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Subtitle (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad Hitec City • 1,200 Certified Advisors"
                value={newAlbumSubtitle}
                onChange={(e) => setNewAlbumSubtitle(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  padding: '9px 18px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Save Album
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingAlbum(false)}
                style={{
                  padding: '9px 14px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Albums Bar & Photos Viewer (Responsive Master-Detail on Desktop, Seamless Drill-Down on Mobile) */}
      <div style={{
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
        gap: '1.25rem',
        alignItems: 'flex-start'
      }}>
        
        {/* Left: Album Navigation List (Shown if desktop, or mobile when not in detail view) */}
        {(!isMobile || !mobileDetailView) && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px 8px',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Albums ({albums.length}) • {totalPhotos} Photos
              </span>
              {isMobile && (
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                  Tap to view photos
                </span>
              )}
            </div>

            {albums.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No albums yet. Click "+ Create New Album" above.
              </div>
            ) : (
              albums.map(alb => {
                const isActive = alb.id === activeAlbumId;
                const coverImg = alb.photos?.[0]?.imageUrl;

                return (
                  <div
                    key={alb.id}
                    onClick={() => {
                      setActiveAlbumId(alb.id);
                      if (isMobile) setMobileDetailView(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: isMobile ? '12px 14px' : '8px 10px',
                      borderRadius: '12px',
                      background: isActive ? '#f5f3ff' : 'transparent',
                      border: isActive ? '1px solid #ddd6fe' : '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: isMobile ? '48px' : '42px',
                      height: isMobile ? '48px' : '42px',
                      borderRadius: '10px',
                      background: coverImg ? `url(${coverImg}) center/cover` : '#ede9fe',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#7c3aed'
                    }}>
                      {!coverImg && <Folder size={isMobile ? 22 : 18} />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: isMobile ? '0.92rem' : '0.84rem',
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? '#6d28d9' : '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {alb.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {alb.photos?.length || 0} photos
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAlbum(alb.id);
                        }}
                        title="Delete album"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                      {isMobile && (
                        <ChevronRight size={18} color="#94a3b8" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Right: Album Detail & Photos Dropzone (Shown on desktop, or mobile when in detail view) */}
        {activeAlbum && (!isMobile || mobileDetailView) && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: isMobile ? '1rem' : '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Mobile Back to Albums Navigation Bar */}
            {isMobile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <button
                  type="button"
                  onClick={() => setMobileDetailView(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#0f2b48',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>All Albums</span>
                </button>

                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: '6px' }}>
                  {activeAlbum.photos?.length || 0} Photos
                </span>
              </div>
            )}

            {/* Active Album Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#7c3aed',
                    background: '#f5f3ff',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase'
                  }}>
                    {activeAlbum.tag || activeAlbum.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAlbum(activeAlbum);
                      setEditAlbumTitle(activeAlbum.title);
                      setEditAlbumSubtitle(activeAlbum.subtitle || '');
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                    title="Edit album title and subtitle"
                  >
                    <Edit2 size={11} />
                    <span>Edit Album Info</span>
                  </button>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2b48', margin: '4px 0 2px' }}>
                  {activeAlbum.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  {activeAlbum.subtitle} • {activeAlbum.photos?.length || 0} Photos
                </p>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleBatchUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
            </div>

            {/* Photos Grid with Inline "+ Add Photos" Card beside the last image */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: isMobile ? '0.75rem' : '1rem'
            }}>
              {activeAlbum.photos?.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '130px', background: '#091a2f' }}>
                    <img
                      src={normalizeImageUrl(photo.imageUrl)}
                      alt={photo.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    
                    {/* Top Action Buttons (Edit + Delete) */}
                    <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhoto(photo);
                          setEditPhotoTitle(photo.title || '');
                        }}
                        title="Edit photo caption"
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Edit2 size={12} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        title="Delete photo"
                        style={{
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div 
                    onClick={() => {
                      setEditingPhoto(photo);
                      setEditPhotoTitle(photo.title || '');
                    }}
                    style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                    title={photo.title ? `Click to edit: "${photo.title}"` : 'Click to add a photo caption'}
                  >
                    {photo.title ? (
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f2b48', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {photo.title}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: 600 }}>
                        + Add caption
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Inline Add / Upload Card (Beside the last photo) */}
              <div
                onClick={() => !isUploading && fileInputRef.current && fileInputRef.current.click()}
                style={{
                  minHeight: '190px',
                  borderRadius: '12px',
                  border: '2px dashed #cbd5e1',
                  background: isUploading ? '#faf5ff' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isUploading) {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.background = '#f5f3ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUploading) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isUploading ? '#ede9fe' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                  {isUploading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Plus size={22} strokeWidth={2.5} />
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2b48' }}>
                    {isUploading ? 'Uploading...' : 'Add Photos'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    Click or drop files
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty selection state for desktop when no active album */}
        {!activeAlbum && !isMobile && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '3rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            Select an album from the left or create a new one.
          </div>
        )}

      </div>

      {/* 4. Edit Album Metadata Modal */}
      {editingAlbum && (
        <div 
          onClick={() => setEditingAlbum(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                Edit Album Information
              </h3>
              <button
                type="button"
                onClick={() => setEditingAlbum(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAlbumEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Album Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editAlbumTitle}
                  onChange={(e) => setEditAlbumTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={editAlbumSubtitle}
                  onChange={(e) => setEditAlbumSubtitle(e.target.value)}
                  placeholder="e.g. Hyderabad Hitec City • 1,200 Certified Advisors"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingAlbum(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Photo Caption Modal */}
      {editingPhoto && (
        <div 
          onClick={() => setEditingPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', margin: 0 }}>
                Edit Photo Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div style={{ width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', background: '#091a2f', marginBottom: '1rem' }}>
              <img
                src={normalizeImageUrl(editingPhoto.imageUrl)}
                alt={editingPhoto.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <form onSubmit={handleSavePhotoEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Photo Caption <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={editPhotoTitle}
                  onChange={(e) => setEditPhotoTitle(e.target.value)}
                  placeholder="e.g. Executive Consultation Desk (leave blank if none)"
                  style={{ width: '100%', padding: '9px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
