import { Router, Response } from 'express';
import { Project } from '../models/Project.js';
import { Department } from '../models/Department.js';
import { Ward } from '../models/Ward.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await Project.find().sort({ created_at: -1 }).lean();
    const deptIds = [...new Set(projects.map((p: any) => p.department_id).filter(Boolean))];
    const wardIds = [...new Set(projects.map((p: any) => p.ward_id).filter(Boolean))];
    const [departments, wards] = await Promise.all([
      Department.find({ _id: { $in: deptIds } }).select('_id name').lean(),
      Ward.find({ _id: { $in: wardIds } }).select('_id name').lean(),
    ]);
    const deptMap = new Map(departments.map((d: any) => [d._id.toString(), d.name]));
    const wardMap = new Map(wards.map((w: any) => [w._id.toString(), w.name]));
    res.json(
      projects.map((p: any) => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        department_id: p.department_id?.toString() ?? null,
        department_name: p.department_id ? deptMap.get(p.department_id.toString()) ?? null : null,
        ward_id: p.ward_id?.toString() ?? null,
        ward_name: p.ward_id ? wardMap.get(p.ward_id.toString()) ?? null : null,
        budget: p.budget,
        progress: p.progress,
        start_date: p.start_date,
        end_date: p.end_date,
        status: p.status,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

export default router;
