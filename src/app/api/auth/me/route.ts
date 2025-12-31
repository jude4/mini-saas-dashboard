import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
    getAuthUser,
    successResponse,
    unauthorizedResponse
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authUser = getAuthUser(request);

        if (!authUser) {
            return unauthorizedResponse();
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return unauthorizedResponse();
        }

        return successResponse(user);
    } catch (error) {
        console.error('Get profile error:', error);
        return unauthorizedResponse();
    }
}
