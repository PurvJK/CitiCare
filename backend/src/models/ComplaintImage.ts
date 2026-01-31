import mongoose, { Schema, Document, Model } from 'mongoose';

export type ComplaintImageType = 'before' | 'after' | 'general';

export interface IComplaintImage extends Document {
  complaint_id: mongoose.Types.ObjectId;
  url: string;
  caption?: string;
  type: ComplaintImageType;
  created_at: Date;
}

const complaintImageSchema = new Schema<IComplaintImage>(
  {
    complaint_id: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
    url: { type: String, required: true },
    caption: { type: String, default: null },
    type: { type: String, enum: ['before', 'after', 'general'], default: 'general' },
  },
  { timestamps: true }
);

export const ComplaintImage: Model<IComplaintImage> = mongoose.model<IComplaintImage>('ComplaintImage', complaintImageSchema);
