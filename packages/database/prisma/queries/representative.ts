import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TaskStatus } from "@prisma/client";

config({
  path: resolve(process.cwd(), "../../.env"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const IDS = {
  organizations: {
    acme: "11111111-1111-4111-8111-111111111111",
    globex: "22222222-2222-4222-8222-222222222222",
  },
};

async function findProjectByOrganizationAndSlug(organizationId: string, slug: string) {
  return prisma.project.findUnique({
    where: {
      organizationId_slug: {
        organizationId,
        slug,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

async function listProjectsByOrganization(organizationId: string) {
  return prisma.project.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

async function getProjectDetail(projectId: string) {
  return prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      organizationId: true,
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

async function listTasksByProjectAndStatus(projectId: string, status: TaskStatus) {
  return prisma.task.findMany({
    where: {
      projectId,
      status,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function listTasksByOrganization(organizationId: string) {
  return prisma.task.findMany({
    where: {
      project: {
        organizationId,
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      project: {
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function listTasksWithOffsetPagination(projectId: string, page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;

  return prisma.task.findMany({
    where: {
      projectId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    skip,
    take: pageSize,
  });
}

async function listTasksWithCursorPagination(projectId: string, cursorId?: string, pageSize = 2) {
  return prisma.task.findMany({
    where: {
      projectId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    ...(cursorId
      ? {
          cursor: {
            id: cursorId,
          },
          skip: 1,
        }
      : {}),
    take: pageSize,
  });
}

async function main() {
  console.log("=== Representative Database Queries ===");

  const projects = await listProjectsByOrganization(IDS.organizations.acme);

  console.log("\n1. Projects by organization");
  console.log(`   Result count: ${projects.length}`);
  console.table(
    projects.map((project) => ({
      name: project.name,
      slug: project.slug,
    })),
  );

  const mobileProject = await findProjectByOrganizationAndSlug(
    IDS.organizations.acme,
    "mobile-app",
  );

  if (!mobileProject) {
    throw new Error("Expected Acme mobile-app project was not found");
  }

  const project = await getProjectDetail(mobileProject.id);

  console.log("\n2. Project detail with tasks");
  console.log(`   Project: ${project?.name}`);
  console.log(`   Task count: ${project?.tasks.length ?? 0}`);

  const inProgressTasks = await listTasksByProjectAndStatus(
    mobileProject.id,
    TaskStatus.IN_PROGRESS,
  );

  console.log("\n3. Tasks filtered by project and status");
  console.log(`   Status: IN_PROGRESS`);
  console.log(`   Result count: ${inProgressTasks.length}`);
  console.table(
    inProgressTasks.map((task) => ({
      title: task.title,
      status: task.status,
    })),
  );

  const organizationTasks = await listTasksByOrganization(IDS.organizations.acme);

  console.log("\n4. Tasks belonging to organization");
  console.log(`   Result count: ${organizationTasks.length}`);
  console.table(
    organizationTasks.map((task) => ({
      title: task.title,
      status: task.status,
      project: task.project.name,
    })),
  );

  const offsetPage = await listTasksWithOffsetPagination(mobileProject.id, 1, 2);

  console.log("\n5. Offset pagination");
  console.log(`   Page: 1`);
  console.log(`   Page size: 2`);
  console.log(`   Result count: ${offsetPage.length}`);
  console.table(
    offsetPage.map((task) => ({
      title: task.title,
      status: task.status,
    })),
  );

  const firstCursorPage = await listTasksWithCursorPagination(mobileProject.id, undefined, 2);

  console.log("\n6. Cursor pagination — first page");
  console.log(`   Page size: 2`);
  console.log(`   Result count: ${firstCursorPage.length}`);
  console.table(
    firstCursorPage.map((task) => ({
      title: task.title,
      status: task.status,
      id: task.id,
    })),
  );

  const nextCursor = firstCursorPage.at(-1)?.id;

  if (nextCursor) {
    const secondCursorPage = await listTasksWithCursorPagination(mobileProject.id, nextCursor, 2);

    console.log("\n7. Cursor pagination — next page");
    console.log(`   Result count: ${secondCursorPage.length}`);
    console.table(
      secondCursorPage.map((task) => ({
        title: task.title,
        status: task.status,
        id: task.id,
      })),
    );
  }

  console.log("\nRepresentative queries completed successfully.");
}

main()
  .catch((error) => {
    console.error("Representative query execution failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
