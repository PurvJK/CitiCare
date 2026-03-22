import mongoose, { Schema } from 'mongoose';

const complaintImageSchema = new Schema(
	{
		complaint_id: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
		url: { type: String, required: true },
		caption: { type: String, default: null },
		type: { type: String, enum: ['before', 'after', 'general'], default: 'general' },
	},
	{ timestamps: true }
);

export const ComplaintImage = mongoose.model('ComplaintImage', complaintImageSchema);
