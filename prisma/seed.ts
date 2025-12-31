import { PrismaClient, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Team members for sample data
const teamMembers = [
    'Alice Johnson',
    'Bob Smith',
    'Charlie Brown',
    'Diana Ross',
    'Edward Chen',
    'Fiona Williams',
    'George Miller',
    'Hannah Davis',
];

// Project names for sample data
const projectNames = [
    'Website Redesign',
    'Mobile App Development',
    'Cloud Migration',
    'Data Analytics Platform',
    'Customer Portal',
    'API Integration',
    'Security Audit',
    'E-commerce Platform',
    'CRM Implementation',
    'Marketing Automation',
    'DevOps Pipeline',
    'Machine Learning Model',
];

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to pick random item from array
function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate random budget
function randomBudget(): number {
    return Math.round((Math.random() * 95000 + 5000) / 100) * 100; // $5,000 - $100,000 in $100 increments
}

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 12);

    const demoUser = await prisma.user.create({
        data: {
            email: 'demo@example.com',
            password: hashedPassword,
            name: 'Demo User',
            role: 'USER',
        },
    });

    console.log('✅ Created demo user:', demoUser.email);

    // Create admin user
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Generate projects
    const statuses: Status[] = ['ACTIVE', 'ON_HOLD', 'COMPLETED'];
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

    const projects = [];

    for (let i = 0; i < 12; i++) {
        const status = statuses[i % 3]; // Distribute evenly
        const deadline = status === 'COMPLETED'
            ? randomDate(threeMonthsAgo, now) // Past deadline for completed
            : randomDate(now, sixMonthsFromNow); // Future for active/on-hold

        projects.push({
            name: projectNames[i],
            description: `This is the ${projectNames[i].toLowerCase()} project. It involves multiple phases and deliverables.`,
            status,
            deadline,
            teamMember: randomItem(teamMembers),
            budget: randomBudget(),
            userId: i < 8 ? demoUser.id : adminUser.id, // 8 for demo, 4 for admin
        });
    }

    await prisma.project.createMany({
        data: projects,
    });

    console.log(`✅ Created ${projects.length} sample projects`);
    console.log('');
    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('Demo credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Admin credentials:');
    console.log('  Email: admin@example.com');
    console.log('  Password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
