import "dotenv/config";

// Prisma configuration
// Note: This file is for custom Prisma setup and environment configuration
// The actual schema is defined in prisma/schema.prisma

export const prismaConfig = {
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
};

export default prismaConfig;
