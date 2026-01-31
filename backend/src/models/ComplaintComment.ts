import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplaintComment extends Document {
  complaint_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  content: string;
  is_internal: boolean;
  created_at: Date;
}

const complaintCommentSchema = new Schema<IComplaintComment>(
  {
    complaint_id: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    content: { type: String, required: true },
    is_internal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ComplaintComment: Model<IComplaintComment> = mongoose.model<IComplaintComment>('ComplaintComment', complaintCommentSchema);
