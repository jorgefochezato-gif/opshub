# Contributing to OpsHub

OpsHub follows a disciplined issue, project, branch, pull-request, and release workflow designed to resemble a production engineering environment.

## Development Environment

The current repository uses:

- Node.js 22
- pnpm 10.15.0
- Turborepo
- TypeScript
- ESLint and Prettier
- PostgreSQL 17 through Docker Compose
- Prisma 7

Install dependencies from the repository root:

```bash
pnpm install
```

Database setup and validation commands are documented in [README.md](README.md).

## Work Tracking

Meaningful work starts from a GitHub issue and is added to the [OpsHub Engineering Roadmap project](https://github.com/users/jorgefochezato-gif/projects/1).

Before implementation:

1. Confirm the work belongs to the current roadmap phase.
2. Create or select an issue with a clear outcome, checklist, deliverables, and definition of done.
3. Add the issue to the project and set its Phase, Priority, Workstream, and Effort fields.
4. Set the project status to `In Progress` when implementation begins.

Do not create implementation or tracking work for the next phase until the current phase has completed its release gate.

## Branching Strategy

The `main` branch is protected and must not be used for direct development.

Create a focused branch from the latest `main`:

```bash
git switch main
git pull --ff-only origin main
git switch -c <type>/<short-description>
```

## Branch Naming

Use the following prefixes:

- `feat/` — new functionality
- `fix/` — bug fixes
- `refactor/` — code restructuring
- `docs/` — documentation
- `test/` — tests
- `chore/` — maintenance and tooling
- `ci/` — continuous integration or deployment

Examples:

```text
feat/user-authentication
fix/api-error-handling
docs/sync-phase-status
chore/update-dependencies
ci/update-quality-gate
```

## Commit Identity

Use the repository-specific Git identity associated with the GitHub account. If GitHub email privacy protection is enabled, configure the account-provided `@users.noreply.github.com` address before committing.

Verify it without printing unrelated configuration:

```bash
git config user.name
git config user.email
```

This prevents GitHub from rejecting a push that would expose a private email address.

## Commit Messages

Use short, descriptive conventional-style commit messages:

```text
type(scope): description
```

The scope is optional. Examples:

```text
feat(database): add tenant model
fix(api): handle missing configuration
docs: synchronize repository status
test(auth): add authorization cases
chore: update dependencies
ci: enforce database validation
```

Keep each commit focused on one logical change.

## Local Validation

Before opening a pull request, run the repository quality checks from the root:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
git diff --check
```

For database changes, also validate the committed migration history against an isolated clean database, verify migration status, and run the deterministic seed twice. Do not use the active development database for destructive release-gate tests.

Review the working tree and the exact patch:

```bash
git status --short --branch
git diff
git diff --cached
```

Do not commit:

- `.env` files
- Credentials, API keys, passwords, or tokens
- Database dumps
- Generated build artifacts
- Dependency directories such as `node_modules`
- Unrelated local changes

## Pull Request Workflow

Push the focused branch:

```bash
git push -u origin <branch-name>
```

Open a pull request targeting `main` and link the issue using a closing keyword such as:

```text
Closes #<issue-number>
```

The pull request should:

- Explain what changed and why.
- Identify the linked issue and roadmap phase.
- Record the validation performed.
- Identify architectural decisions or known limitations.
- Avoid unrelated changes.
- Pass all required CI checks.

When the pull request is ready for review, set the project item to `In Review`.

## Continuous Integration

The current `Quality gate` runs on pull requests and pushes to `main`. It verifies:

- Frozen-lockfile dependency installation
- Prisma client generation
- Formatting
- Linting
- Type checking
- Migration deployment to a clean PostgreSQL database
- Migration status
- Deterministic seed repeatability

Do not merge while a required check is failing.

## Code Review

Reviewers should consider:

- Correctness
- Maintainability
- Security
- Test coverage appropriate to the current phase
- Type safety
- Error handling
- Performance
- Tenant isolation
- Consistency with the existing architecture
- Documentation accuracy

Changes must be made through the branch and pull request, not directly on `main`.

## Release Completion

After approval and successful required checks:

1. Merge the pull request through the protected `main` branch.
2. Confirm the linked issue closed and update any remaining checklist or evidence.
3. Set the GitHub Project item to `Done`.
4. Delete the remote feature branch when appropriate.
5. Synchronize local `main` using a fast-forward-only pull.
6. Delete merged local and temporary safety branches after verifying that `main` contains the work.
7. Remove temporary databases or other release-validation resources while preserving normal development state.

Example local synchronization:

```bash
git switch main
git pull --ff-only origin main
git status --short --branch
```

## When to Update the GitHub Project

| Development moment                                      | Project update                                                |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| Issue is planned but work has not begun                 | Set `Todo` and complete the planning fields                   |
| Local implementation begins                             | Set `In Progress`                                             |
| A material checkpoint is verified                       | Add concise evidence to the issue and check the matching item |
| Pull request is ready and linked                        | Set `In Review`                                               |
| Review or CI requires more implementation               | Return to `In Progress` if active work resumes                |
| Pull request is merged and the release gate is complete | Check remaining issue items, close the issue, and set `Done`  |

The issue records durable implementation and validation evidence. The project communicates current workflow state. The pull request remains the release record.

## General Principles

Prefer:

- Small, reviewable changes
- Explicit configuration
- Strong typing
- Automated validation
- Reproducible builds and migrations
- Secure defaults
- Clear documentation
- Evidence-based performance decisions
- Completion of the release process before starting the next phase

Do not bypass project checks or the release process merely because the repository currently has one developer.
