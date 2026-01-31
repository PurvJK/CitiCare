import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description?: string;
  department_id: mongoose.Types.ObjectId | null;
  ward_id: mongoose.Types.ObjectId | null;
  created_by: mongoose.Types.ObjectId | null;
  budget: number | null;
  progress: number | null;
  start_date: Date | null;
  end_date: Date | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, default: null },
    department_id: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    ward_id: { type: Schema.Types.ObjectId, ref: 'Ward', default: null },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    budget: { type: Number, default: null },
    progress: { type: Number, default: null },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    status: { type: String, default: 'planned' },
  },
  { timestamps: true }
);

export const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);
