# Database Backup and Restore

## Purpose

This document defines the local PostgreSQL backup and restore workflow used during Phase 2 of OpsHub.

The goal is to verify that the relational database can be backed up and restored reproducibly without modifying the active development database.

This procedure is intended for local development validation. Production backup, retention, encryption, disaster recovery, and automated recovery procedures will be defined in later infrastructure and reliability phases.

## Environment

The Phase 2 validation was performed using:

- PostgreSQL 17
- PostgreSQL running through Docker Compose
- Docker Compose service: `postgres`
- Development database: `opshub`
- Database user: `opshub`
- Custom-format PostgreSQL dump created with `pg_dump -Fc`

The deterministic development dataset contained:

- 2 organizations
- 5 users
- 6 memberships
- 4 projects
- 12 tasks

## Local Backup Directory

Database dump files are stored locally under:

```text
backups/
```

The directory is excluded from Git through:

```gitignore
# Local database backups
backups/
```

Database dump files should not be committed to source control because they are generated artifacts and may eventually contain sensitive or environment-specific data.

## Creating a Backup

Create the local backup directory if it does not already exist:

```bash
mkdir -p backups
```

Create a PostgreSQL custom-format backup:

```bash
docker compose exec -T postgres pg_dump \
  -U opshub \
  -d opshub \
  -Fc > backups/opshub_phase2.dump
```

The `-T` option disables pseudo-TTY allocation so the binary dump can be redirected safely to a local file.

The `-Fc` option instructs `pg_dump` to create a PostgreSQL custom-format archive.

Verify that the backup file exists:

```bash
ls -lh backups/opshub_phase2.dump
```

## Inspecting the Backup

The archive contents can be inspected without restoring the database:

```bash
docker compose exec -T postgres pg_restore \
  -l < backups/opshub_phase2.dump
```

For a shorter inspection:

```bash
docker compose exec -T postgres pg_restore \
  -l < backups/opshub_phase2.dump | head -30
```

The archive should contain schema objects, tables, indexes, constraints, and table data.

## Restore Validation Strategy

A backup should not be tested by restoring directly over the active development database.

Instead, create an isolated temporary database:

```text
opshub_restore_test
```

This allows the backup to be validated without changing the existing `opshub` database.

## Creating the Restore Test Database

Create the temporary database:

```bash
docker compose exec postgres createdb \
  -U opshub \
  opshub_restore_test
```

Verify that it exists:

```bash
docker compose exec postgres psql \
  -U opshub \
  -d postgres \
  -P pager=off \
  -c '\l'
```

The original `opshub` database must remain present and unchanged.

## Restoring the Backup

Restore the custom-format archive into the temporary database:

```bash
docker compose exec -T postgres pg_restore \
  -U opshub \
  -d opshub_restore_test \
  --no-owner \
  --no-privileges \
  < backups/opshub_phase2.dump
```

The options:

```text
--no-owner
--no-privileges
```

avoid restoring environment-specific ownership and privilege metadata.

## Validating Restored Data

Verify the deterministic dataset:

```bash
docker compose exec postgres psql \
  -U opshub \
  -d opshub_restore_test \
  -P pager=off \
  -c '
SELECT
  (SELECT COUNT(*) FROM "Organization") AS organizations,
  (SELECT COUNT(*) FROM "User") AS users,
  (SELECT COUNT(*) FROM "Membership") AS memberships,
  (SELECT COUNT(*) FROM "Project") AS projects,
  (SELECT COUNT(*) FROM "Task") AS tasks;
'
```

Expected result:

```text
organizations = 2
users         = 5
memberships   = 6
projects      = 4
tasks         = 12
```

During Phase 2 validation, the restored database matched all five expected counts.

## Validating Restored Indexes

Schema restoration must include database indexes as well as table data.

Verify the indexes on the `Task` table:

```bash
docker compose exec postgres psql \
  -U opshub \
  -d opshub_restore_test \
  -P pager=off \
  -c '
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = '\''Task'\''
ORDER BY indexname;
'
```

The Phase 2 restore produced:

```text
Task_pkey
Task_projectId_createdAt_id_idx
Task_projectId_idx
Task_projectId_status_idx
```

This confirmed that the pagination-performance index and the other Task indexes were preserved by the backup and restore process.

## Cleaning Up the Restore Test

After validation, remove the temporary database:

```bash
docker compose exec postgres dropdb \
  -U opshub \
  opshub_restore_test
```

Verify that it no longer exists:

```bash
docker compose exec postgres psql \
  -U opshub \
  -d postgres \
  -P pager=off \
  -c '\l'
```

The development database `opshub` should remain present.

## Phase 2 Validation Result

The Phase 2 backup and restore test successfully demonstrated that:

1. The active `opshub` database can be exported with `pg_dump`.
2. The resulting archive can be inspected with `pg_restore`.
3. The archive can be restored into an isolated PostgreSQL database.
4. The deterministic dataset is preserved.
5. PostgreSQL indexes are preserved.
6. The original development database remains unchanged during validation.
7. The temporary restore database can be safely removed afterward.

The restored dataset matched:

```text
Organizations: 2
Users:         5
Memberships:   6
Projects:      4
Tasks:         12
```

The restored `Task` table contained all four expected indexes.

## Limitations

This validation demonstrates logical backup and restore functionality for the local development environment.

It does not yet address:

- Automated scheduled backups
- Backup retention policies
- Encryption at rest
- Off-site backup storage
- Point-in-time recovery
- Recovery point objectives
- Recovery time objectives
- Automated disaster-recovery testing
- Cloud-managed database backup policies

Those concerns belong to later infrastructure, production-readiness, and reliability phases.
