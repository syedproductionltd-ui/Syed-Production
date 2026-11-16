'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';

interface GalleryImageItem {
  imageUrl: string;
  altText: string;
  hidden: boolean;
  sortOrder?: number;
}

interface GalleryPost {
  _id?: string;
  id: string;
  title: string;
  category: string;
  coverImage: string;
  images: GalleryImageItem[];
  isPublished: boolean;
  createdAt?: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal / Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Wedding');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formImages, setFormImages] = useState<GalleryImageItem[]>([]);
  /** Cover tracked by URL so remove/reorder/add cannot point at the wrong image. */
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    // Check auth status by fetching posts
    checkAuthAndFetchPosts();
  }, []);

  const checkAuthAndFetchPosts = async () => {
    setLoading(true);
    try {
      const checkRes = await fetch('/api/admin/check');
      const checkData = await checkRes.json();
      if (!checkData.success) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/gallery?admin=true');
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setPosts(data.posts);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        checkAuthAndFetchPosts();
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setPosts([]);
  };

  const openCreateModal = () => {
    setCurrentPostId(null);
    setFormTitle('Syed Production Post');
    setFormCategory('Portfolio');
    setFormIsPublished(true);
    setFormImages([]);
    setFormCoverUrl('');
    setUploadMessage('');
    setFormStatus(null);
    setDragIndex(null);
    setIsEditing(true);
  };

  const normalizeFormImages = (imgs: GalleryImageItem[]) =>
    imgs.map((img, idx) => ({ ...img, sortOrder: idx + 1 }));

  const openEditModal = (post: GalleryPost) => {
    setCurrentPostId(post.id);
    setFormTitle(post.title);
    setFormCategory(post.category || 'Portfolio');
    setFormIsPublished(post.isPublished ?? true);
    const imgs = [...(post.images || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setFormImages(normalizeFormImages(imgs));
    setFormCoverUrl(post.coverImage || imgs[0]?.imageUrl || '');
    setUploadMessage('');
    setFormStatus(null);
    setDragIndex(null);
    setIsEditing(true);
  };

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadMessage('');
    setFormStatus(null);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file) {
        formData.append('files', file);
      }
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      let data: { success?: boolean; urls?: string[]; files?: string[]; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Upload failed (HTTP ${res.status}): response was not JSON`);
      }

      const urls = data.urls || data.files;
      if (res.ok && data.success && urls && urls.length > 0) {
        setFormImages((prev) => {
          const start = prev.length;
          const newItems: GalleryImageItem[] = urls.map((url: string, i) => ({
            imageUrl: url,
            altText: formTitle || 'Syed Production shoot',
            hidden: false,
            sortOrder: start + i + 1,
          }));
          const next = [...prev, ...newItems];
          if (!formCoverUrl && urls[0]) setFormCoverUrl(urls[0]);
          return normalizeFormImages(next);
        });
        const ok = `Successfully uploaded ${urls.length} image(s).`;
        setUploadMessage(ok);
        setMessage(ok);
        setTimeout(() => {
          setMessage('');
          setUploadMessage('');
        }, 4000);
      } else {
        const errText = data.error || `Upload failed (HTTP ${res.status})`;
        setUploadMessage(errText);
        setFormStatus({ type: 'error', text: errText });
      }
    } catch (err) {
      const errText = err instanceof Error ? err.message : 'Error uploading images';
      setUploadMessage(errText);
      setFormStatus({ type: 'error', text: errText });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => {
      const removed = prev[index];
      const next = prev.filter((_, i) => i !== index);
      if (removed && formCoverUrl === removed.imageUrl) {
        setFormCoverUrl(next[0]?.imageUrl || '');
      }
      return normalizeFormImages(next);
    });
  };

  const handleMoveImage = (index: number, direction: number) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= formImages.length) return;
    setFormImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      if (item) updated.splice(newIdx, 0, item);
      return normalizeFormImages(updated);
    });
  };

  const moveImageTo = (index: number, target: 'first' | 'middle' | 'last') => {
    setFormImages((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      if (!item) return prev;
      let dest = 0;
      if (target === 'last') dest = updated.length;
      else if (target === 'middle') dest = Math.floor(updated.length / 2);
      updated.splice(dest, 0, item);
      return normalizeFormImages(updated);
    });
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setFormImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(dragIndex, 1);
      if (!item) return prev;
      updated.splice(index, 0, item);
      return normalizeFormImages(updated);
    });
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  const handleOrderInput = (index: number, value: string) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    const clamped = Math.max(1, Math.min(formImages.length, n));
    if (clamped === index + 1) return;
    setFormImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      if (!item) return prev;
      updated.splice(clamped - 1, 0, item);
      return normalizeFormImages(updated);
    });
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formImages.length === 0) {
      const msg = 'Please add at least one photograph.';
      setFormStatus({ type: 'error', text: msg });
      return;
    }

    const normalizedImages = normalizeFormImages(formImages);
    const coverStillPresent = normalizedImages.some((img) => img.imageUrl === formCoverUrl);
    const coverImage = (coverStillPresent ? formCoverUrl : normalizedImages[0]?.imageUrl) || '';
    const payload = {
      id: currentPostId || `post-${Date.now()}`,
      title: formTitle.trim() || 'Syed Production Post',
      category: formCategory || 'Portfolio',
      coverImage,
      images: normalizedImages,
      isPublished: formIsPublished,
    };

    startTransition(async () => {
      try {
        const url = currentPostId ? `/api/gallery/${currentPostId}` : '/api/gallery';
        const method = currentPostId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        let data: { success?: boolean; error?: string } = {};
        try {
          data = await res.json();
        } catch {
          throw new Error(`Save failed (HTTP ${res.status})`);
        }

        if (res.ok && data.success) {
          const ok = currentPostId ? 'Order saved. Post updated successfully!' : 'Post created and order saved successfully!';
          setMessage(ok);
          setFormStatus({ type: 'success', text: ok });
          setFormImages(normalizedImages);
          setIsEditing(false);
          checkAuthAndFetchPosts();
          setTimeout(() => setMessage(''), 4000);
        } else {
          setFormStatus({ type: 'error', text: data.error || `Failed to save order (HTTP ${res.status})` });
        }
      } catch (err) {
        setFormStatus({ type: 'error', text: err instanceof Error ? err.message : 'Error saving gallery post' });
      }
    });
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery post?')) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setMessage('Post deleted successfully.');
          checkAuthAndFetchPosts();
          setTimeout(() => setMessage(''), 4000);
        } else {
          alert(data.error || 'Failed to delete post');
        }
      } catch (err) {
        alert('Error deleting post');
      }
    });
  };

  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1329', color: '#fff' }}>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1329', padding: '20px' }}>
        <div style={{ background: '#111827', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid #1f2937' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>Syed Production Admin</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>Gallery Management System</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '14px', marginBottom: '8px' }}>Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{ width: '100%', padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
              />
            </div>
            {loginError && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{loginError}</p>}
            <button
              type="submit"
              style={{ width: '100%', padding: '12px', background: '#0077b6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              Login to Admin
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'underline' }}>← Back to Website</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b1329', color: '#f3f4f6', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>Gallery Management</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Syed Production Admin Panel — Manage multi-photo posts & albums</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/" target="_blank" style={{ padding: '8px 16px', background: '#1f2937', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '14px' }}>
              View Website ↗
            </Link>
            <button
              onClick={handleLogout}
              style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
            >
              Logout
            </button>
          </div>
        </header>

        {message && (
          <div style={{ padding: '12px 20px', background: '#065f46', color: '#d1fae5', borderRadius: '6px', marginBottom: '20px', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', color: '#fff' }}>All Gallery Posts ({posts.length})</h2>
          <button
            onClick={openCreateModal}
            style={{ padding: '10px 20px', background: '#0077b6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            + Create New Post
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#111827', borderRadius: '8px', border: '1px solid #1f2937' }}>
            <p style={{ color: '#9ca3af', marginBottom: '16px' }}>No gallery posts found.</p>
            <button onClick={openCreateModal} style={{ padding: '10px 20px', background: '#0077b6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Create First Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {posts.map((post) => (
              <div key={post.id} style={{ background: '#111827', borderRadius: '8px', border: '1px solid #1f2937', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', background: '#1f2937', backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {post.category || 'Portfolio'}
                  </span>
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: post.isPublished ? '#059669' : '#b91c1c', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>{post.title}</h3>
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}>{post.images?.length || 0} photo(s) in post</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1f2937' }}>
                    <button
                      onClick={() => openEditModal(post)}
                      style={{ flex: 1, padding: '8px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Edit Post
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isEditing && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
            <div style={{ background: '#111827', width: '100%', maxWidth: '800px', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', color: '#fff' }}>{currentPostId ? 'Edit Gallery Post' : 'Create New Gallery Post'}</h2>
                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
              </div>

              <form onSubmit={handleSavePost}>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#d1d5db' }}>
                    <input
                      type="checkbox"
                      checked={formIsPublished}
                      onChange={(e) => setFormIsPublished(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Published on website
                  </label>
                </div>

                <div style={{ marginBottom: '20px', borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#d1d5db', fontWeight: 600 }}>
                    Photographs ({formImages.length} images in this post)
                  </label>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                    Upload multiple photographs together. Drag cards, set the Order number, or use First/Middle/Last to control display position. Click &quot;Save Order&quot; to persist changes.
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'inline-block', padding: '10px 20px', background: '#0077b6', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                      {uploading ? 'Uploading...' : '+ Upload Multiple Photographs'}
                      <input type="file" multiple accept="image/*" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                    </label>
                    {uploadMessage && (
                      <p
                        style={{
                          marginTop: '10px',
                          fontSize: '13px',
                          color: uploadMessage.startsWith('Successfully') ? '#6ee7b7' : '#fca5a5',
                        }}
                      >
                        {uploadMessage}
                      </p>
                    )}
                  </div>

                  {formImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginTop: '12px' }}>
                      {formImages.map((img, idx) => (
                        <div
                          key={img.imageUrl || idx}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          style={{
                            background: '#1f2937',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: formCoverUrl === img.imageUrl ? '2px solid #0077b6' : '1px solid #374151',
                            position: 'relative',
                            opacity: dragIndex === idx ? 0.6 : 1,
                            cursor: 'grab',
                          }}
                          title="Drag to reorder"
                        >
                          <div style={{ height: '100px', backgroundImage: `url(${img.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <label style={{ fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Order
                                <input
                                  type="number"
                                  min={1}
                                  max={formImages.length}
                                  value={idx + 1}
                                  onChange={(e) => handleOrderInput(idx, e.target.value)}
                                  style={{ width: '44px', padding: '2px 4px', background: '#111827', border: '1px solid #374151', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                                />
                              </label>
                              <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#fff' }}>
                                <input
                                  type="radio"
                                  name="coverImageChoice"
                                  checked={formCoverUrl === img.imageUrl}
                                  onChange={() => setFormCoverUrl(img.imageUrl)}
                                />
                                Cover
                              </label>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => moveImageTo(idx, 'first')} disabled={idx === 0} style={{ background: '#374151', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>First</button>
                              <button type="button" onClick={() => moveImageTo(idx, 'middle')} style={{ background: '#374151', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>Middle</button>
                              <button type="button" onClick={() => moveImageTo(idx, 'last')} disabled={idx === formImages.length - 1} style={{ background: '#374151', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>Last</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button type="button" onClick={() => handleMoveImage(idx, -1)} disabled={idx === 0} style={{ background: '#374151', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}>↑</button>
                                <button type="button" onClick={() => handleMoveImage(idx, 1)} disabled={idx === formImages.length - 1} style={{ background: '#374151', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}>↓</button>
                              </div>
                              <button type="button" onClick={() => handleRemoveImage(idx)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '2px 6px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {formStatus && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      background: formStatus.type === 'success' ? '#065f46' : 'rgba(239, 68, 68, 0.15)',
                      color: formStatus.type === 'success' ? '#d1fae5' : '#fca5a5',
                      border: formStatus.type === 'success' ? '1px solid #047857' : '1px solid rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    {formStatus.text}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #1f2937', paddingTop: '20px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{ padding: '10px 20px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || uploading}
                    style={{ padding: '10px 20px', background: '#0077b6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {isPending ? 'Saving Order...' : 'Save Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
