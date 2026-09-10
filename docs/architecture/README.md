# OpsHub Architecture

## Purpose

This document describes the implemented high-level architecture of OpsHub after completion of Phase 2.

The repository foundation and relational data layer are complete. The web and API workspaces remain application skeletons; runtime endpoints, authentication, authorization, and user-facing behavior have not started.

## Current High-Level Structure

```text
                         ┌─────────────────────┐
                         │       Users         │
                         └──────────┬──────────┘
                                    │ future UI/API flow
                                    ▼
                         ┌─────────────────────┐
                         │   apps/web          │
                         │   typed skeleton    │
                         └──────────┬──────────┘
                                    │ not yet integrated
                                    ▼
                         ┌─────────────────────┐
                         │   apps/api          │
                         │   typed skeleton    │
                         └──────────┬──────────┘
                                    │ future runtime use
                                    ▼
                         ┌─────────────────────┐
                         │ packages/database   │
                         │ Prisma data layer   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ PostgreSQL 17       │
                         │ Docker Compose      │
                         └─────────────────────┘


          ┌──────────────────────┐    ┌──────────────────────┐
          │   packages/types     │    │   packages/config    │
          │ Shared TypeScript    │    │ Shared configuration │
          │ types/contracts      │    │ and conventions      │
          └──────────────────────┘    └──────────────────────┘
```

The arrows between the application skeletons and the data layer describe the intended system direction, not a completed runtime integration.

## Repository Boundaries

### `apps/web`

The web workspace is reserved for the user-facing application. It currently contains the shared TypeScript, lint, and formatting foundation but no runnable interface.

Its later responsibilities will include:

- User-facing interfaces
- Client-side application behavior
- Interaction with the backend API

### `apps/api`

The API workspace is reserved for backend application behavior. It currently contains the shared TypeScript, lint, and formatting foundation but no HTTP server or endpoints.

Its later responsibilities will include:

- Backend application logic
- API endpoints and contracts
- Authentication and authorization boundaries
- Validated interaction with the data layer and external services

### `packages/database`

The database package is implemented and contains:

- Prisma configuration and relational schema
- Ordered PostgreSQL migrations
- Deterministic development seed
- Representative organization, membership, project, and task queries
- Offset and cursor pagination examples

The Phase 2 model establishes this ownership hierarchy:

```text
Organization
├── Membership
│   └── User
└── Project
    └── Task
```

Database constraints enforce tenant-scoped uniqueness and referential integrity. Application-level tenant authorization remains future work.

### `packages/types`

Shared TypeScript types and contracts used across applications and packages.

This package remains focused on reusable definitions rather than application-specific behavior.

### `packages/config`

Shared configuration and project-wide conventions.

Environment-specific values and secrets must not be committed to the repository.

## Dependency Direction

The implemented package boundaries and intended runtime direction are:

```text
apps/web ───────────────► packages/types
    │
    └───────────────────► packages/config

apps/api ───────────────► packages/types
    │
    ├───────────────────► packages/config
    │
    └─ future runtime ──► packages/database ──► PostgreSQL
```

Shared packages must not depend on application packages:

```text
packages/*  ─X─► apps/*
```

The current application `package.json` files do not yet declare the future runtime dependencies represented above.

## Relational Data Model

Phase 2 implements five primary entities:

1. `Organization`
2. `User`
3. `Membership`
4. `Project`
5. `Task`

The data layer includes UUID primary keys, timestamps, foreign keys with cascading deletes, required uniqueness rules, and indexes validated against representative access patterns.

For the schema, relationships, constraints, indexes, and lifecycle decisions, see [database-design.md](database-design.md).

## Development and Release Architecture

The repository uses:

- `pnpm` for package and workspace management
- Turborepo for task orchestration and caching
- TypeScript strict mode for static checking
- ESLint and Prettier for code and formatting standards
- Docker Compose for local PostgreSQL
- Prisma for schema management and database access
- GitHub Issues and Projects for planning and status
- Protected branches, pull requests, and GitHub Actions for release control

The delivery flow is:

```text
Roadmap → Issue/Project → Branch → Local validation → Pull request
        → CI/review → Protected main → Issue and project completion
```

## Architecture Documentation

- [Database design](database-design.md)
- [Database performance notes](database-performance.md)
- [Database backup and restore](database-backup-restore.md)

## Deferred Architecture Areas

The following areas are not yet implemented:

- Runtime API contracts and request handling
- Authentication and authorization
- Frontend framework and application architecture
- Background jobs and caching
- Application test suites
- Runtime observability
- Production security controls
- Deployment pipelines and infrastructure as code
- Cloud deployment
- Production backup automation and disaster recovery
- AI integration

These concerns remain deliberately outside the completed Phase 1 and Phase 2 scope.

## Architecture Principles

OpsHub favors:

- Clear separation of responsibilities
- Explicit dependency boundaries
- Strong typing
- Secure defaults
- Testability
- Reproducibility
- Observable systems
- Incremental architectural decisions
- Documentation alongside implementation
