import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { loginSchema } from '@/lib/validations';
import {
    comparePassword,
    generateToken,
    successResponse,
    errorResponse
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const parsed = loginSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse(parsed.error.errors[0].message);
        }

        const { email, password } = parsed.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return errorResponse('Invalid email or password', 401);
        }

        // Verify password
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            return errorResponse('Invalid email or password', 401);
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return successResponse({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
        });
        return errorResponse(
            process.env.NODE_ENV === 'development'
                ? `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                : 'Internal server error',
            500
        );
    }
}
