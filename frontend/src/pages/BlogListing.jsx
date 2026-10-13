import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Tag, 
  Eye, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogService } from '../services/api';

export default function BlogListing() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [selectedCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await blogService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading blog categories', err);
    }
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getPublishedBlogs(selectedCategory, searchQuery);
      setBlogs(data || []);
    } catch (err) {
      console.error('Error loading blogs', err);
    } finally {
      setLoading(false);
    }
  };

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const regularPosts = blogs.length > 0 ? blogs.slice(1) : [];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. HERO HEADER */}
      <section style={{
        background: 'linear-gradient(135deg, #091726 0%, #0f2b48 100%)',
        color: '#ffffff',
        padding: '5rem 1rem 4rem 1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '880px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#34d399',
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={14} /> Knowledge Hub & Insurance Guides
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 4vw, 3.1rem)',
            fontWeight: 900,
            lineHeight: 1.2,
            margin: '0 0 1rem 0',
            color: '#ffffff'
          }}>
            Unbiased Insights, Regulatory Rules & <br />
            <span style={{ color: '#38bdf8' }}>Smart Insurance Decisions</span>
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: '#cbd5e1',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 2.25rem auto'
          }}>
            Expert breakdowns on health waiting periods, motor claim settlements, IRDAI compliance, and financial protection for Indian families.
          </p>

          {/* Search Box */}
          <div style={{
            maxWidth: '560px',
            margin: '0 auto',
            position: 'relative'
          }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search guides (e.g. porting, zero dep, cashless)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px 14px 48px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTER BAR */}
      <div className="container" style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '-1.5rem auto 2.5rem auto', padding: '0 1rem' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '0.75rem 1.25rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              background: selectedCategory === '' ? '#0f2b48' : '#f1f5f9',
              color: selectedCategory === '' ? '#ffffff' : '#475569',
              border: 'none',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            All Articles ({blogs.length})
          </button>

          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#0f2b48' : '#f1f5f9',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                border: 'none',
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN ARTICLES FEED */}
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: '#64748b' }}>
            <FileText size={40} color="#059669" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
            <div>Loading verified insurance guides...</div>
          </div>
        ) : blogs.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#0f2b48', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>No Articles Found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              No guides currently match your selected topic or search criteria.
            </p>
            <button
              onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
              style={{
                background: '#0f2b48',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* FEATURED HERO POST (If no active search filter) */}
            {featuredPost && !selectedCategory && !searchQuery && (
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                marginBottom: '2.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                alignItems: 'center'
              }}>
                <div style={{ height: '100%', minHeight: '300px', position: 'relative' }}>
                  <img
                    src={featuredPost.coverImageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=630&q=80'}
                    alt={featuredPost.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    background: '#0f2b48',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Featured Guide
                  </div>
                </div>

                <div style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{
                      background: '#ecfdf5',
                      color: '#059669',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {featuredPost.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {featuredPost.readTimeMinutes || 5} min read
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.3, margin: '0 0 1rem 0' }}>
                    <Link to={`/blog/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
                    {featuredPost.summary}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                      By {featuredPost.authorName}
                    </span>
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      style={{
                        background: '#0f2b48',
                        color: '#ffffff',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        textDecoration: 'none'
                      }}
                    >
                      Read Full Guide <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* REGULAR ARTICLES GRID */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.75rem'
            }}>
              {(selectedCategory || searchQuery ? blogs : regularPosts).map((post) => (
                <article
                  key={post.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  <div style={{ height: '190px', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={post.coverImageUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {post.category}
                    </div>
                  </div>

                  <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={12} /> {post.readTimeMinutes || 5} min read
                      </span>
                      {post.viewCount > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Eye size={12} /> {post.viewCount} views
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f2b48', lineHeight: 1.35, margin: '0 0 0.65rem 0' }}>
                      <Link to={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {post.title}
                      </Link>
                    </h3>

                    <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.5, margin: '0 0 1.25rem 0', flex: 1 }}>
                      {post.summary}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                      <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                        {post.authorName}
                      </span>
                      <Link
                        to={`/blog/${post.slug}`}
                        style={{
                          color: '#0284c7',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none'
                        }}
                      >
                        Read Article <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
