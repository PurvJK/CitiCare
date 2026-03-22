import mongoose, { Schema } from 'mongoose';

const announcementSchema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, required: true, trim: true },
		announcedBy: { type: String, required: true, trim: true },
		role: { type: String, enum: ['admin', 'department'], required: true },
		departmentType: {
			type: String,
			default: null,
			trim: true,
			validate: {
				validator(value) {
					if (this.role === 'department') return Boolean(value && value.trim());
					return true;
				},
				message: 'departmentType is required for department announcements',
			},
		},
		area: { type: String, default: 'City-wide', trim: true },
		priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
	},
	{ timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
