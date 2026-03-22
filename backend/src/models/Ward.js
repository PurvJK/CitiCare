import mongoose, { Schema } from 'mongoose';

const wardSchema = new Schema(
	{
		name: { type: String, required: true },
		code: { type: String, required: true },
		zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
	},
	{ timestamps: true }
);

export const Ward = mongoose.model('Ward', wardSchema);
