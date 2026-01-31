import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWard extends Document {
  name: string;
  code: string;
  zone_id: mongoose.Types.ObjectId;
  created_at: Date;
}

const wardSchema = new Schema<IWard>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
  },
  { timestamps: true }
);

export const Ward: Model<IWard> = mongoose.model<IWard>('Ward', wardSchema);
