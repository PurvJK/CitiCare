import mongoose, { Schema } from 'mongoose';

const zoneSchema = new Schema(
	{ name: { type: String, required: true }, code: { type: String, required: true } },
	{ timestamps: true }
);

export const Zone = mongoose.model('Zone', zoneSchema);
