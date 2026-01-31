import mongoose, { Schema, Document, Model } from 'mongoose';

export type ComplaintStatus = 'pending' | 'in_progress' | 'on_hold' | 'resolved' | 'rejected' | 'closed';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type CostStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface IComplaint extends Document {
  complaint_number: string;
  user_id: mongoose.Types.ObjectId | null;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: PriorityLevel;
  department_id: mongoose.Types.ObjectId | null;
  assigned_to: mongoose.Types.ObjectId | null;
  zone_id: mongoose.Types.ObjectId | null;
  ward_id: mongoose.Types.ObjectId | null;
  area_id: mongoose.Types.ObjectId | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  resolved_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // Department workflow: accept/reject
  accepted_by_department: boolean | null;
  accepted_at: Date | null;
  // Cost estimation (department submits for municipal head approval)
  cost_estimated_amount: number | null;
  cost_materials: string | null;
  cost_labor: string | null;
  cost_status: CostStatus;
  cost_submitted_at: Date | null;
  cost_approved_by: mongoose.Types.ObjectId | null;
  // Work completion
  completion_remarks: string | null;
  completed_at: Date | null;
}

const complaintSchema = new Schema<IComplaint>(
  {
    complaint_number: { type: String, required: true, unique: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'on_hold', 'resolved', 'rejected', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    department_id: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
    assigned_to: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', default: null },
    ward_id: { type: Schema.Types.ObjectId, ref: 'Ward', default: null },
    area_id: { type: Schema.Types.ObjectId, ref: 'Area', default: null },
    address: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    resolved_at: { type: Date, default: null },
    accepted_by_department: { type: Boolean, default: null },
    accepted_at: { type: Date, default: null },
    cost_estimated_amount: { type: Number, default: null },
    cost_materials: { type: String, default: null },
    cost_labor: { type: String, default: null },
    cost_status: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
    cost_submitted_at: { type: Date, default: null },
    cost_approved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    completion_remarks: { type: String, default: null },
    completed_at: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Complaint: Model<IComplaint> = mongoose.model<IComplaint>('Complaint', complaintSchema);
