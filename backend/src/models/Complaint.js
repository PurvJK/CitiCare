import mongoose, { Schema } from 'mongoose';

const complaintSchema = new Schema(
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
		feedback_rating: { type: Number, min: 1, max: 5, default: null },
		feedback_comment: { type: String, default: null },
		feedback_submitted_at: { type: Date, default: null },
		upvotes: { type: Number, default: 0 },
		upvoted_by: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
	},
	{ timestamps: true }
);

export const Complaint = mongoose.model('Complaint', complaintSchema);
