import { Router, Response } from 'express';
import { Complaint } from '../models/Complaint.js';
import { ComplaintImage } from '../models/ComplaintImage.js';
import { ComplaintComment } from '../models/ComplaintComment.js';
import { getNextComplaintNumber } from '../models/ComplaintCounter.js';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import mongoose from 'mongoose';

const router = Router();
const baseUrl = process.env.API_BASE_URL || '';

function toId(obj: { _id: mongoose.Types.ObjectId } | null) {
  return obj?._id?.toString() ?? null;
}

function complaintToJson(c: any, extra?: Record<string, unknown>) {
  const createdAt = c?.createdAt ?? c?.created_at;
  const updatedAt = c?.updatedAt ?? c?.updated_at;
  return {
    id: c?._id?.toString?.() ?? '',
    complaint_number: c?.complaint_number ?? '',
    user_id: toId(c?.user_id),
    title: c?.title ?? '',
    description: c?.description ?? '',
    category: c?.category ?? '',
    status: c?.status ?? 'pending',
    priority: c?.priority ?? 'medium',
    department_id: toId(c?.department_id),
    assigned_to: toId(c?.assigned_to),
    zone_id: toId(c?.zone_id),
    ward_id: toId(c?.ward_id),
    area_id: toId(c?.area_id),
    address: c?.address ?? null,
    latitude: c?.latitude ?? null,
    longitude: c?.longitude ?? null,
    resolved_at: c?.resolved_at ?? null,
    created_at: createdAt,
    updated_at: updatedAt,
    departments: c?.departments ? { name: c.departments.name } : null,
    zones: c?.zones ? { name: c.zones.name } : null,
    wards: c?.wards ? { name: c.wards.name } : null,
    areas: c?.areas ? { name: c.areas.name } : null,
    profiles: c?.profiles ? { full_name: c.profiles.full_name } : null,
    complaint_images: Array.isArray(c?.complaint_images)
      ? c.complaint_images.map((img: any) => ({
          id: img?._id?.toString?.() ?? '',
          url: img?.url ?? '',
          caption: img?.caption ?? null,
          type: img?.type ?? 'general',
        }))
      : [],
    accepted_by_department: c?.accepted_by_department ?? null,
    accepted_at: c?.accepted_at ?? null,
    cost_estimated_amount: c?.cost_estimated_amount ?? null,
    cost_materials: c?.cost_materials ?? null,
    cost_labor: c?.cost_labor ?? null,
    cost_status: c?.cost_status ?? 'pending',
    cost_submitted_at: c?.cost_submitted_at ?? null,
    cost_approved_by: toId(c?.cost_approved_by),
    completion_remarks: c?.completion_remarks ?? null,
    completed_at: c?.completed_at ?? null,
    ...extra,
  };
}

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    let filter: Record<string, unknown> = {};
    if (req.user.role === 'citizen') {
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400).json({ error: 'Invalid user' });
        return;
      }
      filter = { user_id: new mongoose.Types.ObjectId(req.user.id) };
    } else if ((req.user.role === 'officer' || req.user.role === 'department_head') && req.user.department_id) {
      filter = { department_id: new mongoose.Types.ObjectId(req.user.department_id) };
    }
    const sortBy = (req.query.sort as string) || 'date';
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === 'priority') sortOption = { priority: 1, createdAt: -1 };
    if (sortBy === 'area') sortOption = { ward_id: 1, area_id: 1, createdAt: -1 };
    const list = await Complaint.find(filter)
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .sort(sortOption)
      .lean();

    const withImages = await Promise.all(
      list.map(async (c: any) => {
        const images = await ComplaintImage.find({ complaint_id: c._id }).lean();
        const urls = images.map((i: any) => ({
          id: (i as any)._id?.toString?.() ?? '',
          url: (i as any).url ?? '',
          caption: (i as any).caption ?? null,
          type: (i as any).type ?? 'general',
        }));
        return complaintToJson({
          ...c,
          complaint_images: urls,
          departments: c.department_id,
          zones: c.zone_id,
          wards: c.ward_id,
          areas: c.area_id,
          profiles: c.user_id,
        });
      })
    );
    res.json(withImages);
  } catch (e: any) {
    console.error('[GET /complaints]', e?.message ?? e);
    res.status(500).json({ error: 'Failed to fetch complaints', detail: process.env.NODE_ENV === 'development' ? e?.message : undefined });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let filter: Record<string, unknown> = {};
    if (req.user!.role === 'citizen') filter = { user_id: new mongoose.Types.ObjectId(req.user!.id) };
    else if ((req.user!.role === 'officer' || req.user!.role === 'department_head') && req.user!.department_id)
      filter = { department_id: new mongoose.Types.ObjectId(req.user!.department_id) };
    const complaints = await Complaint.find(filter).select('status').lean();
    const stats = { total: complaints.length, pending: 0, in_progress: 0, on_hold: 0, resolved: 0, rejected: 0, closed: 0 };
    complaints.forEach((c: any) => {
      if (c.status && (stats as any)[c.status] !== undefined) (stats as any)[c.status]++;
    });
    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/monthly', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let filter: Record<string, unknown> = { createdAt: { $gte: sixMonthsAgo } };
    if (req.user!.role === 'citizen') filter.user_id = new mongoose.Types.ObjectId(req.user!.id);
    const complaints = await Complaint.find(filter).select('createdAt created_at').lean();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyData: { month: string; complaints: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData.push({ month: months[monthIndex], complaints: 0 });
    }
    complaints.forEach((c: any) => {
      const d = new Date(c.createdAt ?? c.created_at);
      const name = months[d.getMonth()];
      const entry = monthlyData.find((m) => m.month === name);
      if (entry) entry.complaints++;
    });
    res.json(monthlyData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

// Meta and nested routes must come before /:id
router.get('/meta/departments', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { Department } = await import('../models/Department.js');
    const list = await Department.find().select('_id name code').sort({ name: 1 }).lean();
    res.json(list.map((d: any) => ({ id: d._id.toString(), name: d.name, code: d.code })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.get('/meta/officers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { User } = await import('../models/User.js');
    const deptId = req.query.departmentId as string | undefined;
    const filter: Record<string, unknown> = { role: 'officer' };
    if (deptId) filter.department_id = new mongoose.Types.ObjectId(deptId);
    const officers = await User.find(filter).select('_id full_name email department_id').sort({ full_name: 1 }).lean();
    res.json(
      officers.map((o: any) => ({
        id: o._id.toString(),
        full_name: o.full_name,
        email: o.email,
        department_id: o.department_id?.toString() ?? null,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

router.get('/:id/comments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const comments = await ComplaintComment.find({ complaint_id: req.params.id })
      .populate('user_id', 'full_name')
      .sort({ createdAt: 1 })
      .lean();
    res.json(
      comments.map((c: any) => ({
        id: c._id.toString(),
        complaint_id: c.complaint_id.toString(),
        user_id: toId(c.user_id),
        content: c.content,
        is_internal: c.is_internal,
        created_at: c.createdAt ?? c.created_at,
        profiles: c.user_id ? { full_name: c.user_id.full_name } : null,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const c = await Complaint.findById(id)
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .lean();
    if (!c) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    if (req.user!.role === 'citizen' && toId((c as any).user_id) !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const images = await ComplaintImage.find({ complaint_id: id }).lean();
    const urls = images.map((i: any) => ({ id: i._id.toString(), url: i.url, caption: i.caption, type: i.type ?? 'general' }));
    res.json(complaintToJson({ ...c, complaint_images: urls, departments: (c as any).department_id, zones: (c as any).zone_id, wards: (c as any).ward_id, areas: (c as any).area_id, profiles: (c as any).user_id }));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

router.post('/', upload.array('images', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, address, zone_id, ward_id, area_id, department_id } = req.body;
    if (!title || !description || !category) {
      res.status(400).json({ error: 'Title, description and category are required' });
      return;
    }
    const complaint_number = await getNextComplaintNumber();
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const imageUrls = (files || []).map((f) => `${baseUrl}/uploads/${f.filename}`);
    const toObjectId = (v: string | undefined) => (v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null);
    const complaint = await Complaint.create({
      complaint_number,
      user_id: new mongoose.Types.ObjectId(req.user!.id),
      title,
      description,
      category,
      address: address || null,
      zone_id: toObjectId(zone_id),
      ward_id: toObjectId(ward_id),
      area_id: toObjectId(area_id),
      department_id: toObjectId(department_id),
      status: 'pending',
      priority: 'medium',
    });
    if (imageUrls.length > 0) {
      await ComplaintImage.insertMany(imageUrls.map((url) => ({ complaint_id: complaint._id, url, type: 'general' })));
    }
    const populated = await Complaint.findById(complaint._id)
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name')
      .lean();
    const images = await ComplaintImage.find({ complaint_id: complaint._id }).lean();
    res.status(201).json(
      complaintToJson(
        {
          ...populated,
          complaint_images: images.map((i: any) => ({ id: i._id.toString(), url: i.url, caption: i.caption })),
          departments: (populated as any)?.department_id,
          zones: (populated as any)?.zone_id,
          wards: (populated as any)?.ward_id,
          areas: (populated as any)?.area_id,
          profiles: (populated as any)?.user_id,
        } as any
      )
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      department_id,
      assigned_to,
      priority,
      accepted_by_department,
      cost_estimated_amount,
      cost_materials,
      cost_labor,
      cost_status,
      completion_remarks,
    } = req.body;
    const toObjectId = (v: string | null | undefined) => (v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null);
    const update: Record<string, unknown> = {};
    if (status !== undefined) update.status = status;
    if (department_id !== undefined) update.department_id = toObjectId(department_id);
    if (assigned_to !== undefined) update.assigned_to = toObjectId(assigned_to);
    if (priority !== undefined) update.priority = priority;
    if (status === 'resolved') {
      update.resolved_at = new Date();
      update.completed_at = new Date();
    }
    if (accepted_by_department !== undefined) {
      update.accepted_by_department = accepted_by_department === true || accepted_by_department === 'true';
      update.accepted_at = new Date();
    }
    if (cost_estimated_amount !== undefined) update.cost_estimated_amount = Number(cost_estimated_amount) || null;
    if (cost_materials !== undefined) update.cost_materials = cost_materials ?? null;
    if (cost_labor !== undefined) update.cost_labor = cost_labor ?? null;
    if (cost_status !== undefined) {
      update.cost_status = cost_status;
      if (cost_status === 'submitted') update.cost_submitted_at = new Date();
    }
    if (completion_remarks !== undefined) update.completion_remarks = completion_remarks ?? null;
    const c = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('department_id', 'name')
      .lean();
    if (!c) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    const images = await ComplaintImage.find({ complaint_id: c._id }).lean();
    res.json(
      complaintToJson({
        ...c,
        complaint_images: images.map((i: any) => ({ id: i._id.toString(), url: i.url, caption: i.caption, type: i.type ?? 'general' })),
        departments: (c as any).department_id,
        zones: (c as any).zone_id,
        wards: (c as any).ward_id,
        areas: (c as any).area_id,
        profiles: (c as any).user_id,
      } as any)
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Department: upload before/after work photos
router.post('/:id/images', upload.array('images', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const complaintId = req.params.id;
    const type = (req.body.type as string) || 'general';
    if (!['before', 'after', 'general'].includes(type)) {
      res.status(400).json({ error: 'type must be before, after, or general' });
      return;
    }
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      res.status(400).json({ error: 'No images uploaded' });
      return;
    }
    const urls = files.map((f) => `${baseUrl}/uploads/${f.filename}`);
    await ComplaintImage.insertMany(urls.map((url) => ({ complaint_id: complaintId, url, type })));
    const c = await Complaint.findById(complaintId)
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .lean();
    if (!c) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    const images = await ComplaintImage.find({ complaint_id: complaintId }).lean();
    res.json(
      complaintToJson({
        ...c,
        complaint_images: images.map((i: any) => ({ id: i._id.toString(), url: i.url, caption: i.caption, type: i.type ?? 'general' })),
        departments: (c as any).department_id,
        zones: (c as any).zone_id,
        wards: (c as any).ward_id,
        areas: (c as any).area_id,
        profiles: (c as any).user_id,
      } as any)
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await ComplaintComment.deleteMany({ complaint_id: req.params.id });
    await ComplaintImage.deleteMany({ complaint_id: req.params.id });
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

router.post('/:id/comments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }
    const comment = await ComplaintComment.create({
      complaint_id: req.params.id,
      user_id: new mongoose.Types.ObjectId(req.user!.id),
      content,
      is_internal: false,
    });
    const populated = await ComplaintComment.findById(comment._id).populate('user_id', 'full_name').lean();
    res.status(201).json({
      id: comment._id.toString(),
      complaint_id: (populated as any).complaint_id.toString(),
      user_id: req.user!.id,
      content: (populated as any).content,
      is_internal: (populated as any).is_internal,
      created_at: (populated as any).createdAt ?? (populated as any).created_at,
      profiles: { full_name: req.user!.full_name },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;
