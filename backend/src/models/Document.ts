import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  description?: string;
  category?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: mongoose.Types.ObjectId | null;
  created_at: Date;
  updated_at: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: null },
    category: { type: String, default: null },
    file_url: { type: String, required: true },
    file_type: { type: String, default: null },
    file_size: { type: Number, default: null },
    uploaded_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const Document: Model<IDocument> = mongoose.model<IDocument>('Document', documentSchema);
