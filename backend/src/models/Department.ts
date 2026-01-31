import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  created_at: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, default: null },
  },
  { timestamps: true }
);

export const Department: Model<IDepartment> = mongoose.model<IDepartment>('Department', departmentSchema);
