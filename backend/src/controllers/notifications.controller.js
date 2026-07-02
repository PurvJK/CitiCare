import { Notification } from '../models/Notification.js';

export async function listNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'full_name email')
      .lean();

    res.json(
      notifications.map((n) => ({
        id: n._id.toString(),
        sender: n.sender ? { id: n.sender._id.toString(), full_name: n.sender.full_name } : null,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        link: n.link,
        created_at: n.createdAt,
      }))
    );
  } catch (e) {
    console.error('[NotificationController] Error listing notifications:', e);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.json({
      id: notification._id.toString(),
      read: notification.read,
    });
  } catch (e) {
    console.error('[NotificationController] Error marking notification as read:', e);
    res.status(500).json({ error: 'Failed to update notification' });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.json({ ok: true, message: 'All notifications marked as read' });
  } catch (e) {
    console.error('[NotificationController] Error marking all notifications as read:', e);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
}

export async function deleteNotification(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await Notification.findOneAndDelete({ _id: id, recipient: userId });

    if (!result) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    res.status(204).send();
  } catch (e) {
    console.error('[NotificationController] Error deleting notification:', e);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
}
