import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { ComplaintImage } from '../models/ComplaintImage.js';
import { ComplaintComment } from '../models/ComplaintComment.js';
import { getNextComplaintNumber } from '../models/ComplaintCounter.js';
import { sendNotification } from '../services/notification/notification.service.js';
import { calculateSlaDeadline } from '../services/sla/sla.service.js';

const baseUrl = process.env.API_BASE_URL || '';

function getPublicBaseUrl(req) {
  if (baseUrl) return baseUrl.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

function toId(obj) {
  return obj?._id?.toString() ?? null;
}

function complaintToJson(c, extra) {
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
    assigned_officer: c?.assigned_to ? { full_name: c.assigned_to.full_name, email: c.assigned_to.email } : null,
    upvotes: c?.upvotes ?? 0,
    upvoted_by_user: extra && typeof extra.upvoted_by_user === 'boolean' ? extra.upvoted_by_user : false,
    complaint_images: Array.isArray(c?.complaint_images)
      ? c.complaint_images.map((img) => ({
          id: img?._id?.toString?.() ?? '',
          complaint_id: img?.complaint_id?.toString?.() ?? null,
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
    feedback_rating: c?.feedback_rating ?? null,
    feedback_comment: c?.feedback_comment ?? null,
    feedback_submitted_at: c?.feedback_submitted_at ?? null,
    sla_due_date: c?.sla_due_date ?? null,
    sla_breached: c?.sla_breached ?? false,
    sla_escalated: c?.sla_escalated ?? false,
    ...extra,
  };
}

export async function listComplaints(req, res) {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    let filter = {};
    if (req.user.role === 'citizen') {
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400).json({ error: 'Invalid user' });
        return;
      }
      filter = { user_id: new mongoose.Types.ObjectId(req.user.id) };
    } else if (req.user.role === 'department_head') {
      if (req.user.department_id && mongoose.Types.ObjectId.isValid(req.user.department_id)) {
        filter = {
          $or: [
            { department_id: new mongoose.Types.ObjectId(req.user.department_id) },
            { assigned_to: new mongoose.Types.ObjectId(req.user.id) }
          ]
        };
      } else if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        filter = { assigned_to: new mongoose.Types.ObjectId(req.user.id) };
      }
    } else if (req.user.role === 'officer') {
      if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(400).json({ error: 'Invalid user' });
        return;
      }
      filter = { assigned_to: new mongoose.Types.ObjectId(req.user.id) };
    }
    const sortBy = req.query.sort || 'date';
    let sortOption = { createdAt: -1 };
    if (sortBy === 'priority') sortOption = { priority: 1, createdAt: -1 };
    if (sortBy === 'area') sortOption = { ward_id: 1, area_id: 1, createdAt: -1 };
    const list = await Complaint.find(filter)
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .populate('assigned_to', 'full_name email')
      .sort(sortOption)
      .lean();

    const withImages = await Promise.all(
      list.map(async (c) => {
        const images = await ComplaintImage.find({ complaint_id: c._id }).lean();
        const urls = images.map((i) => ({
          id: i._id?.toString?.() ?? '',
          complaint_id: i.complaint_id?.toString?.() ?? null,
          url: i.url ?? '',
          caption: i.caption ?? null,
          type: i.type ?? 'general',
        }));
        const upvotedByUser = Array.isArray(c?.upvoted_by)
          ? c.upvoted_by.some((u) => (u?._id?.toString ? u._id.toString() : u?.toString()) === req.user.id)
          : false;
        return complaintToJson(
          {
            ...c,
            complaint_images: urls,
            departments: c.department_id,
            zones: c.zone_id,
            wards: c.ward_id,
            areas: c.area_id,
            profiles: c.user_id,
          },
          { upvoted_by_user: upvotedByUser }
        );
      })
    );
    res.json(withImages);
  } catch (e) {
    console.error('[GET /complaints]', e?.message ?? e);
    res.status(500).json({ error: 'Failed to fetch complaints', detail: process.env.NODE_ENV === 'development' ? e?.message : undefined });
  }
}

