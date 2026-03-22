import mongoose, { Schema } from 'mongoose';

const complaintCommentSchema = new Schema(
	{
		complaint_id: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
		user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
		content: { type: String, required: true },
		is_internal: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export const ComplaintComment = mongoose.model('ComplaintComment', complaintCommentSchema);
