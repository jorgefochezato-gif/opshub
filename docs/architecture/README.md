# OpsHub Architecture

## Purpose

This document describes the initial high-level architecture of OpsHub.

The architecture will evolve throughout the project's engineering phases. Phase 1 establishes the repository boundaries and dependency direction without prematurely defining implementation details for later phases.

## High-Level Structure

```text
                         ┌─────────────────────┐
                         │       Users         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Web Application  │
                         │    apps/web         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API Application  │
                         │    apps/api         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Data Layer      │
                         │   Defined later     │
                         └─────────────────────┘


          ┌──────────────────────┐    ┌──────────────────────┐
          │   packages/types     │    │   packages/config    │
          │ Shared TypeScript    │    │ Shared configuration │
          │ types/contracts      │    │ and conventions      │
          └──────────┬───────────┘    └──────────┬───────────┘
                     │                           │
                     └─────────────┬─────────────┘
                                   │
                     Consumed by applications
```

## Repository Boundaries

### `apps/web`

The web application is responsible for:

- User-facing interfaces
- Client-side application behavior
- Interaction with the backend API

The detailed web framework and application architecture will be established in a later phase.

### `apps/api`

The API application is responsible for:

- Backend application logic
- API endpoints
- Authentication and authorization boundaries
- Interaction with persistence and external services

The detailed API architecture will be established in later phases.

### `packages/types`

Shared TypeScript types and contracts used across applications and packages.

This package should remain focused on reusable type definitions rather than application-specific behavior.

### `packages/config`

Shared configuration and project-wide configuration conventions.

Environment-specific values should not be committed to the repository.

## Dependency Direction

The initial dependency direction is:

```text
apps/web ───────► packages/types
    │
    └───────────► packages/config

apps/api ───────► packages/types
    │
    └───────────► packages/config
```

Shared packages should not depend on application packages.

In particular:

```text
packages/*  ─X─► apps/*
```

Applications may consume shared packages, but shared packages should remain independent of application-specific implementation details.

## Monorepo Tooling

The repository uses:

- `pnpm` for package management and workspace management
- `Turborepo` for task orchestration and caching
- `TypeScript` for static type checking
- `ESLint` for code quality and consistency
- `Prettier` for formatting

Common repository-level commands are defined in the root `package.json`.

## Development Workflow

The intended development workflow is:

```text
Developer
    │
    ▼
Feature Branch
    │
    ▼
Local Development
    │
    ├── pnpm lint
    ├── pnpm typecheck
    └── pnpm format:check
    │
    ▼
Pull Request
    │
    ▼
CI Validation
    │
    ▼
Code Review
    │
    ▼
Protected main
```

## Future Architecture Areas

Later phases will define and document:

- Database architecture
- Multi-tenant data isolation
- Authentication and authorization
- API contracts
- Frontend architecture
- Background jobs
- Caching
- Observability
- Security controls
- CI/CD
- Infrastructure as code
- Cloud deployment
- Reliability and disaster recovery
- AI integration

These concerns are intentionally not finalized in Phase 1.

## Architecture Principles

OpsHub will favor:

- Clear separation of responsibilities
- Explicit dependency boundaries
- Strong typing
- Secure defaults
- Testability
- Reproducibility
- Observable systems
- Incremental architectural decisions
- Documentation alongside implementation
