import { z } from 'zod';

/**
 * Task status enum
 */
const TaskStatus = z.enum(['pending', 'in-progress', 'completed', 'cancelled']);

/**
 * Task priority enum
 */
const TaskPriority = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * ObjectId validation schema
 */
const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

/**
 * Date validation schema (ISO string or Date)
 */
const DateSchema = z.union([
  z.string().datetime(),
  z.date(),
  z.null(),
]).transform((val) => {
  if (val === null || val === undefined) return null;
  return typeof val === 'string' ? new Date(val) : val;
}).nullable();

/**
 * Create task request schema
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim()
    .optional()
    .default(''),
  status: TaskStatus.optional().default('pending'),
  priority: TaskPriority.optional().default('medium'),
  dueDate: DateSchema.optional().nullable(),
  assignedTo: ObjectIdSchema.optional().nullable(),
});

/**
 * Update task request schema (all fields optional)
 */
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim()
    .optional(),
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  dueDate: DateSchema.optional().nullable(),
  assignedTo: ObjectIdSchema.optional().nullable(),
});

/**
 * Update task status schema (status only)
 */
export const updateTaskStatusSchema = z.object({
  status: TaskStatus,
});

/**
 * List tasks query parameters schema
 */
export const listTasksQuerySchema = z.object({
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  assignedTo: ObjectIdSchema.optional(),
  overdue: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a positive integer')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a positive integer')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100))
    .optional()
    .default('50'),
});

