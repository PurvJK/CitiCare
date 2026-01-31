import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type AppRole = 'admin' | 'department_head' | 'officer' | 'citizen';

export interface IUser extends Document {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  department_id?: mongoose.Types.ObjectId;
  role: AppRole;
  notification_email?: boolean;
  notification_push?: boolean;
  notification_status_updates?: boolean;
  notification_comments?: boolean;
  created_at: Date;
  updated_at: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    full_name: { type: String, required: true },
    phone: { type: String, default: null },
    avatar_url: { type: String, default: null },
    department_id: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
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

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
