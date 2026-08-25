# Contributing to OpsHub

OpsHub follows a disciplined Git and pull request workflow designed to resemble a production engineering environment.

## Development Environment

The project uses:

- Node.js 22
- pnpm 10
- Turborepo
- TypeScript
- ESLint
- Prettier

Install dependencies from the repository root:

```bash
pnpm install
```

## Branching Strategy

The `main` branch is protected and should never be used for direct development.

Create a feature branch from the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/short-description
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
docs/update-architecture
chore/update-dependencies
ci/add-github-actions
```

## Commit Messages

Use short, descriptive conventional-style commit messages.

Format:

```text
type: description
```

Examples:

```text
feat: add tenant management API
fix: handle missing configuration
docs: update architecture documentation
test: add authentication tests
chore: update dependencies
ci: add lint workflow
```

Keep commits focused on a single logical change.

## Before Opening a Pull Request

Run the following commands from the repository root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm format:check
```

All checks must pass before opening a pull request.

Also verify the working tree:

```bash
git status
```

Do not commit:

- `.env` files
- Credentials
- API keys
- Passwords
- Tokens
- Generated build artifacts
- Dependency directories such as `node_modules`

## Pull Request Workflow

Push the feature branch to GitHub:

```bash
git push -u origin <branch-name>
```

Open a pull request targeting `main`.

The pull request should:

- Explain what changed.
- Explain why the change was made.
- Identify relevant tests or validation performed.
- Keep the scope focused.
- Pass all required CI checks.

Do not merge a pull request with failing required checks.

## Code Review

Reviewers should consider:

- Correctness
- Maintainability
- Security
- Test coverage
- Type safety
- Error handling
- Performance
- Consistency with the existing architecture

Changes should be made through the pull request rather than directly on `main`.

## Pull Request Completion

After approval and successful CI checks:

1. Merge the pull request into `main`.
2. Delete the feature branch when appropriate.
3. Update the local repository.

Example:

```bash
git checkout main
git pull origin main
git branch -d <branch-name>
```

## General Principles

OpsHub is intended to demonstrate production-oriented engineering practices.

Prefer:

- Small changes
- Explicit configuration
- Strong typing
- Automated validation
- Reproducible builds
- Secure defaults
- Clear documentation
- Reviewable pull requests

Avoid bypassing project checks simply to make a change pass.
