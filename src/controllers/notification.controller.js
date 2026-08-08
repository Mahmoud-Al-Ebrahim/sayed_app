import * as notificationService from '../services/notification.service.js';
import { msg } from '../constants/messages.js';

// Admin notification controllers
export async function sendNotificationToAll(req, res, next) {
  try {
    const { title, body, type, data } = req.body;
    
    const notification = await notificationService.sendNotificationToAll({
      title,
      body,
      type,
      sentBy: req.user._id,
      data,
    });

    res.status(201).json({ 
      success: true, 
      data: { notification },
      message: msg.NOTIFICATION_SENT 
    });
  } catch (err) {
    next(err);
  }
}

export async function sendNotificationToRoles(req, res, next) {
  try {
    const { title, body, type, roles, data } = req.body;
    
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'roles array is required' 
      });
    }

    const notification = await notificationService.sendNotificationToRoles({
      title,
      body,
      type,
      sentBy: req.user._id,
      data,
    }, roles);

    res.status(201).json({ 
      success: true, 
      data: { notification },
      message: msg.NOTIFICATION_SENT 
    });
  } catch (err) {
    next(err);
  }
}

export async function sendNotificationToUsers(req, res, next) {
  try {
    const { title, body, type, userIds, data } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'userIds array is required' 
      });
    }

    const notification = await notificationService.sendNotificationToUsers({
      title,
      body,
      type,
      sentBy: req.user._id,
      data,
    }, userIds);

    res.status(201).json({ 
      success: true, 
      data: { notification },
      message: msg.NOTIFICATION_SENT 
    });
  } catch (err) {
    next(err);
  }
}

export async function listNotifications(req, res, next) {
  try {
    const data = await notificationService.listNotificationsForAdmin({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status,
      type: req.query.type,
      target: req.query.target,
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getNotification(req, res, next) {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);
    res.json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const notification = await notificationService.deleteNotification(req.params.id);
    res.json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
}

// Client notification controllers
export async function listClientNotifications(req, res, next) {
  try {
    const data = await notificationService.listNotificationsForUser(req.user._id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      unreadOnly: req.query.unreadOnly === 'true',
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getClientNotification(req, res, next) {
  try {
    const notification = await notificationService.getNotificationById(req.params.id);
    res.json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markNotificationAsRead(
      req.params.id, 
      req.user._id
    );
    res.json({ 
      success: true, 
      data: { notification },
      message: msg.NOTIFICATION_MARKED_READ 
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllNotificationsAsRead(req.user._id);
    res.json({ 
      success: true, 
      data: result,
      message: 'All notifications marked as read' 
    });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}