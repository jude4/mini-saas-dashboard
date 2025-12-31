import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import {
    hashPassword,
    generateToken,
    successResponse,
    errorResponse
} from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const parsed = registerSchema.safeParse(body);
        if (!parsed.success) {
            return errorResponse(parsed.error.errors[0].message);
        }

        const { email, password, name } = parsed.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return errorResponse('Email already registered', 400);
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

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
        }, 201);
    } catch (error) {
        console.error('Registration error:', error);
        return errorResponse('Internal server error', 500);
    }
}