export async function getComplaintStats(req, res) {
  try {
    let filter = {};
    if (req.user.role === 'citizen') {
      filter = { user_id: new mongoose.Types.ObjectId(req.user.id) };
    } else if (req.user.role === 'department_head') {
      if (req.user.department_id && mongoose.Types.ObjectId.isValid(req.user.department_id)) {
        filter = {
          $or: [
            { department_id: new mongoose.Types.ObjectId(req.user.department_id) },
            { assigned_to: new mongoose.Types.ObjectId(req.user.id) }
          ]
        };
      } else if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        filter = { assigned_to: new mongoose.Types.ObjectId(req.user.id) };
      }
    } else if (req.user.role === 'officer') {
      filter = { assigned_to: new mongoose.Types.ObjectId(req.user.id) };
    }
    const complaints = await Complaint.find(filter).select('status').lean();
    const stats = { total: complaints.length, pending: 0, in_progress: 0, on_hold: 0, resolved: 0, rejected: 0, closed: 0 };
    complaints.forEach((c) => {
      if (c.status && stats[c.status] !== undefined) stats[c.status] += 1;
    });
    res.json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function getMonthlyComplaints(req, res) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const filter = { createdAt: { $gte: sixMonthsAgo } };
    if (req.user.role === 'citizen') {
      filter.user_id = new mongoose.Types.ObjectId(req.user.id);
    } else if (req.user.role === 'department_head') {
      if (req.user.department_id && mongoose.Types.ObjectId.isValid(req.user.department_id)) {
        filter.$or = [
          { department_id: new mongoose.Types.ObjectId(req.user.department_id) },
          { assigned_to: new mongoose.Types.ObjectId(req.user.id) }
        ];
      } else if (mongoose.Types.ObjectId.isValid(req.user.id)) {
        filter.assigned_to = new mongoose.Types.ObjectId(req.user.id);
      }
    } else if (req.user.role === 'officer') {
      filter.assigned_to = new mongoose.Types.ObjectId(req.user.id);
    }
    const complaints = await Complaint.find(filter).select('createdAt created_at').lean();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyData = [];
    for (let i = 5; i >= 0; i -= 1) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData.push({ month: months[monthIndex], complaints: 0 });
    }
    complaints.forEach((c) => {
      const d = new Date(c.createdAt ?? c.created_at);
      const name = months[d.getMonth()];
      const entry = monthlyData.find((m) => m.month === name);
      if (entry) entry.complaints += 1;
    });
    res.json(monthlyData);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
}

export async function listNearbyComplaints(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius || '5000', 10);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      res.status(400).json({ error: 'lat and lng query parameters are required' });
      return;
    }

    const toRadians = (deg) => (deg * Math.PI) / 180;
    const earthRadius = 6371000;
    const distanceMeters = (lat1, lon1, lat2, lon2) => {
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return earthRadius * c;
    };

    const all = await Complaint.find()
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .populate('assigned_to', 'full_name email')
      .populate('upvoted_by', '_id')
      .lean();

    const nearby = all.filter((c) => {
      if (c.latitude == null || c.longitude == null) return false;
      const d = distanceMeters(lat, lng, Number(c.latitude), Number(c.longitude));
      return d <= radius;
    });

    const withImages = await Promise.all(
      nearby.map(async (c) => {
        const images = await ComplaintImage.find({ complaint_id: c._id }).lean();
        const urls = images.map((i) => ({ id: i._id.toString(), complaint_id: i.complaint_id?.toString?.() ?? null, url: i.url, caption: i.caption, type: i.type ?? 'general' }));
        const upvotedByUser = Array.isArray(c?.upvoted_by) ? c.upvoted_by.some((u) => (u?._id?.toString ? u._id.toString() : u?.toString()) === req.user.id) : false;
        return complaintToJson(
          {
            ...c,
            complaint_images: urls,
            departments: c.department_id,
            zones: c.zone_id,
            wards: c.ward_id,
            areas: c.area_id,
            profiles: c.user_id,
          },
          { upvoted_by_user: upvotedByUser }
        );
      })
    );

    res.json(withImages);
  } catch (e) {
    console.error('[GET /complaints/nearby]', e);
    res.status(500).json({ error: 'Failed to fetch nearby complaints' });
  }
}

