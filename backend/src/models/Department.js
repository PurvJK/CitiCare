import mongoose, { Schema } from 'mongoose';

const departmentSchema = new Schema(
	{
		name: { type: String, required: true },
		code: { type: String, required: true },
		description: { type: String, default: null },
		category: { type: String, default: null },
		in_charge_officer_id: { type: Schema.Types.ObjectId, default: null, ref: 'User' },
	},
	{ timestamps: true }
);

export const Department = mongoose.model('Department', departmentSchema);
