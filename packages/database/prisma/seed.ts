import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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
  users: {
    alice: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    bob: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    carol: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    david: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    eve: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  },
  projects: {
    websiteRedesign: "11111111-1111-4111-8111-111111111112",
    mobileApp: "11111111-1111-4111-8111-111111111113",
    infrastructure: "22222222-2222-4222-8222-222222222223",
    dataPlatform: "22222222-2222-4222-8222-222222222224",
  },
  tasks: {
    homepage: "31111111-1111-4111-8111-111111111111",
    designSystem: "31111111-1111-4111-8111-111111111112",
    apiIntegration: "31111111-1111-4111-8111-111111111113",
    mobileAuth: "31111111-1111-4111-8111-111111111114",
    mobileTesting: "31111111-1111-4111-8111-111111111115",
    mobileRelease: "31111111-1111-4111-8111-111111111116",
    terraform: "42222222-2222-4222-8222-222222222221",
    monitoring: "42222222-2222-4222-8222-222222222222",
    backups: "42222222-2222-4222-8222-222222222223",
    warehouse: "42222222-2222-4222-8222-222222222224",
    pipelines: "42222222-2222-4222-8222-222222222225",
    dashboards: "42222222-2222-4222-8222-222222222226",
  },
} as const;

async function main() {
  console.log("Starting deterministic database seed...");

  await prisma.organization.upsert({
    where: { id: IDS.organizations.acme },
    update: {
      name: "Acme Corporation",
      slug: "acme",
    },
    create: {
      id: IDS.organizations.acme,
      name: "Acme Corporation",
      slug: "acme",
    },
  });

  await prisma.organization.upsert({
    where: { id: IDS.organizations.globex },
    update: {
      name: "Globex Corporation",
      slug: "globex",
    },
    create: {
      id: IDS.organizations.globex,
      name: "Globex Corporation",
      slug: "globex",
    },
  });

  const users = [
    {
      id: IDS.users.alice,
      email: "alice.johnson@example.com",
      name: "Alice Johnson",
    },
    {
      id: IDS.users.bob,
      email: "bob.smith@example.com",
      name: "Bob Smith",
    },
    {
      id: IDS.users.carol,
      email: "carol.williams@example.com",
      name: "Carol Williams",
    },
    {
      id: IDS.users.david,
      email: "david.brown@example.com",
      name: "David Brown",
    },
    {
      id: IDS.users.eve,
      email: "eve.davis@example.com",
      name: "Eve Davis",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        name: user.name,
      },
      create: user,
    });
  }

  const memberships = [
    {
      organizationId: IDS.organizations.acme,
      userId: IDS.users.alice,
      role: "OWNER" as const,
    },
    {
      organizationId: IDS.organizations.acme,
      userId: IDS.users.bob,
      role: "ADMIN" as const,
    },
    {
      organizationId: IDS.organizations.acme,
      userId: IDS.users.carol,
      role: "MEMBER" as const,
    },
    {
      organizationId: IDS.organizations.globex,
      userId: IDS.users.alice,
      role: "MEMBER" as const,
    },
    {
      organizationId: IDS.organizations.globex,
      userId: IDS.users.david,
      role: "OWNER" as const,
    },
    {
      organizationId: IDS.organizations.globex,
      userId: IDS.users.eve,
      role: "MEMBER" as const,
    },
  ];

  for (const membership of memberships) {
    await prisma.membership.upsert({
      where: {
        organizationId_userId: {
          organizationId: membership.organizationId,
          userId: membership.userId,
        },
      },
      update: {
        role: membership.role,
      },
      create: membership,
    });
  }

  const projects = [
    {
      id: IDS.projects.websiteRedesign,
      organizationId: IDS.organizations.acme,
      name: "Website Redesign",
      slug: "website-redesign",
      description: "Redesign the public Acme corporate website.",
    },
    {
      id: IDS.projects.mobileApp,
      organizationId: IDS.organizations.acme,
      name: "Mobile App",
      slug: "mobile-app",
      description: "Build the next generation Acme mobile application.",
    },
    {
      id: IDS.projects.infrastructure,
      organizationId: IDS.organizations.globex,
      name: "Infrastructure",
      slug: "infrastructure",
      description: "Modernize Globex cloud infrastructure.",
    },
    {
      id: IDS.projects.dataPlatform,
      organizationId: IDS.organizations.globex,
      name: "Data Platform",
      slug: "data-platform",
      description: "Build the Globex analytics and data platform.",
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: {
        id: project.id,
      },
      update: {
        organizationId: project.organizationId,
        name: project.name,
        slug: project.slug,
        description: project.description,
      },
      create: project,
    });
  }

  const tasks = [
    {
      id: IDS.tasks.homepage,
      projectId: IDS.projects.websiteRedesign,
      title: "Implement homepage layout",
      description: "Create the responsive homepage layout.",
      status: "IN_PROGRESS" as const,
    },
    {
      id: IDS.tasks.designSystem,
      projectId: IDS.projects.websiteRedesign,
      title: "Create design system",
      description: "Define reusable colors, typography, and components.",
      status: "DONE" as const,
    },
    {
      id: IDS.tasks.apiIntegration,
      projectId: IDS.projects.websiteRedesign,
      title: "Integrate CMS API",
      description: "Connect the website to the content management API.",
      status: "TODO" as const,
    },
    {
      id: IDS.tasks.mobileAuth,
      projectId: IDS.projects.mobileApp,
      title: "Implement authentication",
      description: "Implement mobile authentication and session handling.",
      status: "DONE" as const,
    },
    {
      id: IDS.tasks.mobileTesting,
      projectId: IDS.projects.mobileApp,
      title: "Add integration tests",
      description: "Add automated integration coverage for the mobile app.",
      status: "IN_PROGRESS" as const,
    },
    {
      id: IDS.tasks.mobileRelease,
      projectId: IDS.projects.mobileApp,
      title: "Prepare release build",
      description: "Prepare the first production release build.",
      status: "TODO" as const,
    },
    {
      id: IDS.tasks.terraform,
      projectId: IDS.projects.infrastructure,
      title: "Define Terraform modules",
      description: "Create reusable infrastructure modules.",
      status: "IN_PROGRESS" as const,
    },
    {
      id: IDS.tasks.monitoring,
      projectId: IDS.projects.infrastructure,
      title: "Configure monitoring",
      description: "Configure infrastructure monitoring and alerts.",
      status: "TODO" as const,
    },
    {
      id: IDS.tasks.backups,
      projectId: IDS.projects.infrastructure,
      title: "Implement database backups",
      description: "Automate scheduled PostgreSQL backups.",
      status: "DONE" as const,
    },
    {
      id: IDS.tasks.warehouse,
      projectId: IDS.projects.dataPlatform,
      title: "Design warehouse schema",
      description: "Design the analytical warehouse schema.",
      status: "DONE" as const,
    },
    {
      id: IDS.tasks.pipelines,
      projectId: IDS.projects.dataPlatform,
      title: "Build ingestion pipelines",
      description: "Implement the initial data ingestion pipelines.",
      status: "IN_PROGRESS" as const,
    },
    {
      id: IDS.tasks.dashboards,
      projectId: IDS.projects.dataPlatform,
      title: "Create analytics dashboards",
      description: "Create the first operational analytics dashboards.",
      status: "TODO" as const,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: {
        id: task.id,
      },
      update: {
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
      },
      create: task,
    });
  }

  console.log("Seed completed successfully.");
  console.log("Organizations: 2");
  console.log("Users:         5");
  console.log("Memberships:   6");
  console.log("Projects:      4");
  console.log("Tasks:        12");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
