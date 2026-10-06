import { Department } from '../models/Department.js';

export async function listDepartments(_req, res) {
  try {
    const list = await Department.find().sort({ name: 1 }).lean();
    res.json(
      list.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        code: d.code,
        description: d.description ?? null,
        category: d.category ?? null,
        in_charge_officer_id: d.in_charge_officer_id?.toString() ?? null,
        created_at: d.createdAt ?? d.created_at,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

export async function createDepartment(req, res) {
  try {
    const { name, code, description, category, in_charge_officer_id } = req.body;
    if (!name || !code) {
      res.status(400).json({ error: 'Name and code are required' });
      return;
    }
    const existing = await Department.findOne({ $or: [{ code }, { name }] });
    if (existing) {
      res.status(400).json({ error: 'Department with this code or name already exists' });
      return;
    }
    const doc = await Department.create({
      name,
      code,
      description: description ?? null,
      category: category ?? null,
      in_charge_officer_id: in_charge_officer_id || null,
    });
    res.status(201).json({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      description: doc.description ?? null,
      category: doc.category ?? null,
      in_charge_officer_id: doc.in_charge_officer_id?.toString() ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create department' });
  }
}

export async function updateDepartment(req, res) {
  try {
    const { name, code, description, category, in_charge_officer_id } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (code !== undefined) update.code = code;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (in_charge_officer_id !== undefined) update.in_charge_officer_id = in_charge_officer_id || null;
    const doc = await Department.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }
    res.json({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      description: doc.description ?? null,
      category: doc.category ?? null,
      in_charge_officer_id: doc.in_charge_officer_id?.toString() ?? null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update department' });
  }
}

export async function deleteDepartment(req, res) {
  try {
    const doc = await Department.findByIdAndDelete(req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete department' });
  }
}