export async function listWardNearbyComplaints(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userZone = req.user.zone_id;
    if (!userZone) {
      res.status(400).json({ error: 'User has no ward/zone assigned' });
      return;
    }

    const list = await Complaint.find({ zone_id: userZone })
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .populate('assigned_to', 'full_name email')
      .populate('upvoted_by', '_id')
      .sort({ upvotes: -1, createdAt: -1 })
      .lean();

    const withImages = await Promise.all(
      list.map(async (c) => {
        const images = await ComplaintImage.find({ complaint_id: c._id }).lean();
        const urls = images.map((i) => ({ id: i._id.toString(), complaint_id: i.complaint_id?.toString?.() ?? null, url: i.url, caption: i.caption, type: i.type ?? 'general' }));
        const upvotedByUser = Array.isArray(c?.upvoted_by) ? c.upvoted_by.some((u) => (u?._id?.toString ? u._id.toString() : u?.toString()) === req.user.id) : false;
        return complaintToJson(
          {
            ...c,
            complaint_images: urls,
            departments: c.department_id,
            zones: c.zone_id,
            wards: c.ward_id,
            areas: c.area_id,
            profiles: c.user_id,
          },
          { upvoted_by_user: upvotedByUser }
        );
      })
    );

    res.json(withImages);
  } catch (e) {
    console.error('[GET /complaints/nearby/ward]', e);
    res.status(500).json({ error: 'Failed to fetch ward complaints' });
  }
}

export async function listComplaintsByWard(req, res) {
  try {
    const wardId = req.query.wardId;
    if (!wardId || !mongoose.Types.ObjectId.isValid(wardId)) {
      res.status(400).json({ error: 'wardId query parameter is required and must be a valid id' });
      return;
    }

    const list = await Complaint.find({ ward_id: new mongoose.Types.ObjectId(wardId) })
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .populate('assigned_to', 'full_name email')
      .populate('upvoted_by', '_id')
      .sort({ upvotes: -1, createdAt: -1 })
      .lean();

    const withImages = await Promise.all(
      list.map(async (c) => {
        const images = await ComplaintImage.find({ complaint_id: c._id }).lean();
        const urls = images.map((i) => ({ id: i._id.toString(), complaint_id: i.complaint_id?.toString?.() ?? null, url: i.url, caption: i.caption, type: i.type ?? 'general' }));
        const upvotedByUser = Array.isArray(c?.upvoted_by) ? c.upvoted_by.some((u) => (u?._id?.toString ? u._id.toString() : u?.toString()) === req.user.id) : false;
        return complaintToJson(
          {
            ...c,
            complaint_images: urls,
            departments: c.department_id,
            zones: c.zone_id,
            wards: c.ward_id,
            areas: c.area_id,
            profiles: c.user_id,
          },
          { upvoted_by_user: upvotedByUser }
        );
      })
    );

    res.json(withImages);
  } catch (e) {
    console.error('[GET /complaints/by-ward]', e);
    res.status(500).json({ error: 'Failed to fetch complaints by ward' });
  }
}

