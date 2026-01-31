/**
 * Seed script: run with `npx tsx src/seed.ts` from backend folder.
 * Creates an admin user and sample zones/wards/areas/departments.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Zone } from './models/Zone.js';
import { Ward } from './models/Ward.js';
import { Area } from './models/Area.js';
import { Department } from './models/Department.js';
import { SystemSetting } from './models/SystemSetting.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/citicare';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Default admin (change password after first login)
  const existingAdmin = await User.findOne({ email: 'admin@citicare.local' });
  if (!existingAdmin) {
    await User.create({
      email: 'admin@citicare.local',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'admin',
    });
    console.log('Created admin user: admin@citicare.local / admin123');
  } else {
    console.log('Admin user already exists');
  }

  // System settings
  await SystemSetting.findOneAndUpdate(
    { key: 'auto_assign_complaints' },
    { value: 'true' },
    { upsert: true }
  );
  await SystemSetting.findOneAndUpdate(
    { key: 'email_confirmations' },
    { value: 'false' },
    { upsert: true }
  );
  await SystemSetting.findOneAndUpdate(
    { key: 'maintenance_mode' },
    { value: 'false' },
    { upsert: true }
  );
  console.log('System settings seeded');

  // Surat Municipal Corporation – Zones (7 zones)
  const zoneData = [
    { name: 'Central Zone', code: 'CZ' },
    { name: 'South Zone', code: 'SZ' },
    { name: 'West Zone', code: 'WZ' },
    { name: 'East Zone', code: 'EZ' },
    { name: 'North Zone', code: 'NZ' },
    { name: 'South-West Zone', code: 'SWZ' },
    { name: 'South-East Zone', code: 'SEZ' },
  ];
  const zoneIds: Record<string, mongoose.Types.ObjectId> = {};
  for (let i = 0; i < zoneData.length; i++) {
    const z = await Zone.findOneAndUpdate(
      { code: zoneData[i].code },
      { name: zoneData[i].name, code: zoneData[i].code },
      { upsert: true, new: true }
    );
    zoneIds[zoneData[i].code] = z._id;
  }
  console.log('Zones seeded:', zoneData.length);

  // Wards by zone code (zoneCode -> wards)
  const wardData: { name: string; code: string; zoneCode: string }[] = [
    { name: 'Nanpura', code: 'W01', zoneCode: 'CZ' },
    { name: 'Gopipura', code: 'W02', zoneCode: 'CZ' },
    { name: 'Mahidharpura', code: 'W03', zoneCode: 'CZ' },
    { name: 'Rander', code: 'W04', zoneCode: 'CZ' },
    { name: 'Athwa', code: 'W05', zoneCode: 'SZ' },
    { name: 'Udhna', code: 'W06', zoneCode: 'SZ' },
    { name: 'Limbayat', code: 'W07', zoneCode: 'SZ' },
    { name: 'Adajan', code: 'W08', zoneCode: 'WZ' },
    { name: 'Piplod', code: 'W09', zoneCode: 'WZ' },
    { name: 'Pal', code: 'W10', zoneCode: 'WZ' },
    { name: 'Katargam', code: 'W11', zoneCode: 'EZ' },
    { name: 'Varachha', code: 'W12', zoneCode: 'EZ' },
    { name: 'Kapodra', code: 'W13', zoneCode: 'EZ' },
    { name: 'Pandesara', code: 'W14', zoneCode: 'NZ' },
    { name: 'Sachin', code: 'W15', zoneCode: 'NZ' },
    { name: 'Vesu', code: 'W16', zoneCode: 'SWZ' },
    { name: 'Althan', code: 'W17', zoneCode: 'SWZ' },
    { name: 'Bhatar', code: 'W18', zoneCode: 'SWZ' },
    { name: 'Dindoli', code: 'W19', zoneCode: 'SEZ' },
    { name: 'Bhestan', code: 'W20', zoneCode: 'SEZ' },
  ];
  const wardIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const w of wardData) {
    const zoneId = zoneIds[w.zoneCode];
    if (!zoneId) continue;
    const doc = await Ward.findOneAndUpdate(
      { code: w.code },
      { name: w.name, code: w.code, zone_id: zoneId },
      { upsert: true, new: true }
    );
    wardIds[w.code] = doc._id;
  }
  console.log('Wards seeded:', wardData.length);

  // Areas by ward code (wardCode -> areas)
  const areaData: { name: string; code: string; wardCode: string }[] = [
    { name: 'Nanpura Main Road', code: 'A01', wardCode: 'W01' },
    { name: 'Ring Road', code: 'A02', wardCode: 'W01' },
    { name: 'Chowk Bazaar', code: 'A03', wardCode: 'W01' },
    { name: 'Gopipura Gate', code: 'A04', wardCode: 'W02' },
    { name: 'Salabatpura', code: 'A05', wardCode: 'W02' },
    { name: 'Athwa Gate', code: 'A06', wardCode: 'W05' },
    { name: 'City Light', code: 'A07', wardCode: 'W05' },
    { name: 'Ghod Dod Road', code: 'A08', wardCode: 'W05' },
    { name: 'Udhna Darwaja', code: 'A09', wardCode: 'W06' },
    { name: 'Udhna GIDC', code: 'A10', wardCode: 'W06' },
    { name: 'Bamroli Road', code: 'A11', wardCode: 'W06' },
    { name: 'Adajan Patiya', code: 'A12', wardCode: 'W08' },
    { name: 'Hazira Road', code: 'A13', wardCode: 'W08' },
    { name: 'Adajan Gam', code: 'A14', wardCode: 'W08' },
    { name: 'Piplod Crossroad', code: 'A15', wardCode: 'W09' },
    { name: 'VIP Road', code: 'A16', wardCode: 'W09' },
    { name: 'Vesu Canal Road', code: 'A17', wardCode: 'W16' },
    { name: 'Surat-Dumas Road', code: 'A18', wardCode: 'W16' },
    { name: 'Vesu Circle', code: 'A19', wardCode: 'W16' },
    { name: 'Katargam Darwaja', code: 'A20', wardCode: 'W11' },
    { name: 'Amroli', code: 'A21', wardCode: 'W11' },
    { name: 'Varachha Main Road', code: 'A22', wardCode: 'W12' },
    { name: 'Nana Varachha', code: 'A23', wardCode: 'W12' },
    { name: 'Kapodara Cross Road', code: 'A24', wardCode: 'W12' },
    { name: 'Rander Road', code: 'A25', wardCode: 'W04' },
    { name: 'Jahangirpura', code: 'A26', wardCode: 'W04' },
    { name: 'Pal Gam', code: 'A27', wardCode: 'W10' },
    { name: 'Canal Road', code: 'A28', wardCode: 'W10' },
    { name: 'Pandesara GIDC', code: 'A29', wardCode: 'W14' },
    { name: 'Ved Road', code: 'A30', wardCode: 'W14' },
  ];
  for (const a of areaData) {
    const wardId = wardIds[a.wardCode];
    if (!wardId) continue;
    await Area.findOneAndUpdate(
      { code: a.code },
      { name: a.name, code: a.code, ward_id: wardId },
      { upsert: true }
    );
  }
  console.log('Areas seeded:', areaData.length);

  // Departments
  await Department.findOneAndUpdate(
    { code: 'PWD' },
    { name: 'Public Works', code: 'PWD', description: 'Roads, water, sewage' },
    { upsert: true }
  );
  await Department.findOneAndUpdate(
    { code: 'ENG' },
    { name: 'Engineering', code: 'ENG', description: 'Infrastructure' },
    { upsert: true }
  );
  await Department.findOneAndUpdate(
    { code: 'ENV' },
    { name: 'Environment', code: 'ENV', description: 'Garbage, parks' },
    { upsert: true }
  );
  console.log('Departments seeded');

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
