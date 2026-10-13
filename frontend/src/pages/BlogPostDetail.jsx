import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  User, 
  Share2, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  ChevronRight,
  BookOpen,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { blogService } from '../services/api';
import { useBusinessProfile } from '../context/BusinessProfileContext';
import { useToast } from '../context/ToastContext';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const toast = useToast();
  const { businessProfile } = useBusinessProfile();
  const helplinePhone = businessProfile?.primaryPhone || '+91 8367415156';

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await blogService.getBlogBySlug(slug);
      setPost(data);

      // Load related posts in same category
      if (data?.category) {
        const related = await blogService.getPublishedBlogs(data.category, '');
        setRelatedPosts((related || []).filter(p => p.slug !== slug).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching blog post', err);
      setError('Article could not be found or has been moved.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Article link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <BookOpen size={40} color="#059669" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
          <div>Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ background: '#f8fafc', minHeight: '80vh', padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', background: '#ffffff', padding: '3rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#0f2b48', fontSize: '1.4rem', marginBottom: '0.75rem' }}>Article Not Found</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            The article you are looking for may have been updated or moved to another section.
          </p>
          <Link
            to="/blog"
            style={{
              background: '#0f2b48',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Return to Blog Hub
          </Link>
        </div>
      </div>
    );
  }

  // Convert markdown-style simple headings and bullet points to clean JSX
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} style={{ color: '#0f2b48', fontSize: '1.25rem', fontWeight: 800, margin: '1.75rem 0 0.75rem 0', lineHeight: 1.3 }}>
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} style={{ color: '#0f2b48', fontSize: '1.55rem', fontWeight: 800, margin: '2.25rem 0 0.85rem 0', lineHeight: 1.3, borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={idx} style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.7, marginLeft: '1.5rem', marginBottom: '0.4rem' }}>
            {trimmed.replace(/^(\* |- )/, '')}
          </li>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={idx} style={{ color: '#334155', fontSize: '1rem', lineHeight: 1.7, marginLeft: '1.5rem', marginBottom: '0.4rem' }}>
            {trimmed.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (trimmed === '') {
        return <div key={idx} style={{ height: '0.85rem' }} />;
      }
      return (
        <p key={idx} style={{ color: '#334155', fontSize: '1.02rem', lineHeight: 1.75, margin: '0 0 1rem 0' }}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* 1. BREADCRUMBS & ARTICLE HERO HEADER */}
      <section style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '3rem 1rem 2.5rem 1rem'
      }}>
        <div className="container" style={{ maxWidth: '840px', margin: '0 auto' }}>
          {/* Breadcrumb nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <Link to="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Insurance Guides</Link>
            <ChevronRight size={13} />
            <span style={{ color: '#059669', fontWeight: 700 }}>{post.category}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              {post.category}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> {post.readTimeMinutes || 5} min read
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.9rem, 3.8vw, 2.7rem)',
            fontWeight: 900,
            color: '#0f2b48',
            lineHeight: 1.25,
            margin: '0 0 1.25rem 0'
          }}>
            {post.title}
          </h1>

          <p style={{ fontSize: '1.08rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
            {post.summary}
          </p>

          {/* Author & Share Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#0f2b48',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f2b48' }}>
                  {post.authorName || 'Aadhiraksha Research Desk'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Verified Regulatory Advisory
                </div>
              </div>
            </div>

            <button
              onClick={handleShare}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={15} /> Share Guide
            </button>
          </div>
        </div>
      </section>

      {/* 2. COVER IMAGE */}
      {post.coverImageUrl && (
        <div className="container" style={{ maxWidth: '840px', margin: '2rem auto 0 auto', padding: '0 1rem' }}>
          <img
            src={post.coverImageUrl}
            alt={post.title}
            style={{
              width: '100%',
              maxHeight: '440px',
              objectFit: 'cover',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
            }}
          />
        </div>
      )}

      {/* 3. MAIN ARTICLE BODY */}
      <div className="container" style={{ maxWidth: '840px', margin: '2rem auto 0 auto', padding: '0 1rem' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}>
          <div className="article-content">
            {renderFormattedContent(post.content)}
          </div>

          {/* IN-ARTICLE CONTEXTUAL CTA CARD */}
          <div style={{
            marginTop: '3rem',
            background: 'linear-gradient(135deg, #091726 0%, #0f2b48 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '2rem',
            border: '1px solid #1e3a5f',
            boxShadow: '0 8px 20px rgba(15, 43, 72, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <ShieldCheck size={16} /> UNBIASED ADVISORY WITH ZERO PRESSURE
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              Need Help Reviewing Your Existing Insurance Policy?
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Our IRDAI certified advisors audit waiting periods, exclusions, and co-pay clauses across 20+ top insurers for free.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                to="/insurance/health"
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Compare Plans Online <ArrowRight size={15} />
              </Link>

              <a
                href={`tel:${helplinePhone.replace(/[^0-9+]/g, '')}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Phone size={15} /> Call Advisor: {helplinePhone}
              </a>
            </div>
          </div>
        </div>

        {/* 4. RELATED ARTICLES STRIP */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2b48', marginBottom: '1.25rem' }}>
              Related Guides in {post.category}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669' }}>
                      {rel.category}
                    </span>
                    <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f2b48', margin: '0.35rem 0 0.5rem 0', lineHeight: 1.35 }}>
                      <Link to={`/blog/${rel.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {rel.title}
                      </Link>
                    </h4>
                  </div>
                  <Link
                    to={`/blog/${rel.slug}`}
                    style={{
                      fontSize: '0.8rem',
                      color: '#0284c7',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '0.75rem'
                    }}
                  >
                    Read Guide <ChevronRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
