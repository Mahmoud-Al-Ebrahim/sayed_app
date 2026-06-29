import mongoose from 'mongoose';

/**
 * Badge system for agents - determines profit margins
 */
const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
      comment: 'Higher level = higher tier badge',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    icon: {
      type: String,
      trim: true,
      comment: 'Icon identifier for UI',
    },
    color: {
      type: String,
      trim: true,
      comment: 'Color code for UI',
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

badgeSchema.index({ level: 1, isActive: 1 });

export const Badge = mongoose.model('Badge', badgeSchema);
