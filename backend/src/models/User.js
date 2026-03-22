import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true, select: false },
		full_name: { type: String, required: true },
		phone: { type: String, default: null },
		address_line: { type: String, default: null },
		avatar_url: { type: String, default: null },
		department_id: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
		zone_id: { type: Schema.Types.ObjectId, ref: 'Zone', default: null },
		ward_id: { type: Schema.Types.ObjectId, ref: 'Ward', default: null },
		role: { type: String, enum: ['admin', 'department_head', 'officer', 'citizen'], default: 'citizen' },
		notification_email: { type: Boolean, default: false },
		notification_push: { type: Boolean, default: false },
		notification_status_updates: { type: Boolean, default: false },
		notification_comments: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.comparePassword = function (candidate) {
	return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
