import mongoose, { Schema } from 'mongoose';

const projectSchema = new Schema(
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

export const Project = mongoose.model('Project', projectSchema);
