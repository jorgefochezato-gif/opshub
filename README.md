# OpsHub

Production-style multi-tenant SaaS engineering project.

## Purpose

OpsHub is a learning and portfolio project designed to exercise production-oriented software engineering practices across:

- Full-stack development
- Backend engineering
- Database design
- Testing
- Security
- CI/CD
- Infrastructure as code
- Cloud deployment
- Observability
- Reliability engineering
- AI integration

The project is developed incrementally through defined engineering phases.

## Engineering Goals

The project will be developed using production-oriented engineering practices:

- GitHub pull requests
- Protected `main` branch
- Automated testing
- CI/CD
- Docker
- Infrastructure as code
- Security scanning
- Automated deployments

The goal is not only to build a working application, but also to demonstrate a disciplined software engineering workflow.

---

## Current Status

The project is currently in:

**Phase 1 — Repository & Development Foundation**

The foundation currently includes:

- GitHub repository
- Protected `main` branch
- Git feature-branch workflow
- pnpm workspace
- Turborepo task orchestration
- TypeScript strict mode
- ESLint
- Prettier
- Initial application and shared-package structure
- Environment variable template
- Repository-level development scripts

---

## Repository Structure

```text
opshub/
│
├── apps/
│   ├── api/                    # Backend application
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # Web application
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── config/                 # Shared configuration
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── types/                  # Shared TypeScript types
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── docs/                       # Project documentation
├── tests/                      # Cross-project tests
│
├── .env.example                # Environment variable template
├── .editorconfig               # Editor configuration
├── .gitignore                  # Git ignore rules
├── .prettierignore             # Prettier exclusions
├── eslint.config.mjs           # ESLint configuration
├── prettier.config.mjs         # Prettier configuration
├── pnpm-workspace.yaml         # pnpm workspace definition
├── tsconfig.base.json          # Shared TypeScript configuration
├── turbo.json                  # Turborepo task configuration
├── package.json                # Root project configuration
└── pnpm-lock.yaml              # Dependency lockfile
```

---

## Architecture

OpsHub is organized as a monorepo.

At the current foundation stage, the repository contains two applications and shared packages:

```text
                    ┌─────────────────────┐
                    │       GitHub        │
                    │  Protected main     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      OpsHub         │
                    │      Monorepo       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │  apps/web   │  │  apps/api   │  │  packages/  │
       │             │  │             │  │             │
       │ Web client  │  │ Backend API │  │ Shared code │
       └─────────────┘  └─────────────┘  └─────────────┘
                                              │
                                      ┌───────┴───────┐
                                      ▼               ▼
                               ┌────────────┐  ┌────────────┐
                               │   config   │  │   types    │
                               └────────────┘  └────────────┘
```

A more detailed architecture will be maintained under:

```text
docs/architecture/
```

as the system evolves.

---

## Prerequisites

The current development environment requires:

- Node.js 22+
- pnpm 10+

Verify the installed versions:

```bash
node --version
pnpm --version
```

The repository pins the package-manager version through `package.json`.

The current expected versions are:

```text
Node.js: 22+
pnpm:    10.15.0
```

---

## Getting Started

### 1. Clone the repository

Clone the repository and enter the project directory:

```bash
git clone <repository-url>
cd opshub
```

### 2. Verify the environment

```bash
node --version
pnpm --version
```

### 3. Install dependencies

From the repository root:

```bash
pnpm install
```

The `pnpm-lock.yaml` file ensures that dependency resolution is reproducible.

### 4. Verify the workspace

List the packages recognized by pnpm:

```bash
pnpm -r list --depth -1
```

List the packages recognized by Turborepo:

```bash
pnpm turbo ls
```

The workspace should contain:

```text
@opshub/api
@opshub/web
@opshub/config
@opshub/types
```

---

## Environment Variables

Environment-specific values must not be committed to Git.

The repository provides:

```text
.env.example
```

as the template for required environment variables.

Create a local environment file when environment variables are required:

```bash
cp .env.example .env
```

Never commit `.env` or other files containing real secrets.

Verify that environment files are ignored:

```bash
git check-ignore -v .env
```

The expected result should indicate that `.env` is ignored by `.gitignore`.

---

## Development Commands

All project-level commands should be executed from the repository root.

### Install dependencies

```bash
pnpm install
```

### Run development tasks

```bash
pnpm dev
```

### Run linting

```bash
pnpm lint
```

### Run TypeScript type checking

```bash
pnpm typecheck
```

### Format the repository

```bash
pnpm format
```

### Check formatting without modifying files

```bash
pnpm format:check
```

### Run the build

```bash
pnpm build
```

---

## Turborepo

OpsHub uses Turborepo to orchestrate tasks across the monorepo.

For example:

```bash
pnpm turbo run lint
```

runs the `lint` task in the applicable workspace packages.

To inspect the packages discovered by Turborepo:

```bash
pnpm turbo ls
```

To preview the tasks that Turborepo would execute:

```bash
pnpm turbo run typecheck --dry
```

The root `turbo.json` defines the task graph and caching behavior.

---

## TypeScript

The repository uses a shared TypeScript configuration:

```text
tsconfig.base.json
```

Individual applications and packages extend the shared configuration.

TypeScript is configured using strict type checking and additional safety-oriented compiler options.

Run type checking across the workspace:

```bash
pnpm typecheck
```

A successful result should report all workspace typecheck tasks as successful.

---

## ESLint

ESLint provides the project's JavaScript and TypeScript linting rules.

The repository uses a single root configuration:

```text
eslint.config.mjs
```

Run ESLint across the repository:

