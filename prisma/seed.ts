import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const members = [
        { name: "홍길동", role: "ADMIN", handicap: 12.5 },
        { name: "김철수", role: "MEMBER", handicap: 18.2 },
        { name: "이영희", role: "MEMBER", handicap: 24.0 },
        { name: "박지민", role: "MEMBER", handicap: 15.6 },
    ];

    console.log("Seeding members...");
    for (const m of members) {
        await prisma.member.upsert({
            where: { id: m.name }, // This is a hack for seed, usually use a unique field or just create
            update: {},
            create: {
                name: m.name,
                role: m.role,
                handicap: m.handicap,
            },
            // Note: id is cuid by default, so 'where' by name won't work unless name is unique.
            // Adjusting schema for name uniqueness or just using create.
        });
    }
}

// Adjusting since id is CUID and name is not unique in schema. 
// Just using simple create for first seed.
async function seedSimple() {
    console.log("Seeding members (simple)...");
    await prisma.member.createMany({
        data: [
            { name: "박청산", role: "ADMIN", handicap: 10.0 },
            { name: "이병영", role: "MEMBER", handicap: 15.0 },
            { name: "김영일", role: "MEMBER", handicap: 20.0 },
            { name: "조호진", role: "MEMBER", handicap: 25.0 },
            { name: "홍길동", role: "MEMBER", handicap: 12.5 },
            { name: "김철수", role: "MEMBER", handicap: 18.2 },
            { name: "이영희", role: "MEMBER", handicap: 24.0 },
            { name: "박지민", role: "MEMBER", handicap: 15.6 },
        ],
        skipDuplicates: true,
    });
    console.log("Seed complete.");
}

seedSimple()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
