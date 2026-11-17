import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { GalleryPostModel } from '@/models/GalleryPost';
import { galleryPosts as staticGalleryPosts } from '@/lib/data';

export const revalidate = 60;

function isAdmin(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const adminCookie = req.cookies.get('syed_admin_session')?.value;
  const authHeader = req.headers.get('authorization');
  return (
    adminCookie === adminPassword ||
    adminCookie === 'authenticated' ||
    authHeader === `Bearer ${adminPassword}`
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get('admin') === 'true';
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 60, 1), 200);

    if (includeUnpublished && !isAdmin(req)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectDB();
    if (!conn) {
      const posts = includeUnpublished ? [] : staticGalleryPosts.slice(0, limit);
      const res = NextResponse.json({ success: true, posts, source: 'static' });
      res.headers.set('Cache-Control', includeUnpublished ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300');
      return res;
    }

    const query = includeUnpublished ? {} : { isPublished: true };
    const rawPosts = await GalleryPostModel.find(query).limit(200).lean();

    const hasValidOrder = (value: unknown): value is number =>
      typeof value === 'number' && Number.isFinite(value) && value > 0;

    const sortedPosts = [...rawPosts].sort((a: any, b: any) => {
      const aOrder = hasValidOrder(a.sortOrder) ? a.sortOrder : Number.MAX_SAFE_INTEGER;
      const bOrder = hasValidOrder(b.sortOrder) ? b.sortOrder : Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aCreated !== bCreated) return aCreated - bCreated;
      return String(a.id ?? a._id ?? '').localeCompare(String(b.id ?? b._id ?? ''));
    });

    const validOrders = sortedPosts.map((p: any) => p.sortOrder).filter(hasValidOrder);
    const needsReindex =
      validOrders.length !== sortedPosts.length || new Set(validOrders).size !== validOrders.length;

    const posts = sortedPosts.slice(0, limit).map((p: any, idx: number) => ({ ...p, sortOrder: idx + 1 }));
    if (needsReindex) {
      console.log('[gallery] GET reindexed missing/duplicate sortOrder', {
        total: sortedPosts.length,
        validOrders: validOrders.length,
        uniqueOrders: new Set(validOrders).size,
      });
    }

    const result = posts.length || includeUnpublished ? posts : staticGalleryPosts.slice(0, limit);
    const res = NextResponse.json({ success: true, posts: result });
    res.headers.set(
      'Cache-Control',
      includeUnpublished ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300'
    );
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to fetch gallery posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const body = await req.json();
    const { title, category, coverImage, images, isPublished } = body;

    if (!title || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ success: false, error: 'Title and at least one image are required' }, { status: 400 });
    }

    const id = body.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const formattedImages = (images as any[])
      .map((img: any, idx: number) => {
        if (typeof img === 'string') {
          return { imageUrl: img, altText: title, hidden: false, sortOrder: idx + 1, _idx: idx };
        }
        const so = typeof img.sortOrder === 'number' && Number.isFinite(img.sortOrder) ? img.sortOrder : idx + 1;
        return {
          imageUrl: img.imageUrl,
          altText: img.altText || title,
          hidden: Boolean(img.hidden),
          sortOrder: so,
          _idx: idx,
        };
      })
      .sort((a, b) => (a.sortOrder - b.sortOrder) || (a._idx - b._idx))
      .map((img, idx) => ({
        imageUrl: img.imageUrl,
        altText: img.altText,
        hidden: img.hidden,
        sortOrder: idx + 1,
      }));

    const resolvedCover =
      coverImage && formattedImages.some((i) => i.imageUrl === coverImage)
        ? coverImage
        : formattedImages[0]?.imageUrl;

    let postSortOrder = typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? body.sortOrder : 0;
    if (!postSortOrder || postSortOrder < 1) {
      const last = await GalleryPostModel.findOne({}).sort({ sortOrder: -1 }).select('sortOrder').lean();
      postSortOrder = (last && typeof (last as any).sortOrder === 'number' ? (last as any).sortOrder : 0) + 1;
    }

    const newPost = await GalleryPostModel.create({
      id,
      title,
      category: category || 'Portfolio',
      coverImage: resolvedCover,
      images: formattedImages,
      isPublished: isPublished ?? true,
      sortOrder: postSortOrder,
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to create gallery post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const body = await req.json();
    const orders = Array.isArray(body?.postsOrder) ? body.postsOrder : null;
    if (!orders) {
      return NextResponse.json({ success: false, error: 'postsOrder array is required' }, { status: 400 });
    }

    const ops = orders
      .map((o: any, idx: number) => {
        if (!o || typeof o.id !== 'string') return null;
        const sortOrder = typeof o.sortOrder === 'number' && Number.isFinite(o.sortOrder) ? o.sortOrder : idx + 1;
        return {
          updateOne: {
            filter: { id: o.id },
            update: { $set: { sortOrder } },
          },
        };
      })
      .filter(Boolean) as any[];

    if (ops.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid post orders provided' }, { status: 400 });
    }

    const writeResult = await GalleryPostModel.bulkWrite(ops, { ordered: false });
    console.log('[gallery] PUT postsOrder bulkWrite', {
      requested: ops.length,
      matchedCount: writeResult.matchedCount,
      modifiedCount: writeResult.modifiedCount,
    });
    return NextResponse.json({
      success: true,
      updated: ops.length,
      matched: writeResult.matchedCount,
      modified: writeResult.modifiedCount,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to save posts order' }, { status: 500 });
  }
}
