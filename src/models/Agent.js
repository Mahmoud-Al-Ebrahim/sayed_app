import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    clientIntegerId: {
      type: Number,
      required: true,
      index: true,
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

agentSchema.index({ clientIntegerId: 1 });

export const Agent = mongoose.model('Agent', agentSchema);
