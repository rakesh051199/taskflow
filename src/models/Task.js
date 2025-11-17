import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      validate: {
        validator: function (v) {
          return v && v.trim().length > 0;
        },
        message: 'Title cannot be empty',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'in-progress', 'completed', 'cancelled'],
        message: 'Status must be one of: pending, in-progress, completed, cancelled',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      required: true,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be one of: low, medium, high, urgent',
      },
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user ID is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ projectId: 1, assignedTo: 1 });
taskSchema.index({ projectId: 1, status: 1, assignedTo: 1 });
taskSchema.index({ projectId: 1, createdAt: -1 });
taskSchema.index({ projectId: 1, priority: 1 });
taskSchema.index({ projectId: 1, dueDate: 1 });
taskSchema.index({ projectId: 1, deletedAt: 1 });

// Update updatedAt on save
taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task;

