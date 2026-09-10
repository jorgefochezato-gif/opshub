# OpsHub

Production-style multi-tenant SaaS engineering project built incrementally through a 20-phase execution roadmap.

## Purpose

OpsHub is a learning and portfolio project for practicing production-oriented software engineering across full-stack development, backend engineering, database design, testing, security, CI/CD, infrastructure, observability, reliability, and AI integration.

The project emphasizes both working software and a disciplined delivery process: each meaningful change is tracked in GitHub, developed on a branch, validated automatically, reviewed in a pull request, and merged through the protected `main` branch.

## Current Status

**Phase 2 — Relational Data Model & Database Foundation is complete. Phase 3 has not started.**

Released work:

| Phase                                                 | Status | Tracking                                                          | Release                                                      |
| ----------------------------------------------------- | ------ | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| Phase 1 — Repository & Development Foundation         | Done   | [Issue #3](https://github.com/jorgefochezato-gif/opshub/issues/3) | [PR #4](https://github.com/jorgefochezato-gif/opshub/pull/4) |
| Phase 2 — Relational Data Model & Database Foundation | Done   | [Issue #5](https://github.com/jorgefochezato-gif/opshub/issues/5) | [PR #6](https://github.com/jorgefochezato-gif/opshub/pull/6) |

The delivery roadmap is tracked in the [OpsHub Engineering Roadmap project](https://github.com/users/jorgefochezato-gif/projects/1).

### Implemented

- Protected `main` branch and pull-request workflow
- pnpm monorepo with Turborepo orchestration
- Strict TypeScript, ESLint, and Prettier standards
- GitHub Actions quality gate for pull requests and pushes to `main`
- PostgreSQL 17 local service through Docker Compose
- Prisma 7 relational schema and ordered migrations
- Multi-tenant organization, user, membership, project, and task model
- Database-enforced foreign keys, uniqueness constraints, timestamps, and access-pattern indexes
- Deterministic, repeatable development seed
- Representative Prisma queries with offset and cursor pagination
- Measured query-plan analysis and an optimized task-pagination index
- Documented and validated local backup-and-restore workflow

### Not Yet Implemented

The `apps/api` and `apps/web` workspaces are currently typed application skeletons. Runtime API endpoints, authentication, authorization, request validation, the web interface, and later production infrastructure belong to subsequent roadmap phases and are not represented as complete.

## Repository Structure

```text
opshub/
├── .github/
│   └── workflows/
│       └── ci.yml                         # Pull-request and main quality gate
├── apps/
│   ├── api/                               # Backend application skeleton
│   └── web/                               # Web application skeleton
├── packages/
│   ├── config/                            # Shared configuration package
│   ├── database/                          # Prisma schema, migrations, seed, and queries
│   └── types/                             # Shared TypeScript types
├── docs/
│   └── architecture/                      # Architecture and database documentation
├── tests/                                 # Cross-project test location
├── .env.example                           # Local environment template
├── docker-compose.yml                     # Local PostgreSQL service
├── eslint.config.mjs                      # Repository ESLint configuration
├── prettier.config.mjs                    # Repository formatting standard
├── pnpm-workspace.yaml                    # Workspace definition
├── tsconfig.base.json                     # Shared strict TypeScript configuration
├── turbo.json                             # Task graph and caching rules
├── CONTRIBUTING.md                        # Contribution and release workflow
├── package.json                           # Root validation commands
└── pnpm-lock.yaml                         # Reproducible dependency lockfile
```

## Architecture

OpsHub is organized as a monorepo with application workspaces and reusable packages. The relational data foundation is implemented, but it is not yet connected to runtime API endpoints.

```text
┌──────────────────────────────────────────────────────────┐
│                     OpsHub monorepo                      │
├───────────────────────┬──────────────────────────────────┤
│ Applications          │ Shared packages                  │
│                       │                                  │
│ apps/web              │ packages/types                  │
│ apps/api              │ packages/config                 │
│                       │ packages/database               │
└───────────────────────┴─────────────────┬────────────────┘
                                          │ Prisma
                                          ▼
                               ┌─────────────────────┐
                               │   PostgreSQL 17     │
                               │   Docker Compose    │
                               └─────────────────────┘
```

See [docs/architecture/README.md](docs/architecture/README.md) for the current system boundaries and [docs/architecture/database-design.md](docs/architecture/database-design.md) for the Phase 2 relational model.

## Prerequisites

- Node.js 22
- pnpm 10.15.0
- Docker with Docker Compose
- Git

Verify the main tools:

```bash
node --version
pnpm --version
docker --version
docker compose version
```

The repository pins the pnpm version in `package.json`. CI uses Node.js 22 and PostgreSQL 17.

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/jorgefochezato-gif/opshub.git
cd opshub
pnpm install
```

### 2. Configure the local environment

```bash
cp .env.example .env
```

The development template defines:

```text
DATABASE_URL="postgresql://opshub:opshub_dev@localhost:5432/opshub?schema=public"
```

The credentials are for the local Docker Compose service only. Never commit real secrets or a populated environment file.

### 3. Start PostgreSQL

```bash
docker compose up -d postgres
docker compose ps
```

### 4. Generate the Prisma client

```bash
pnpm --filter @opshub/database db:generate
```

### 5. Apply the committed migrations

```bash
pnpm --filter @opshub/database exec prisma migrate deploy
pnpm --filter @opshub/database exec prisma migrate status
```

The current migration history creates the relational model and the ordered task-pagination index.

### 6. Seed deterministic development data

```bash
pnpm --filter @opshub/database db:seed
```

Expected records:

```text
Organizations: 2
Users:         5
Memberships:   6
Projects:      4
Tasks:        12
```

The seed is idempotent and can be run repeatedly without creating duplicate records.

### 7. Run representative database queries

```bash
pnpm --filter @opshub/database db:queries
```

The query runner demonstrates organization-scoped lookups, membership and project retrieval, task filtering, and offset and cursor pagination.

## Available Commands

Run repository-wide quality checks from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
```

Format tracked source and documentation files:

```bash
pnpm format
```

Database commands:

```bash
pnpm --filter @opshub/database db:generate
pnpm --filter @opshub/database db:migrate
pnpm --filter @opshub/database db:seed
pnpm --filter @opshub/database db:queries
pnpm --filter @opshub/database db:studio
```

`db:migrate` is intended for creating and applying migrations during schema development. Use `prisma migrate deploy` when validating the committed migration history on a clean database or in CI.

There is currently no root `dev`, `build`, or `test` script. Those commands will be added only when the applicable workspaces have runnable implementations or test suites.

## Continuous Integration

GitHub Actions runs the `Quality gate` job for every pull request and every push to `main`. It:

1. Installs dependencies from the lockfile.
2. Generates the Prisma client.
3. Checks formatting.
4. Runs linting.
5. Runs TypeScript type checking.
6. Applies migrations to a clean PostgreSQL 17 database.
7. Verifies migration status.
8. Runs the deterministic seed twice to verify repeatability.

The workflow is defined in [.github/workflows/ci.yml](.github/workflows/ci.yml).

## GitHub Delivery Workflow

Meaningful work follows this sequence:

```text
Roadmap
  ↓
GitHub issue added to the project
  ↓
Status: In Progress
  ↓
Focused branch and local validation
  ↓
Pull request linked to the issue
  ↓
Status: In Review
  ↓
Required CI and review
  ↓
Merge through protected main
  ↓
Issue closed and project status: Done
  ↓
Local main synchronized and temporary resources removed
```

Do not bypass the issue, project, pull-request, or release process because the project currently has one developer. Detailed conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [Architecture overview](docs/architecture/README.md)
- [Relational database design](docs/architecture/database-design.md)
- [Database performance findings](docs/architecture/database-performance.md)
- [Local database backup and restore](docs/architecture/database-backup-restore.md)
- [Contribution and release workflow](CONTRIBUTING.md)

## Development Principles

OpsHub prioritizes:

- Reproducibility
- Simplicity
- Security
- Testability
- Observability
- Maintainability
- Automation
- Clear documentation
- Incremental delivery

Each phase must produce a working, verifiable state and complete the repository release process before the next phase begins.

## License

This project is currently a personal learning and portfolio project. License information will be added when the distribution model is finalized.