```bash
pnpm exec eslint .
```

Or run the workspace lint task:

```bash
pnpm lint
```

Linting should complete without errors.

---

## Prettier

Prettier provides the project's formatting standard.

The repository uses:

```text
prettier.config.mjs
```

Format the repository:

```bash
pnpm format
```

Check formatting without changing files:

```bash
pnpm format:check
```

Formatting must pass before a pull request is considered ready for merge.

---

## Git Workflow

The `main` branch is protected.

Development should be performed using feature branches.

The general workflow is:

```text
main
 │
 └── feature branch
       │
       ├── make changes
       ├── run validation
       ├── commit
       ├── push
       └── open pull request
                    │
                    ▼
             CI / review checks
                    │
                    ▼
              merge into main
```

### Create a feature branch

Create a branch from an up-to-date `main` branch:

```bash
git switch main
git pull
git switch -c feat/<short-description>
```

Examples:

```text
feat/project-foundation
feat/database-schema
feat/authentication
feat/user-management
fix/api-validation
chore/update-dependencies
docs/update-architecture
```

### Check repository status

```bash
git status
```

### Review changes

```bash
git diff
```

For staged changes:

```bash
git diff --cached
```

### Stage changes

```bash
git add <file>
```

Or stage all intended changes:

```bash
git add .
```

Always review the staged changes before committing:

```bash
git diff --cached
```

### Commit changes

Commits should describe the purpose of the change.

Examples:

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: validate tenant identifier"
git commit -m "chore: update dependencies"
git commit -m "docs: update architecture documentation"
```

### Push a feature branch

```bash
git push -u origin <branch-name>
```

### Create a pull request

Open a pull request from the feature branch into `main`.

The pull request should include:

- What changed
- Why the change was necessary
- How it was tested
- Any relevant architectural considerations
- Any known limitations

---

## Validation Before a Pull Request

Before opening a pull request, run the project validation commands from the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm format:check
```

If a build task is configured for the affected packages, also run:

```bash
pnpm build
```

Check the working tree:

```bash
git status
```

Review the staged changes:

```bash
git diff --cached
```

Check for whitespace errors:

```bash
git diff --cached --check
```

No secret values should be committed.

---

## Pull Request Rules

Pull requests should:

1. Target `main`.
2. Use a descriptive title.
3. Explain the purpose of the change.
4. Include testing or validation performed.
5. Pass required CI checks.
6. Receive the required review.
7. Avoid unrelated changes.
8. Keep commits and changes reasonably focused.

The protected `main` branch should only receive changes through the documented pull-request workflow.

---

## Commit Conventions

OpsHub uses conventional-style commit prefixes.

Common prefixes include:

```text
feat:     New functionality
fix:      Bug fix
chore:    Maintenance or tooling
docs:     Documentation
refactor: Code restructuring without behavior change
test:     Tests
build:    Build-system changes
ci:       CI/CD changes
security: Security-related changes
```

Examples:

```text
feat: add tenant management
fix: handle invalid API request
chore: configure TypeScript
docs: update development workflow
test: add authentication tests
ci: add pull request checks
```

---

# Phase 1: Repository & Development Foundation

## Objective

Establish a reproducible local development environment and disciplined Git workflow.

## Primary Technologies

- Git
- GitHub
- pnpm
- Turborepo
- TypeScript
- ESLint
- Prettier

## Execution Checklist

- [x] Create the GitHub repository and protect the main branch.
- [x] Initialize the pnpm monorepo and Turborepo workspace.
- [x] Create `apps/web`, `apps/api`, and the initial shared packages.
- [x] Configure TypeScript strict mode and shared tsconfig.
- [x] Configure ESLint and Prettier with a single project standard.
- [x] Create `.env.example` and document required local variables.
- [x] Add a root README with architecture, setup, commands, and contribution rules.
- [ ] Create GitHub issue labels and a project board for the 20 phases.
- [ ] Create the first pull request and merge it through the documented workflow.

## Phase 1 Deliverables

- Working monorepo with one-command dependency installation.
- Root-level development and validation commands.
- Initial application and shared-package structure.
- Initial architecture documentation.
- `CONTRIBUTING.md`.
- Branch and pull-request conventions.
- CI-ready repository skeleton.
- First green pull request merged through the protected `main` branch.

---

## Definition of Done / Release Gate

Phase 1 is complete when:

- [ ] A fresh clone works on a clean machine following the README instructions.
- [ ] Dependencies install successfully with `pnpm install`.
- [ ] Lint succeeds from the repository root.
- [ ] TypeScript type checking succeeds from the repository root.
- [ ] Formatting checks succeed from the repository root.
- [ ] Build succeeds where applicable.
- [ ] No secret values are committed.
- [ ] `main` is protected.
- [ ] Required pull-request checks pass.
- [ ] The first pull request is successfully merged through the documented workflow.

---

## Project Development Philosophy

OpsHub is intentionally being built incrementally.

Each phase should produce a working, verifiable state rather than accumulating a large amount of untested infrastructure.

The preferred workflow is:

```text
Plan
  ↓
Implement
  ↓
Validate locally
  ↓
Commit
  ↓
Push feature branch
  ↓
Pull request
  ↓
CI validation
  ↓
Code review
  ↓
Merge
  ↓
Update project documentation
```

The project prioritizes:

- Reproducibility
- Simplicity
- Security
- Testability
- Observability
- Maintainability
- Automation
- Clear documentation
- Incremental delivery

---

## License

This project is currently a personal learning and portfolio project.

License information will be added when the project's distribution model is finalized.
