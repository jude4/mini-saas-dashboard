import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createProjectSchema, projectQuerySchema } from '@/lib/validations';
import {
    getAuthUser,
    successResponse,
    errorResponse,
    unauthorizedResponse
} from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/projects - List all projects with filtering and search
export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);

        if (!authUser) {
            return unauthorizedResponse();
        }

        // Parse query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryResult = projectQuerySchema.safeParse({
            status: searchParams.get('status') || undefined,
            search: searchParams.get('search') || undefined,
            page: searchParams.get('page') || 1,
            limit: searchParams.get('limit') || 10,
        });

        if (!queryResult.success) {
            return errorResponse(queryResult.error.errors[0].message);
        }

        const { status, search, page, limit } = queryResult.data;

        // Build where clause
        const where: Prisma.ProjectWhereInput = {
            userId: authUser.userId,
        };

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { teamMember: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get total count for pagination
        const total = await prisma.project.count({ where });

        // Get projects
        const projects = await prisma.project.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({
            projects,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get projects error:', error);
        return errorResponse('Internal server error', 500);
    }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);

        if (!authUser) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Validate input
        const parsed = createProjectSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse(parsed.error.errors[0].message);
        }

        const { name, description, status, deadline, teamMember, budget } = parsed.data;

        // Create project
        const project = await prisma.project.create({
            data: {
                name,
                description,
                status,
                deadline: new Date(deadline),
                teamMember,
                budget,
                userId: authUser.userId,
            },
        });

        return successResponse(project, 201);
    } catch (error) {
        console.error('Create project error:', error);
        return errorResponse('Internal server error', 500);
    }
}
