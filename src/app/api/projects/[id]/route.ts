import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { updateProjectSchema } from '@/lib/validations';
import {
    getAuthUser,
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse
} from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

// GET /api/projects/[id] - Get a single project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = getAuthUser(request);

        if (!authUser) {
            return unauthorizedResponse();
        }

        const { id } = await params;

        const project = await prisma.project.findFirst({
            where: {
                id,
                userId: authUser.userId,
            },
        });

        if (!project) {
            return notFoundResponse('Project');
        }

        return successResponse(project);
    } catch (error) {
        console.error('Get project error:', error);
        return errorResponse('Internal server error', 500);
    }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = getAuthUser(request);

        if (!authUser) {
            return unauthorizedResponse();
        }

        const { id } = await params;

        // Check if project exists and belongs to user
        const existingProject = await prisma.project.findFirst({
            where: {
                id,
                userId: authUser.userId,
            },
        });

        if (!existingProject) {
            return notFoundResponse('Project');
        }

        const body = await request.json();

        // Validate input
        const parsed = updateProjectSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse(parsed.error.errors[0].message);
        }

        const { name, description, status, deadline, teamMember, budget } = parsed.data;

        // Update project
        const project = await prisma.project.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(deadline && { deadline: new Date(deadline) }),
                ...(teamMember && { teamMember }),
                ...(budget !== undefined && { budget }),
            },
        });

        return successResponse(project);
    } catch (error) {
        console.error('Update project error:', error);
        return errorResponse('Internal server error', 500);
    }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = getAuthUser(request);

        if (!authUser) {
            return unauthorizedResponse();
        }

        const { id } = await params;

        // Check if project exists and belongs to user
        const existingProject = await prisma.project.findFirst({
            where: {
                id,
                userId: authUser.userId,
            },
        });

        if (!existingProject) {
            return notFoundResponse('Project');
        }

        // Delete project
        await prisma.project.delete({
            where: { id },
        });

        return successResponse({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        return errorResponse('Internal server error', 500);
    }
}
