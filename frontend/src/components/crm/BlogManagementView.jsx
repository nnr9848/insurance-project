import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  Clock, 
  ExternalLink, 
  X, 
  Save, 
  RotateCcw,
  Sparkles,
  MoreVertical,
  BookOpen
} from 'lucide-react';
import ActionDropdown from '../common/ActionDropdown';
import { blogService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function BlogManagementView() {
  const toast = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Blog Post Form
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    category: 'Health Insurance',
    summary: '',
    content: '',
    coverImageUrl: '',
    authorName: 'Aadhiraksha Research Desk',
    readTimeMinutes: 5,
    metaTitle: '',
    metaDescription: '',
    isPublished: true
  });

  const categories = [
    'Health Insurance',
    'Motor Insurance',
    'Life & Savings',
    'Claims & Cashless',
    'IRDAI Regulations',
    'Corporate & SME'
  ];

  useEffect(() => {
    loadBlogs();
  }, [categoryFilter, search]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAdminBlogs(categoryFilter, search);
      setBlogs(data || []);
    } catch (err) {
      console.error('Error loading admin blogs', err);
      toast.error('Failed to load blog posts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await blogService.createBlog(newBlog);
      setBlogs((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewBlog({
        title: '',
        slug: '',
        category: 'Health Insurance',
        summary: '',
        content: '',
        coverImageUrl: '',
        authorName: 'Aadhiraksha Research Desk',
        readTimeMinutes: 5,
        metaTitle: '',
        metaDescription: '',
        isPublished: true
      });
      toast.success(`Article "${created.title}" published successfully!`);
    } catch (err) {
      console.error('Error creating blog post', err);
      toast.error('Failed to create article: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog) return;
    setIsSubmitting(true);
    try {
      const updated = await blogService.updateBlog(editingBlog.id, editingBlog);
      setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingBlog(null);
      toast.success(`Article "${updated.title}" updated successfully!`);
    } catch (err) {
      console.error('Error updating blog post', err);
      toast.error('Failed to update article: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (id, title, currentlyPublished) => {
    try {
      const updated = await blogService.togglePublishStatus(id);
      setBlogs((prev) => prev.map((b) => (b.id === id ? updated : b)));
      toast.success(
        currentlyPublished 
          ? `Article "${title}" moved to draft status.` 
          : `Article "${title}" published live to blog hub!`
      );
    } catch (err) {
      console.error('Error toggling publish status', err);
      toast.error('Failed to update publish state: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBlog = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete article "${title}"?`)) return;
    try {
      await blogService.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      toast.success(`Article "${title}" deleted.`);
    } catch (err) {
      console.error('Error deleting blog post', err);
      toast.error('Failed to delete article: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#091726', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} color="#059669" /> Blog & SEO Content Hub
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Publish educational insurance guides, manage organic SEO keywords, and drive high-intent leads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          style={{
            background: '#0f2b48',
            color: '#ffffff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.86rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Article
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by article title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '9px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            background: '#ffffff',
            fontWeight: 600
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginLeft: 'auto' }}>
          {blogs.length} articles found
        </span>
      </div>

      {/* Articles Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Article Title & Slug</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Author & Read Time</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Views</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Loading blog posts...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <BookOpen size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                    <div>No blog posts found matching your criteria.</div>
                  </td>
                </tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', maxWidth: '320px' }}>
                      <div style={{ fontWeight: 800, color: '#091726', fontSize: '0.92rem' }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        /blog/{b.slug}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#0f2b48',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700
                      }}>
                        {b.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.82rem', color: '#475569' }}>
                      <div>{b.authorName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{b.readTimeMinutes || 5} min read</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {b.isPublished ? (
                        <span style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <CheckCircle2 size={11} /> Published
                        </span>
                      ) : (
                        <span style={{
                          background: '#fef3c7',
                          color: '#b45309',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          Draft
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: '#091726' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={13} color="#94a3b8" /> {b.viewCount || 0}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <ActionDropdown
                        menuWidth="220px"
                        trigger={({ isOpen }) => (
                          <button
                            type="button"
                            title="Actions"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: isOpen ? '#f1f5f9' : '#ffffff',
                              color: '#475569',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                      >
                        {({ close }) => (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                setEditingBlog({ ...b });
                              }}
                              className="crm-popover-btn"
                            >
                              <Edit3 size={14} color="#2563eb" /> Edit Article & SEO
                            </button>

                            <a
                              href={`/blog/${b.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => close()}
                              className="crm-popover-btn"
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              <ExternalLink size={14} color="#059669" /> View Public Article
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                close();
                                handleTogglePublish(b.id, b.title, b.isPublished !== false);
                              }}
                              className="crm-popover-btn"
                            >
                              <Sparkles size={14} color="#d97706" /> 
                              {b.isPublished !== false ? 'Move to Draft' : 'Publish Live'}
                            </button>

                            <div style={{ height: '1px', background: 'var(--crm-border-subtle, #f1f5f9)', margin: '4px 0' }} />

                            <button
                              type="button"
                              onClick={() => {
                                close();
                                handleDeleteBlog(b.id, b.title);
                              }}
                              className="crm-popover-btn danger"
                            >
                              <Trash2 size={14} color="#dc2626" /> Delete Article
                            </button>
                          </>
                        )}
                      </ActionDropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Blog */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#091726', margin: 0 }}>
                Publish New Insurance Guide
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBlog}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Critical Traps to Avoid During Health Insurance Porting"
                  className="form-input"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. health-insurance-porting-guide"
                    className="form-input"
                    value={newBlog.slug}
                    onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Short Summary (Snippet for Google & Cards)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="A brief 1-2 sentence overview of the article..."
                  className="form-input"
                  value={newBlog.summary}
                  onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Article Content (Markdown supported with ##, ###, and - bullet points) *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write complete educational article content here..."
                  className="form-input"
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="form-input"
                    value={newBlog.coverImageUrl}
                    onChange={(e) => setNewBlog({ ...newBlog, coverImageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Read Time (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newBlog.readTimeMinutes}
                    onChange={(e) => setNewBlog({ ...newBlog, readTimeMinutes: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  id="createIsPublished"
                  checked={newBlog.isPublished}
                  onChange={(e) => setNewBlog({ ...newBlog, isPublished: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                />
                <label htmlFor="createIsPublished" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#091726', cursor: 'pointer' }}>
                  Publish live immediately on public website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.6rem 1.25rem', background: '#059669', border: 'none', borderRadius: '8px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Blog */}
      {editingBlog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#091726', margin: 0 }}>
                Edit Article & SEO Details
              </h2>
              <button
                type="button"
                onClick={() => setEditingBlog(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateBlog}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Article Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">URL Slug</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingBlog.slug}
                    onChange={(e) => setEditingBlog({ ...editingBlog, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Short Summary</label>
                <textarea
                  rows={2}
                  required
                  className="form-input"
                  value={editingBlog.summary || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, summary: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Article Content</label>
                <textarea
                  rows={8}
                  required
                  className="form-input"
                  value={editingBlog.content || ''}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={editingBlog.coverImageUrl || ''}
                    onChange={(e) => setEditingBlog({ ...editingBlog, coverImageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Read Time (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={editingBlog.readTimeMinutes || 5}
                    onChange={(e) => setEditingBlog({ ...editingBlog, readTimeMinutes: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                <input
                  type="checkbox"
                  id="editIsPublished"
                  checked={editingBlog.isPublished !== false}
                  onChange={(e) => setEditingBlog({ ...editingBlog, isPublished: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                />
                <label htmlFor="editIsPublished" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#091726', cursor: 'pointer' }}>
                  Live Published on public blog
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '0.6rem 1.25rem', background: '#059669', border: 'none', borderRadius: '8px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
