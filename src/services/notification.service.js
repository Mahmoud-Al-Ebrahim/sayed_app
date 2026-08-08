import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { msg } from '../constants/messages.js';

export async function createNotification(data) {
  const { title, body, type, target, targetRoles, targetUserIds, sentBy, data: notificationData } = data;

  // Validate target and provide defaults
  if (target === 'all' && (targetRoles?.length > 0 || targetUserIds?.length > 0)) {
    throw new Error('Cannot specify roles or user IDs when target is "all"');
  }

  if (target === 'role' && (!targetRoles || targetRoles.length === 0)) {
    throw new Error('targetRoles is required when target is "role"');
  }

  if (target === 'specific' && (!targetUserIds || targetUserIds.length === 0)) {
    throw new Error('targetUserIds is required when target is "specific"');
  }

  const notification = await Notification.create({
    title,
    body,
    type: type || 'system',
    target: target || 'all',
    targetRoles: targetRoles || [],
    targetUserIds: targetUserIds || [],
    sentBy,
    data: notificationData || {},
  });

  return notification;
}

export async function sendNotification(notificationId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error(msg.NOTIFICATION_NOT_FOUND || 'Notification not found');
  }

  if (notification.status !== 'pending') {
    throw new Error('Notification has already been processed');
  }

  try {
    // In a real implementation, this would integrate with FCM, OneSignal, or other push notification services
    // For now, we'll mark it as sent and store it in the database
    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();

    return notification;
  } catch (error) {
    notification.status = 'failed';
    notification.failureReason = error.message;
    await notification.save();
    throw error;
  }
}

export async function sendNotificationToAll(data) {
  const notification = await createNotification({
    ...data,
    target: 'all',
  });

  return await sendNotification(notification._id);
}

export async function sendNotificationToRoles(data, roles) {
  const notification = await createNotification({
    ...data,
    target: 'role',
    targetRoles: roles,
  });

  return await sendNotification(notification._id);
}

export async function sendNotificationToUsers(data, userIds) {
  const notification = await createNotification({
    ...data,
    target: 'specific',
    targetUserIds: userIds,
  });

  return await sendNotification(notification._id);
}

export async function listNotificationsForAdmin(filters = {}) {
  const { page = 1, limit = 20, status, type, target } = filters;

  const query = {};
  if (status) query.status = status;
  if (type) query.type = type;
  if (target) query.target = target;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('sentBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(query),
  ]);

  return { notifications, total, page, limit };
}

export async function listNotificationsForUser(userId, filters = {}) {
  const { page = 1, limit = 20, unreadOnly = false } = filters;

  const query = {
    $or: [
      { target: 'all' },
      { target: 'specific', targetUserIds: userId },
      { target: 'role', targetRoles: { $in: ['client'] } }, // Clients receive role-based notifications
    ],
  };

  if (unreadOnly) {
    query.readBy = { $ne: userId };
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate('sentBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(query),
  ]);

  return { notifications, total, page, limit };
}

export async function getNotificationById(notificationId) {
  const notification = await Notification.findById(notificationId).populate('sentBy', 'name email role');
  if (!notification) {
    throw new Error(msg.NOTIFICATION_NOT_FOUND);
  }
  return notification;
}

export async function markNotificationAsRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error(msg.NOTIFICATION_NOT_FOUND || 'Notification not found');
  }

  // Check if user is authorized to read this notification
  const isTargeted = 
    notification.target === 'all' ||
    notification.targetUserIds.includes(userId) ||
    notification.targetRoles.includes('client'); // Simplified for clients

  if (!isTargeted) {
    throw new Error('You are not authorized to read this notification');
  }

  if (!notification.readBy.includes(userId)) {
    notification.readBy.push(userId);
    await notification.save();
  }

  return notification;
}

export async function markAllNotificationsAsRead(userId) {
  const result = await Notification.updateMany(
    {
      $or: [
        { target: 'all' },
        { target: 'specific', targetUserIds: userId },
        { target: 'role', targetRoles: { $in: ['client'] } },
      ],
      readBy: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
    }
  );

  return { modifiedCount: result.modifiedCount };
}

export async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({
    $or: [
      { target: 'all' },
      { target: 'specific', targetUserIds: userId },
      { target: 'role', targetRoles: { $in: ['client'] } },
    ],
    readBy: { $ne: userId },
  });

  return { count };
}

export async function deleteNotification(notificationId) {
  const notification = await Notification.findByIdAndDelete(notificationId);
  if (!notification) {
    throw new Error(msg.NOTIFICATION_NOT_FOUND || 'Notification not found');
  }
  return notification;
}