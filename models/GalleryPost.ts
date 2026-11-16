import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryImageItem {
  imageUrl: string;
  altText?: string;
  hidden?: boolean;
}

export interface IGalleryPostDocument extends Document {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  images: string[] | IGalleryImageItem[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageItemSchema = new Schema({
  imageUrl: { type: String, required: true },
  altText: { type: String, default: 'Syed Production shoot' },
  hidden: { type: Boolean, default: false },
});

const GalleryPostSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Portfolio' },
    coverImage: { type: String, required: true },
    images: { type: [GalleryImageItemSchema], required: true },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

GalleryPostSchema.index({ isPublished: 1, createdAt: -1 });

export const GalleryPostModel: Model<IGalleryPostDocument> =
  mongoose.models.GalleryPost || mongoose.model<IGalleryPostDocument>('GalleryPost', GalleryPostSchema);
