'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { upload as uploadBlob } from '@vercel/blob/client';

interface GalleryImageItem {
  imageUrl: string;
  altText: string;
  hidden: boolean;
  sortOrder?: number;
  _cid?: string;
}

interface GalleryPost {
  _id?: string;
  id: string;
  title: string;
  category: string;
  coverImage: string;
  images: GalleryImageItem[];
  isPublished: boolean;
  sortOrder?: number;
  createdAt?: string;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES_PER_UPLOAD = 10;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
};
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function imageExtension(file: File): string {
  const byType = IMAGE_EXTENSIONS[file.type];
  if (byType) return byType;
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  if (!ALLOWED_EXTENSIONS.has(ext)) return '.jpg';
  return ext === '.jpeg' ? '.jpg' : ext;
}

function isAllowedImage(file: File): boolean {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return true;
  return ALLOWED_EXTENSIONS.has(file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '');
}

const reindex = <T extends { sortOrder?: number }>(list: T[]) =>
  list.map((item, index) => ({ ...item, sortOrder: index + 1 }));

const moveById = <T,>(list: T[], getId: (item: T) => string, fromId: string, toId: string) => {
  const from = list.findIndex((item) => getId(item) === fromId);
  const to = list.findIndex((item) => getId(item) === toId);
  if (from < 0 || to < 0 || from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  if (!moved) return list;
  next.splice(to, 0, moved);
  return next;
};

const moveToPosition = <T,>(list: T[], index: number, pos1based: number) => {
  if (index < 0 || index >= list.length) return list;
  const to = Math.min(Math.max(pos1based, 1), list.length) - 1;
  if (index === to) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  if (!moved) return list;
  next.splice(to, 0, moved);
  return next;
};

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
        const loaded: GalleryPost[] = data.posts || [];
        const ids = loaded.map((p) => p.id);
        console.log('[POST] loaded', { count: loaded.length, uniqueIds: new Set(ids).size, ids });
        setPosts(reindex(loaded));
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
    dragIdRef.current = null;
    setDragId(null);
    setIsEditing(true);
  };

  const ensureClientIds = (imgs: GalleryImageItem[]) =>
    imgs.map((img, idx) => ({ ...img, _cid: img._cid || `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}` }));

  const normalizeFormImages = (imgs: GalleryImageItem[]) => reindex(imgs);

  const openEditModal = (post: GalleryPost) => {
    setCurrentPostId(post.id);
    setFormTitle(post.title);
    setFormCategory(post.category || 'Portfolio');
    setFormIsPublished(post.isPublished ?? true);
    const imgs = [...(post.images || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setFormImages(normalizeFormImages(ensureClientIds(imgs)));
    setFormCoverUrl(post.coverImage || imgs[0]?.imageUrl || '');
    setUploadMessage('');
    setFormStatus(null);
    dragIdRef.current = null;
    setDragId(null);
    setIsEditing(true);
  };

  const [dragId, setDragId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [postDragId, setPostDragId] = useState<string | null>(null);
  const postDragIdRef = useRef<string | null>(null);
  const [postsOrderStatus, setPostsOrderStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingPostsOrder, setSavingPostsOrder] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selected = Array.from(files);
    const fail = (text: string) => {
      setUploadMessage(text);
      setFormStatus({ type: 'error', text });
      e.target.value = '';
    };

    if (selected.length > MAX_IMAGES_PER_UPLOAD) {
      fail(`You can upload up to ${MAX_IMAGES_PER_UPLOAD} images at a time.`);
      return;
    }
    const invalid = selected.find((file) => !isAllowedImage(file));
    if (invalid) {
      fail(`Unsupported file type: ${invalid.name}`);
      return;
    }
    const tooLarge = selected.find((file) => file.size === 0 || file.size > MAX_IMAGE_BYTES);
    if (tooLarge) {
      fail(`"${tooLarge.name}" must be between 1 byte and 10 MB.`);
      return;
    }

    setUploading(true);
    setUploadMessage('');
    setFormStatus(null);

    try {
      let urls: string[] = [];
      const configRes = await fetch('/api/upload', { method: 'GET' });
      const config = configRes.ok ? await configRes.json().catch(() => ({})) : {};

      if (config.directUpload) {
        urls = await Promise.all(
          selected.map(async (file) => {
            const pathname = `gallery/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${imageExtension(file)}`;
            const blob = await uploadBlob(pathname, file, {
              access: 'public',
              handleUploadUrl: '/api/upload/token',
              contentType: file.type || undefined,
            });
            return blob.url;
          })
        );
      } else {
        const formData = new FormData();
        selected.forEach((file) => formData.append('files', file));
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const text = await res.text();
        let data: { success?: boolean; urls?: string[]; files?: string[]; error?: string } = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          if (res.status === 413) {
            throw new Error('Upload too large for this server. Upload images one at a time or use files under 4 MB.');
          }
          throw new Error(`Upload failed (HTTP ${res.status}): ${text.slice(0, 120) || 'non-JSON response'}`);
        }
        const returned = data.urls || data.files;
        if (!res.ok || !data.success || !returned?.length) {
          throw new Error(data.error || `Upload failed (HTTP ${res.status})`);
        }
        urls = returned;
      }

      setFormImages((prev) => {
        const start = prev.length;
        const newItems: GalleryImageItem[] = urls.map((url, i) => ({
          imageUrl: url,
          altText: formTitle || 'Syed Production shoot',
          hidden: false,
          sortOrder: start + i + 1,
          _cid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${i}`,
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

  const handleImageDragStart = (e: React.DragEvent, id: string) => {
    console.log('[IMG] dragstart', { id });
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch {}
    requestAnimationFrame(() => setDragId(id));
  };
  const handleImageDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[IMG] dragenter', { from: dragIdRef.current, target: targetId });
  };
  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleImageDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fromId = dragIdRef.current || (() => { try { return e.dataTransfer.getData('text/plain'); } catch { return ''; } })();
    console.log('[IMG] drop', { from: fromId, target: targetId });
    if (!fromId || fromId === targetId) {
      handleImageDragEnd();
      return;
    }
    setFormImages((prev) => {
      const before = prev.map((i) => i._cid || i.imageUrl);
      const next = reindex(moveById(prev, (i) => i._cid || i.imageUrl, fromId, targetId));
      console.log('[IMG] reorder', { fromId, targetId, before, after: next.map((i) => i._cid || i.imageUrl), changed: next !== prev });
      return next;
    });
    handleImageDragEnd();
  };
  const handleImageDragEnd = () => {
    console.log('[IMG] dragend', { id: dragIdRef.current });
    dragIdRef.current = null;
    setDragId(null);
  };

  const handleOrderInput = (index: number, value: string) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    setFormImages((prev) => {
      const before = prev.map((i) => i._cid || i.imageUrl);
      const next = reindex(moveToPosition(prev, index, n));
      console.log('[IMG] order-input', { index, to: n, before, after: next.map((i) => i._cid || i.imageUrl), changed: next !== prev });
      return next;
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

  const handlePostDragStart = (e: React.DragEvent, id: string) => {
    console.log('[POST] dragstart', { id });
    postDragIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', id); } catch {}
    requestAnimationFrame(() => setPostDragId(id));
  };
  const handlePostDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[POST] dragenter', { from: postDragIdRef.current, target: targetId });
  };
  const handlePostDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };
  const handlePostDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const fromId = postDragIdRef.current || (() => { try { return e.dataTransfer.getData('text/plain'); } catch { return ''; } })();
    console.log('[POST] drop', { from: fromId, target: targetId });
    if (!fromId || fromId === targetId) {
      handlePostDragEnd();
      return;
    }
    setPosts((prev) => {
      const before = prev.map((p) => p.id);
      const next = reindex(moveById(prev, (p) => p.id, fromId, targetId));
      console.log('[POST] reorder', { fromId, targetId, before, after: next.map((p) => p.id), changed: next !== prev, uniqueBefore: new Set(before).size, uniqueAfter: new Set(next.map((p) => p.id)).size });
      return next;
    });
    handlePostDragEnd();
  };
  const handlePostDragEnd = () => {
    console.log('[POST] dragend', { id: postDragIdRef.current });
    postDragIdRef.current = null;
    setPostDragId(null);
  };

  const handlePostOrderInput = (index: number, value: string) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    setPosts((prev) => {
      const before = prev.map((p) => p.id);
      const next = reindex(moveToPosition(prev, index, n));
      console.log('[POST] order-input', { index, to: n, before, after: next.map((p) => p.id), changed: next !== prev });
      return next;
    });
  };

  const handleSavePostsOrder = async () => {
    if (posts.length === 0) return;
    setSavingPostsOrder(true);
    setPostsOrderStatus(null);
    try {
      const payload = posts.map((p, index) => ({ id: p.id, sortOrder: index + 1 }));
      console.log('[POST] save-order payload', payload);
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postsOrder: payload }),
      });
      let data: { success?: boolean; error?: string; matched?: number; modified?: number } = {};
      try { data = await res.json(); } catch { throw new Error(`Save failed (HTTP ${res.status})`); }
      console.log('[POST] save-order response', { status: res.status, ...data });
      if (res.ok && data.success) {
        setPosts((prev) => reindex(prev));
        setPostsOrderStatus({ type: 'success', text: 'Gallery posts order saved successfully.' });
        setMessage('Gallery posts order saved.');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setPostsOrderStatus({ type: 'error', text: data.error || `Failed to save posts order (HTTP ${res.status})` });
      }
    } catch (err) {
      setPostsOrderStatus({ type: 'error', text: err instanceof Error ? err.message : 'Error saving posts order' });
    } finally {
      setSavingPostsOrder(false);
    }
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '20px', color: '#fff' }}>All Gallery Posts ({posts.length})</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleSavePostsOrder}
              disabled={savingPostsOrder || posts.length === 0}
              style={{ padding: '10px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              {savingPostsOrder ? 'Saving Posts Order...' : 'Save Posts Order'}
            </button>
            <button
              onClick={openCreateModal}
              style={{ padding: '10px 20px', background: '#0077b6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              + Create New Post
            </button>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>Reorder gallery posts/sets with drag-and-drop or Order number, then click &quot;Save Posts Order&quot; to control website display order.</p>
        <div style={{ marginBottom: '12px', padding: '6px 10px', background: '#111827', border: '1px dashed #374151', borderRadius: '6px', fontSize: '12px', color: '#93c5fd', fontFamily: 'monospace' }}>
          DEV DnD: postDragId={String(postDragId ?? 'null')} | imageDragId={String(dragId ?? 'null')}
        </div>
        {postsOrderStatus && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', background: postsOrderStatus.type === 'success' ? '#065f46' : 'rgba(239, 68, 68, 0.15)', color: postsOrderStatus.type === 'success' ? '#d1fae5' : '#fca5a5', border: postsOrderStatus.type === 'success' ? '1px solid #047857' : '1px solid rgba(239, 68, 68, 0.4)' }}>
            {postsOrderStatus.text}
          </div>
        )}

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
            {posts.map((post, idx) => (
              <div
                key={post.id}
                draggable={true}
                onDragStart={(e) => handlePostDragStart(e, post.id)}
                onDragEnter={(e) => handlePostDragEnter(e, post.id)}
                onDragOver={handlePostDragOver}
                onDrop={(e) => handlePostDrop(e, post.id)}
                onDragEnd={handlePostDragEnd}
                style={{ background: '#111827', borderRadius: '8px', border: postDragId === post.id ? '2px dashed #0077b6' : '1px solid #1f2937', overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: postDragId === post.id ? 0.7 : 1, cursor: 'grab' }}
                title="Drag to reorder gallery posts"
              >
                <div draggable={false} style={{ height: '180px', background: '#1f2937', backgroundImage: `url(${post.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', pointerEvents: 'none' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {post.category || 'Portfolio'}
                  </span>
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: post.isPublished ? '#059669' : '#b91c1c', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>{post.title}</h3>
                      <label style={{ fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Order
                        <input
                          type="number"
                          min={1}
                          max={posts.length}
                          defaultValue={idx + 1}
                          key={`${post.id}-order-${idx}`}
                          draggable={false}
                          onDragStart={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onBlur={(e) => handlePostOrderInput(idx, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handlePostOrderInput(idx, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).blur(); } }}
                          style={{ width: '44px', padding: '2px 4px', background: '#111827', border: '1px solid #374151', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                        />
                      </label>
                    </div>
                    <p style={{ fontSize: '13px', color: '#9ca3af' }}>{post.images?.length || 0} photo(s) in post</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #1f2937' }}>
                    <button
                      type="button"
                      draggable={false}
                      onDragStart={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => openEditModal(post)}
                      style={{ flex: 1, padding: '8px', background: '#1f2937', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Edit Post
                    </button>
                    <button
                      type="button"
                      draggable={false}
                      onDragStart={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
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
                    Upload up to 10 photographs at a time, 10 MB each. Drag images to reorder or set the Order number, then click &quot;Save Order&quot; to persist changes.
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'inline-block', padding: '10px 20px', background: '#0077b6', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                      {uploading ? 'Uploading...' : '+ Upload Multiple Photographs'}
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
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
                      {formImages.map((img, idx) => {
                        const cid = img._cid || img.imageUrl || `img-${idx}`;
                        return (
                        <div
                          key={cid}
                          draggable={true}
                          onDragStart={(e) => handleImageDragStart(e, cid)}
                          onDragEnter={(e) => handleImageDragEnter(e, cid)}
                          onDragOver={handleImageDragOver}
                          onDrop={(e) => handleImageDrop(e, cid)}
                          onDragEnd={handleImageDragEnd}
                          style={{
                            background: '#1f2937',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: formCoverUrl === img.imageUrl ? '2px solid #0077b6' : dragId === cid ? '2px dashed #60a5fa' : '1px solid #374151',
                            position: 'relative',
                            opacity: dragId === cid ? 0.5 : 1,
                            cursor: 'grab',
                          }}
                          title="Drag image to reorder"
                        >
                          <div
                            draggable={false}
                            style={{ height: '100px', backgroundImage: `url(${img.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', pointerEvents: 'none' }}
                          />
                          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <label style={{ fontSize: '11px', color: '#d1d5db', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Order
                                <input
                                  type="number"
                                  min={1}
                                  max={formImages.length}
                                  defaultValue={idx + 1}
                                  key={`${cid}-order-${idx}`}
                                  draggable={false}
                                  onDragStart={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onBlur={(e) => handleOrderInput(idx, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleOrderInput(idx, (e.target as HTMLInputElement).value);
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  style={{ width: '46px', padding: '2px 4px', background: '#111827', border: '1px solid #374151', borderRadius: '4px', color: '#fff', fontSize: '11px' }}
                                />
                              </label>
                              <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#fff' }}>
                                <input
                                  type="radio"
                                  name="coverImageChoice"
                                  checked={formCoverUrl === img.imageUrl}
                                  draggable={false}
                                  onDragStart={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onChange={() => setFormCoverUrl(img.imageUrl)}
                                />
                                Cover
                              </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                draggable={false}
                                onDragStart={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => handleRemoveImage(idx)}
                                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );})}
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