export async function listComplaintDepartmentsMeta(_req, res) {
  try {
    const { Department } = await import('../models/Department.js');
    const list = await Department.find().select('_id name code category').sort({ name: 1 }).lean();
    res.json(list.map((d) => ({ id: d._id.toString(), name: d.name, code: d.code, category: d.category })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

export async function listOfficersMeta(req, res) {
  try {
    const { User } = await import('../models/User.js');
    const deptId = req.query.departmentId;
    const filter = { role: 'officer' };
    if (deptId) filter.department_id = new mongoose.Types.ObjectId(deptId);
    const officers = await User.find(filter).select('_id full_name email department_id').sort({ full_name: 1 }).lean();
    res.json(
      officers.map((o) => ({
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
}

export async function listComplaintComments(req, res) {
  try {
    const comments = await ComplaintComment.find({ complaint_id: req.params.id })
      .populate('user_id', 'full_name')
      .sort({ createdAt: 1 })
      .lean();
    res.json(
      comments.map((c) => ({
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
}

export async function getComplaintById(req, res) {
  try {
    const id = req.params.id;
    const c = await Complaint.findById(id)
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name phone email')
      .populate('upvoted_by', '_id')
      .lean();
    if (!c) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    if (req.user.role === 'citizen') {
      const ownerId = toId(c.user_id);
      const userZone = req.user.zone_id;
      const compZone = c.zone_id ? (c.zone_id._id ? c.zone_id._id.toString() : c.zone_id.toString()) : null;
      if (ownerId !== req.user.id && (!userZone || userZone !== compZone)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    }
    const images = await ComplaintImage.find({ complaint_id: id }).lean();
    const urls = images.map((i) => ({ id: i._id.toString(), complaint_id: i.complaint_id?.toString?.() ?? null, url: i.url, caption: i.caption, type: i.type ?? 'general' }));
    const upvotedByUser = Array.isArray(c.upvoted_by) ? c.upvoted_by.some((u) => (u?._id?.toString ? u._id.toString() : u?.toString()) === req.user.id) : false;
    res.json(
      complaintToJson(
        { ...c, complaint_images: urls, departments: c.department_id, zones: c.zone_id, wards: c.ward_id, areas: c.area_id, profiles: c.user_id },
        { upvoted_by_user: upvotedByUser }
      )
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
}

export async function createComplaint(req, res) {
  try {
    const { title, description, category, address, zone_id, ward_id, area_id, department_id, latitude: bodyLat, longitude: bodyLng } = req.body;
    if (!title || !description || !category) {
      res.status(400).json({ error: 'Title, description and category are required' });
      return;
    }
    const complaint_number = await getNextComplaintNumber();
    const files = req.files;
    const publicBaseUrl = getPublicBaseUrl(req);
    const imageUrls = (files || []).map((f) => `${publicBaseUrl}/uploads/${f.filename}`);
    const toObjectId = (v) => (v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null);

    const { Department } = await import('../models/Department.js');
    let assigned_to = null;
    if (department_id && mongoose.Types.ObjectId.isValid(department_id)) {
      const dept = await Department.findById(department_id).select('in_charge_officer_id').lean();
      if (dept?.in_charge_officer_id) {
        assigned_to = dept.in_charge_officer_id;
      }
    }

    const createdAt = new Date();
    const sla_due_date = calculateSlaDeadline(createdAt, 'medium');

    let latitude = bodyLat !== undefined ? Number(bodyLat) : NaN;
    let longitude = bodyLng !== undefined ? Number(bodyLng) : NaN;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      // Generate Surat center coordinates with random offset so they plot nicely on the Leaflet map
      const SURAT_LAT = 21.1702;
      const SURAT_LNG = 72.8311;
      const latOffset = (Math.random() - 0.5) * 0.06;
      const lngOffset = (Math.random() - 0.5) * 0.06;
      latitude = SURAT_LAT + latOffset;
      longitude = SURAT_LNG + lngOffset;
    }

    const complaint = await Complaint.create({
      complaint_number,
      user_id: new mongoose.Types.ObjectId(req.user.id),
      title,
      description,
      category,
      address: address || null,
      zone_id: toObjectId(zone_id),
      ward_id: toObjectId(ward_id),
      area_id: toObjectId(area_id),
      department_id: toObjectId(department_id),
      assigned_to,
      status: 'pending',
      priority: 'medium',
      sla_due_date,
      latitude,
      longitude,
    });
    if (imageUrls.length > 0) {
      await ComplaintImage.insertMany(imageUrls.map((url) => ({ complaint_id: complaint._id, url, type: 'general' })));
    }

    // Send database notifications
    try {
      await sendNotification({
        recipientId: req.user.id,
        type: 'status_change',
        title: 'Complaint Submitted',
        message: `Your complaint #${complaint_number} has been successfully submitted.`,
        link: `/complaints/${complaint._id}`
      });

      if (assigned_to) {
        await sendNotification({
          recipientId: assigned_to.toString(),
          senderId: req.user.id,
          type: 'assignment',
          title: 'New Complaint Assigned',
          message: `Complaint #${complaint_number} has been assigned to your department.`,
          link: `/complaints/${complaint._id}`
        });
      }
    } catch (err) {
      console.error('[Notification] Error creating notification for new complaint:', err);
    }

    const populated = await Complaint.findById(complaint._id)
      .populate('department_id', 'name')
      .populate('zone_id', 'name')
      .populate('ward_id', 'name')
      .populate('area_id', 'name')
      .populate('user_id', 'full_name')
      .populate('upvoted_by', '_id')
      .lean();
    const images = await ComplaintImage.find({ complaint_id: complaint._id }).lean();
    res.status(201).json(
      complaintToJson(
        {
          ...populated,
          complaint_images: images.map((i) => ({ id: i._id.toString(), complaint_id: i.complaint_id?.toString?.() ?? null, url: i.url, caption: i.caption })),
          departments: populated?.department_id,
          zones: populated?.zone_id,
          wards: populated?.ward_id,
          areas: populated?.area_id,
          profiles: populated?.user_id,
        },
        { upvoted_by_user: Array.isArray(populated?.upvoted_by) && populated.upvoted_by.some((u) => (u?._id?.toString ? u._id.toString() : u?.toString()) === req.user.id) }
      )
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
}

export async function updateComplaint(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: 'Invalid complaint id' });
      return;
    }

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

    const oldComplaint = await Complaint.findById(req.params.id)
      .select('status user_id department_id assigned_to complaint_number createdAt priority')
      .lean();
    if (!oldComplaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    // Role-based Access Control (RBAC) & Object-level Authorization
    const userRole = req.user.role;
    const userId = req.user.id;
    const isOwner = oldComplaint.user_id && oldComplaint.user_id.toString() === userId;
    const isAdmin = userRole === 'admin';
    const isDeptHead = userRole === 'department_head';
    const isAssigned = oldComplaint.assigned_to && oldComplaint.assigned_to.toString() === userId;
    const isSameDept = req.user.department_id && oldComplaint.department_id && oldComplaint.department_id.toString() === req.user.department_id;

    if (userRole === 'citizen') {
      if (!isOwner) {
        res.status(403).json({ error: 'You do not have permission to modify this complaint' });
        return;
      }
      // Citizens are not permitted to change status, department assignment, priority, or costs
      const restrictedFields = [
        'status', 'department_id', 'assigned_to', 'priority',
        'accepted_by_department', 'cost_estimated_amount', 'cost_materials',
        'cost_labor', 'cost_status', 'completion_remarks'
      ];
      const attemptedRestricted = restrictedFields.some((field) => req.body[field] !== undefined);
      if (attemptedRestricted) {
        res.status(403).json({ error: 'Only municipal officers and administrators can update complaint status and workflow fields' });
        return;
      }
    } else if (!isAdmin && !isDeptHead && !isAssigned && !isSameDept) {
      res.status(403).json({ error: 'You do not have permission to update this complaint' });
      return;
    }

    const toObjectId = (v) => (v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null);
    const update = {};
    if (status !== undefined) update.status = status;
    if (department_id !== undefined) update.department_id = toObjectId(department_id);
    if (assigned_to !== undefined) update.assigned_to = toObjectId(assigned_to);
    
    if (priority !== undefined) {
      update.priority = priority;
      if (priority !== oldComplaint.priority) {
        const baseDate = oldComplaint.createdAt || oldComplaint.created_at || new Date();
        update.sla_due_date = calculateSlaDeadline(baseDate, priority);
        // Recalculate breached flag if deadline shifted
        update.sla_breached = new Date(update.sla_due_date) <= new Date();
      }
    }
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
      if (cost_status === 'approved') update.cost_approved_by = new mongoose.Types.ObjectId(req.user.id);
    }
    if (completion_remarks !== undefined) update.completion_remarks = completion_remarks ?? null;
    const c = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('department_id', 'name')
      .lean();
    if (!c) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    // Send notifications if status or assignment changed
    try {
      if (status && status !== oldComplaint.status) {
        await sendNotification({
          recipientId: oldComplaint.user_id?.toString(),
          senderId: req.user.id,
          type: 'status_change',
          title: 'Complaint Status Updated',
          message: `Your complaint #${oldComplaint.complaint_number} status has been updated to "${status.replace('_', ' ')}".`,
          link: `/complaints/${c._id}`
        });
      }

      if (assigned_to && assigned_to.toString() !== oldComplaint.assigned_to?.toString()) {
        await sendNotification({
          recipientId: assigned_to.toString(),
          senderId: req.user.id,
          type: 'assignment',
          title: 'New Complaint Assigned',
          message: `Complaint #${oldComplaint.complaint_number} has been assigned to you.`,
          link: `/complaints/${c._id}`
        });
      }
    } catch (err) {
      console.error('[Notification] Error creating notification for updated complaint:', err);
    }

    const images = await ComplaintImage.find({ complaint_id: c._id }).lean();
    res.json(
      complaintToJson({
        ...c,
        complaint_images: images.map((i) => ({ id: i._id.toString(), complaint_id: i.complaint_id?.toString?.() ?? null, url: i.url, caption: i.caption, type: i.type ?? 'general' })),
        departments: c.department_id,
        zones: c.zone_id,
        wards: c.ward_id,
        areas: c.area_id,
        profiles: c.user_id,
      })
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
}

export async function uploadComplaintImages(req, res) {
  try {
    const complaintId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      res.status(400).json({ error: 'Invalid complaint id' });
      return;
    }
    const type = req.body.type || 'general';
    if (!['before', 'after', 'general'].includes(type)) {
      res.status(400).json({ error: 'type must be before, after, or general' });
      return;
    }
    const files = req.files;
    if (!files?.length) {
      res.status(400).json({ error: 'No images uploaded' });
      return;
    }
    const publicBaseUrl = getPublicBaseUrl(req);
    const urls = files.map((f) => `${publicBaseUrl}/uploads/${f.filename}`);
    const complaintObjectId = new mongoose.Types.ObjectId(complaintId);
    await ComplaintImage.insertMany(urls.map((url) => ({ complaint_id: complaintObjectId, url, type })));
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
        complaint_images: images.map((i) => ({ id: i._id.toString(), complaint_id: i.complaint_id?.toString?.() ?? null, url: i.url, caption: i.caption, type: i.type ?? 'general' })),
        departments: c.department_id,
        zones: c.zone_id,
        wards: c.ward_id,
        areas: c.area_id,
        profiles: c.user_id,
      })
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to upload images' });
  }
}

export async function deleteComplaint(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ error: 'Invalid complaint id' });
      return;
    }

    const complaint = await Complaint.findById(req.params.id).select('user_id status');
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = complaint.user_id && complaint.user_id.toString() === req.user.id;
    const isPending = complaint.status === 'pending';

    // Only administrators, or citizens withdrawing their own pending complaint, can delete
    if (!isAdmin && !(isOwner && isPending)) {
      res.status(403).json({ error: 'You do not have permission to delete this complaint' });
      return;
    }

    await ComplaintComment.deleteMany({ complaint_id: req.params.id });
    await ComplaintImage.deleteMany({ complaint_id: req.params.id });
    await Complaint.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
}

export async function upvoteComplaint(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (req.user.role !== 'citizen') {
      res.status(403).json({ error: 'Only citizens can upvote complaints' });
      return;
    }
    const cid = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      res.status(400).json({ error: 'Invalid complaint id' });
      return;
    }
    const complaint = await Complaint.findById(cid);
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    const userIdStr = req.user.id;
    const already = Array.isArray(complaint.upvoted_by) && complaint.upvoted_by.some((u) => u.toString() === userIdStr);

    const userIdObj = new mongoose.Types.ObjectId(req.user.id);
    if (already) {
      await Complaint.findByIdAndUpdate(cid, { $pull: { upvoted_by: userIdObj }, $inc: { upvotes: -1 } });
    } else {
      await Complaint.findByIdAndUpdate(cid, { $addToSet: { upvoted_by: userIdObj }, $inc: { upvotes: 1 } });
    }

    const updated = await Complaint.findById(cid);
    res.json({ upvotes: updated?.upvotes || 0, upvoted_by_user: !already });
  } catch (e) {
    console.error('[POST /complaints/:id/upvote]', e);
    res.status(500).json({ error: 'Failed to upvote complaint' });
  }
}

export async function submitComplaintFeedback(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (req.user.role !== 'citizen') {
      res.status(403).json({ error: 'Only citizens can submit feedback' });
      return;
    }

    const complaintId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      res.status(400).json({ error: 'Invalid complaint id' });
      return;
    }

    const rating = Number(req.body?.rating);
    const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      return;
    }
    if (!comment) {
      res.status(400).json({ error: 'Feedback comment is required' });
      return;
    }

    const complaint = await Complaint.findById(complaintId).select('user_id status feedback_rating');
    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    const ownerId = complaint.user_id ? complaint.user_id.toString() : null;
    if (ownerId !== req.user.id) {
      res.status(403).json({ error: 'You can only submit feedback for your own complaint' });
      return;
    }
    if (complaint.status !== 'resolved') {
      res.status(400).json({ error: 'Feedback can only be submitted after complaint is solved' });
      return;
    }
    if (complaint.feedback_rating !== null && complaint.feedback_rating !== undefined) {
      res.status(400).json({ error: 'Feedback already submitted for this complaint' });
      return;
    }

    await Complaint.findByIdAndUpdate(complaintId, {
      feedback_rating: rating,
      feedback_comment: comment,
      feedback_submitted_at: new Date(),
    });

    res.status(201).json({ ok: true, rating, comment });
  } catch (e) {
    console.error('[POST /complaints/:id/feedback]', e);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

export async function addComplaintComment(req, res) {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }
    const comment = await ComplaintComment.create({
      complaint_id: req.params.id,
      user_id: new mongoose.Types.ObjectId(req.user.id),
      content,
      is_internal: false,
    });

    // Send comments notifications to participants
    try {
      const c = await Complaint.findById(req.params.id).select('user_id assigned_to complaint_number').lean();
      if (c) {
        const messageText = `${req.user.full_name} commented: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`;
        
        if (c.user_id && c.user_id.toString() !== req.user.id) {
          await sendNotification({
            recipientId: c.user_id.toString(),
            senderId: req.user.id,
            type: 'new_comment',
            title: `New Comment on #${c.complaint_number}`,
            message: messageText,
            link: `/complaints/${req.params.id}`
          });
        }
        
        if (c.assigned_to && c.assigned_to.toString() !== req.user.id) {
          await sendNotification({
            recipientId: c.assigned_to.toString(),
            senderId: req.user.id,
            type: 'new_comment',
            title: `New Comment on #${c.complaint_number}`,
            message: messageText,
            link: `/complaints/${req.params.id}`
          });
        }
      }
    } catch (err) {
      console.error('[Notification] Error creating notification for comment:', err);
    }

    const populated = await ComplaintComment.findById(comment._id).populate('user_id', 'full_name').lean();
    res.status(201).json({
      id: comment._id.toString(),
      complaint_id: populated.complaint_id.toString(),
      user_id: req.user.id,
      content: populated.content,
      is_internal: populated.is_internal,
      created_at: populated.createdAt ?? populated.created_at,
      profiles: { full_name: req.user.full_name },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}
