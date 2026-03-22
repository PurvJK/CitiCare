import mongoose, { Schema } from 'mongoose';

const documentSchema = new Schema(
	{
		title: { type: String, required: true },
		description: { type: String, default: null },
		category: { type: String, default: null },
		file_url: { type: String, required: true },
		file_type: { type: String, default: null },
		file_size: { type: Number, default: null },
		uploaded_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	},
	{ timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
