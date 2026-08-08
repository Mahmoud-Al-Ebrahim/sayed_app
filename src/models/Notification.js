import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['system', 'promotion', 'order', 'balance', 'announcement'],
      required: true,
      default: 'system',
      index: true,
    },
    target: {
      type: String,
      enum: ['all', 'specific', 'role'],
      required: true,
      default: 'all',
    },
    targetRoles: {
      type: [String],
      enum: ['admin', 'client', 'agent'],
      default: [],
    },
    targetUserIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      required: true,
      default: 'pending',
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
    // For tracking read status per user (only stored in user notifications)
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    // Optional data payload for additional information
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationSchema.index({ target: 1, status: 1 });
notificationSchema.index({ sentBy: 1, createdAt: -1 });
notificationSchema.index({ targetUserIds: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);