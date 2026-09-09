# Database Performance Notes

## Scope

This document records PostgreSQL query-plan observations for the Phase 2 relational data model.

The goal is not to establish production benchmarks. The measurements were collected from the local OpsHub development environment and are used to validate indexing decisions and understand PostgreSQL planner behavior.

The query-plan shape and index usage are more important than the absolute execution times, which can vary based on hardware, caching, PostgreSQL state, and dataset size.

## Environment

- PostgreSQL 17
- Prisma 7.10.0
- Local PostgreSQL instance running through Docker Compose
- Deterministic development seed:
  - 2 organizations
  - 5 users
  - 6 memberships
  - 4 projects
  - 12 tasks

Temporary larger datasets were created inside PostgreSQL transactions for performance analysis and rolled back after each experiment.

## 1. Project lookup by organization and slug

### Access pattern

```sql
SELECT id, name, slug
FROM "Project"
WHERE "organizationId" = ?
  AND slug = ?;
```

The Prisma schema defines:

```prisma
@@unique([organizationId, slug])
```

which creates the PostgreSQL index:

```text
Project_organizationId_slug_key
```

### Observed plan

```text
Index Scan using "Project_organizationId_slug_key" on "Project"
```

The index condition included both:

```text
organizationId
slug
```

Observed local execution time:

```text
0.090 ms
```

### Finding

The composite unique constraint directly supports tenant-scoped project lookup by slug.

This lookup does not require a sequential table scan.

---

## 2. Task filtering by project and status

### Access pattern

```sql
SELECT id, title, status
FROM "Task"
WHERE "projectId" = ?
  AND status = 'IN_PROGRESS';
```

The Prisma schema defines:

```prisma
@@index([projectId, status])
```

which creates:

```text
Task_projectId_status_idx
```

### Small deterministic dataset

With only 12 tasks, PostgreSQL selected:

```text
Seq Scan on "Task"
```

Observed:

```text
Rows returned: 1
Rows removed by filter: 11
Execution Time: 0.073 ms
```

A diagnostic test with sequential scans disabled confirmed that PostgreSQL could use:

```text
Index Scan using "Task_projectId_status_idx"
```

but the forced index plan was slower for the tiny table.

### Larger temporary dataset

A temporary dataset of 120,000 additional tasks was inserted inside a transaction.

The query returned approximately 10,000 matching rows.

PostgreSQL selected:

```text
Bitmap Heap Scan on "Task"
  -> Bitmap Index Scan on "Task_projectId_status_idx"
```

Observed:

```text
Estimated rows: 10057
Actual rows:    10001
Execution Time: 4.896 ms
```

The transaction was rolled back afterward, restoring the development dataset to 12 tasks.

### Finding

The planner correctly prefers a sequential scan when the table is extremely small.

At larger scale, PostgreSQL naturally uses the `(projectId, status)` composite index.

An index should therefore not be considered ineffective merely because a small development dataset produces a sequential scan.

---

## 3. Ordered task pagination before optimization

### Access pattern

The representative query runner uses ordered pagination for tasks:

```sql
SELECT id, title, status, "createdAt"
FROM "Task"
WHERE "projectId" = ?
ORDER BY "createdAt" DESC, id DESC
LIMIT 20;
```

Before optimization, the Task model contained:

```prisma
@@index([projectId])
@@index([projectId, status])
```

Neither index matched the complete filtering and ordering pattern.

### Temporary performance dataset

100,000 tasks were temporarily created for a single project inside a transaction.

PostgreSQL selected:

```text
Limit
  -> Gather Merge
       -> Sort
            -> Parallel Seq Scan on "Task"
```

The sort used:

```text
top-N heapsort
```

Observed local execution time:

```text
38.093 ms
```

### Finding

PostgreSQL had to inspect the large project task set and sort matching rows by:

```text
createdAt DESC
id DESC
```

before returning only the first 20 rows.

This indicated that the existing indexes did not efficiently support the ordered pagination access pattern.

---

## 4. Experimental pagination index

The following temporary index was tested:

```sql
CREATE INDEX "Task_projectId_createdAt_id_perf_idx"
ON "Task" ("projectId", "createdAt" DESC, id DESC);
```

Using the same 100,000-row temporary dataset and the same query, PostgreSQL changed the plan to:

```text
Limit
  -> Index Scan using "Task_projectId_createdAt_id_perf_idx"
```

Observed local execution time:

```text
0.141 ms
```

The transaction containing both the synthetic rows and the experimental index was rolled back.

The database returned to the original 12-task development dataset.

### Finding

The compound index allows PostgreSQL to:

1. Locate tasks for a project.
2. Read them directly in descending creation-time and ID order.
3. Stop scanning after satisfying the `LIMIT`.

This eliminates the large scan-and-sort operation observed in the baseline plan.

---

## 5. Production pagination index

Based on the experimental evidence, the Prisma Task model was updated with:

```prisma
@@index([projectId, createdAt(sort: Desc), id(sort: Desc)])
```

Prisma generated the migration:

```text
20260828190239_add_task_pagination_index
```

with:

```sql
CREATE INDEX "Task_projectId_createdAt_id_idx"
ON "Task"("projectId", "createdAt" DESC, "id" DESC);
```

The migrated PostgreSQL database contains:

```text
Task_projectId_createdAt_id_idx
```

### Post-migration validation

The 100,000-row temporary performance test was repeated against the real migrated index.

PostgreSQL selected:

```text
Limit
  -> Index Scan using "Task_projectId_createdAt_id_idx"
```

Observed:

```text
Rows returned:   20
Shared buffers:  4 hits
Execution Time:  0.044 ms
```

The temporary rows were rolled back and the table returned to:

```text
12 tasks
```

### Finding

The real migration reproduces the performance behavior demonstrated by the experimental index.

The pagination index is therefore supported by measured query-plan evidence rather than speculative optimization.

---

## Index rationale summary

| Index                             | Primary purpose                      |
| --------------------------------- | ------------------------------------ |
| `Project_organizationId_slug_key` | Tenant-scoped project lookup by slug |
| `Task_projectId_status_idx`       | Filter project tasks by status       |
| `Task_projectId_createdAt_id_idx` | Ordered task pagination by project   |

## Key observations

1. PostgreSQL may prefer sequential scans on very small tables even when appropriate indexes exist.
2. Query plans should be evaluated using realistic data volumes before changing indexes.
3. Composite index column order should reflect application filtering and ordering patterns.
4. `EXPLAIN ANALYZE` should be used to validate assumptions instead of assuming that an index will improve a query.
5. Performance-test data can be created inside transactions and rolled back to preserve a deterministic development dataset.
6. Absolute local execution times are illustrative; plan shape, row counts, selectivity, and buffer behavior provide more durable evidence for design decisions.
