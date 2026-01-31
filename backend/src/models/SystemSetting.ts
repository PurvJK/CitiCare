import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  value: string | null;
  created_at: Date;
  updated_at: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  { key: { type: String, required: true, unique: true }, value: { type: String, default: null } },
  { timestamps: true }
);

export const SystemSetting: Model<ISystemSetting> = mongoose.model<ISystemSetting>('SystemSetting', systemSettingSchema);
