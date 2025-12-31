const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const teamMembers = [
    'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Ross',
    'Edward Chen', 'Fiona Williams', 'George Miller', 'Hannah Davis',
];

const projectNames = [
    'Website Redesign', 'Mobile App Development', 'Cloud Migration',
    'Data Analytics Platform', 'Customer Portal', 'API Integration',
    'Security Audit', 'E-commerce Platform', 'CRM Implementation',
    'Marketing Automation', 'DevOps Pipeline', 'Machine Learning Model',
];

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomBudget() {
    return Math.round((Math.random() * 95000 + 5000) / 100) * 100;
}

async function main() {
    console.log('🌱 Starting database seed (JS)...');

    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

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

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
        },
    });
    console.log('✅ Created admin user:', adminUser.email);

    const statuses = ['ACTIVE', 'ON_HOLD', 'COMPLETED'];
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const sixMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

    const projects = [];
    for (let i = 0; i < 12; i++) {
        const status = statuses[i % 3];
        const deadline = status === 'COMPLETED'
            ? randomDate(threeMonthsAgo, now)
            : randomDate(now, sixMonthsFromNow);

        projects.push({
            name: projectNames[i],
            description: `This is the ${projectNames[i].toLowerCase()} project. It involves multiple phases and deliverables.`,
            status,
            deadline,
            teamMember: randomItem(teamMembers),
            budget: randomBudget(),
            userId: i < 8 ? demoUser.id : adminUser.id,
        });
    }

    await prisma.project.createMany({ data: projects });
    console.log(`✅ Created ${projects.length} sample projects`);
    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
