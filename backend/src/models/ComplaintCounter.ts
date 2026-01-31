import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplaintCounter extends Document {
  seq: number;
}

const complaintCounterSchema = new Schema<IComplaintCounter>({ seq: { type: Number, default: 0 } });

export const ComplaintCounter: Model<IComplaintCounter> = mongoose.model<IComplaintCounter>('ComplaintCounter', complaintCounterSchema);

export async function getNextComplaintNumber(): Promise<string> {
  const counter = await ComplaintCounter.findOneAndUpdate({}, { $inc: { seq: 1 } }, { new: true, upsert: true });
  const year = new Date().getFullYear();
  const num = String(counter.seq).padStart(5, '0');
  return `CMP-${year}-${num}`;
}
