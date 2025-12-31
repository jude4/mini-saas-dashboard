import { z } from 'zod';

// Status enum values
export const StatusEnum = z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED']);
export type StatusType = z.infer<typeof StatusEnum>;

// Project validation schemas
export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    status: StatusEnum.default('ACTIVE'),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
    teamMember: z.string().min(1, 'Team member is required').max(100, 'Name too long'),
    budget: z.number().min(0, 'Budget must be positive').max(10000000, 'Budget too high'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
    status: StatusEnum.optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
});

// Auth validation schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
