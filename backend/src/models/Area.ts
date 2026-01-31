import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArea extends Document {
  name: string;
  code: string;
  ward_id: mongoose.Types.ObjectId;
  created_at: Date;
}

const areaSchema = new Schema<IArea>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    ward_id: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
  },
  { timestamps: true }
);

export const Area: Model<IArea> = mongoose.model<IArea>('Area', areaSchema);
