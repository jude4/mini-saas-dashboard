import { Status } from '@prisma/client';

export interface Project {
    id: string;
    name: string;
    description: string | null;
    status: Status;
    deadline: Date;
    teamMember: string;
    budget: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    user: Omit<User, 'createdAt' | 'updatedAt'>;
    token: string;
}

export interface ProjectsResponse {
    projects: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    success: false;
    error: string;
}

export interface ApiSuccess<T> {
    success: true;
    data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
