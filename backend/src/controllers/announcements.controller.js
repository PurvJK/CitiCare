import { Announcement } from '../models/Announcement.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { sendNotification } from '../services/notification/notification.service.js';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toDto(row) {
  return {
    id: row._id.toString(),
    title: row.title,
    description: row.description,
    announcedBy: row.announcedBy,
    role: row.role,
    departmentType: row.departmentType ?? null,
    area: row.area ?? 'City-wide',
    priority: row.priority,
    createdAt: row.createdAt,
  };
}

export async function createAnnouncement(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!['admin', 'department_head'].includes(req.user.role)) {
      res.status(403).json({ error: 'Only admin and department users can create announcements' });
      return;
    }

    const { title, description, priority, area } = req.body;

    if (!title?.trim() || !description?.trim()) {
      res.status(400).json({ error: 'title and description are required' });
      return;
    }

    if (!priority || !['High', 'Medium', 'Low'].includes(priority)) {
      res.status(400).json({ error: 'priority must be High, Medium, or Low' });
      return;
    }

    let role = 'admin';
    let announcedBy = 'Admin';
    let departmentType = null;

    if (req.user.role === 'department_head') {
      role = 'department';
      if (!req.user.department_id) {
        res.status(400).json({ error: 'Department is not assigned to this user' });
        return;
      }
      const dept = await Department.findById(req.user.department_id).select('name category code').lean();
      if (!dept) {
        res.status(400).json({ error: 'Assigned department not found' });
        return;
      }
      announcedBy = dept.name;
      departmentType = (dept.category || dept.name || dept.code || '').trim() || null;
      if (!departmentType) {
        res.status(400).json({ error: 'Unable to determine department type for this department' });
        return;
      }
    }

    const resolvedArea = req.user.role === 'admin' ? 'City-wide' : area?.trim() || 'City-wide';

    const created = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      announcedBy,
      role,
      departmentType,
      area: resolvedArea,
      priority,
    });

    // Notify citizens of the new announcement
    try {
      const citizens = await User.find({ role: 'citizen' }).select('_id').lean();
      for (const citizen of citizens) {
        await sendNotification({
          recipientId: citizen._id.toString(),
          senderId: req.user.id,
          type: 'announcement',
          title: `Announcement: ${title.trim()}`,
          message: description.trim().substring(0, 100) + (description.trim().length > 100 ? '...' : ''),
          link: '/dashboard', // Direct citizens to their dashboard announcement panel
        });
      }
    } catch (err) {
      console.error('[Notification] Error creating announcement notifications:', err);
    }

    res.status(201).json(toDto(created));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
}

export async function listAnnouncements(req, res) {
  try {
    const priority = typeof req.query.priority === 'string' ? req.query.priority.trim() : '';
    const departmentType = typeof req.query.departmentType === 'string' ? req.query.departmentType.trim() : '';
    const area = typeof req.query.area === 'string' ? req.query.area.trim() : '';

    const filter = {
      role: { $in: ['admin', 'department'] },
    };

    if (priority && ['High', 'Medium', 'Low'].includes(priority)) {
      filter.priority = priority;
    }

    if (departmentType) {
      filter.$and = [
        {
          $or: [
            { role: 'admin' },
            { departmentType: new RegExp(`^${escapeRegExp(departmentType)}$`, 'i') },
          ],
        },
      ];
    }

    if (area) {
      filter.$or = [{ area: { $regex: /^City-wide$/i } }, { area: new RegExp(`^${escapeRegExp(area)}$`, 'i') }];
    }

    const rows = await Announcement.find(filter).sort({ createdAt: -1 }).lean();
    res.json(rows.map(toDto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}
