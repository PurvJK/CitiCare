import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IZone extends Document {
  name: string;
  code: string;
  created_at: Date;
}

const zoneSchema = new Schema<IZone>(
  { name: { type: String, required: true }, code: { type: String, required: true } },
  { timestamps: true }
);

export const Zone: Model<IZone> = mongoose.model<IZone>('Zone', zoneSchema);
