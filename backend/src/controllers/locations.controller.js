import mongoose from 'mongoose';
import { Zone } from '../models/Zone.js';
import { Ward } from '../models/Ward.js';
import { Area } from '../models/Area.js';
import { Department } from '../models/Department.js';

export async function listZones(_req, res) {
  try {
    const list = await Zone.find().sort({ name: 1 }).lean();
    res.json(list.map((z) => ({ id: z._id.toString(), name: z.name, code: z.code })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
}

export async function listWards(req, res) {
  try {
    const zoneId = typeof req.query.zoneId === 'string' ? req.query.zoneId : undefined;
    const filter = zoneId && mongoose.Types.ObjectId.isValid(zoneId) ? { zone_id: new mongoose.Types.ObjectId(zoneId) } : {};
    const list = await Ward.find(filter).sort({ name: 1 }).lean();
    res.json(list.map((w) => ({ id: w._id.toString(), name: w.name, code: w.code, zone_id: w.zone_id.toString() })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
}

export async function listAreas(req, res) {
  try {
    const wardId = typeof req.query.wardId === 'string' ? req.query.wardId : undefined;
    const filter = wardId && mongoose.Types.ObjectId.isValid(wardId) ? { ward_id: new mongoose.Types.ObjectId(wardId) } : {};
    const list = await Area.find(filter).sort({ name: 1 }).lean();
    res.json(list.map((a) => ({ id: a._id.toString(), name: a.name, code: a.code, ward_id: a.ward_id.toString() })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch areas' });
  }
}

export async function listDepartments(_req, res) {
  try {
    const list = await Department.find().sort({ name: 1 }).lean();
    res.json(list.map((d) => ({ id: d._id.toString(), name: d.name, code: d.code, description: d.description, category: d.category })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}
