import mongoose, { Schema } from 'mongoose';

const systemSettingSchema = new Schema(
	{ key: { type: String, required: true, unique: true }, value: { type: String, default: null } },
	{ timestamps: true }
);

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
