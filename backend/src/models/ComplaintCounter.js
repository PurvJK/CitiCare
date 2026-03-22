import mongoose, { Schema } from 'mongoose';

const complaintCounterSchema = new Schema({ seq: { type: Number, default: 0 } });

export const ComplaintCounter = mongoose.model('ComplaintCounter', complaintCounterSchema);

export async function getNextComplaintNumber() {
	const counter = await ComplaintCounter.findOneAndUpdate({}, { $inc: { seq: 1 } }, { new: true, upsert: true });
	const year = new Date().getFullYear();
	const num = String(counter.seq).padStart(5, '0');
	return `CMP-${year}-${num}`;
}
