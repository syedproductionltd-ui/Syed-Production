import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { GalleryPostModel } from '@/models/GalleryPost';

function isAdmin(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('syed_admin_session');
  const authHeader = req.headers.get('authorization');
  return adminCookie?.value === 'authenticated' || authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { title, category, coverImage, images, isPublished } = body;

    const post = await GalleryPostModel.findOne({ id });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Gallery post not found' }, { status: 404 });
    }

    if (title) post.title = title;
    if (category) post.category = category;
    if (isPublished !== undefined) post.isPublished = isPublished;

    if (images && Array.isArray(images) && images.length > 0) {
      post.images = images.map((img: any) => {
        if (typeof img === 'string') {
          return { imageUrl: img, altText: post.title, hidden: false };
        }
        return {
          imageUrl: img.imageUrl,
          altText: img.altText || post.title,
          hidden: Boolean(img.hidden),
        };
      });
    }

    if (coverImage) {
      post.coverImage = coverImage;
    } else if (post.images.length > 0) {
      const firstImg = post.images[0] as any;
      post.coverImage = firstImg.imageUrl || firstImg;
    }

    await post.save();

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error updating gallery post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    const deleted = await GalleryPostModel.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Gallery post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting gallery post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
