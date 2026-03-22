import mongoose, { Schema } from 'mongoose';

const areaSchema = new Schema(
	{
		name: { type: String, required: true },
		code: { type: String, required: true },
		ward_id: { type: Schema.Types.ObjectId, ref: 'Ward', required: true },
	},
	{ timestamps: true }
);

export const Area = mongoose.model('Area', areaSchema);
