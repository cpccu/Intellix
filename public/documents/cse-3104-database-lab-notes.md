# CSE-3104: Database Systems Lab Notes

CampusOS demo study notes · October 2026

## 1. Relational design

A relation is a set of rows with named attributes. A primary key identifies a row; a foreign key points to a key in another table. Keep each fact in one place and use constraints to prevent invalid references.

Normalization checklist:

- 1NF: each field contains one value and each row has a key.
- 2NF: every non-key field depends on the whole candidate key.
- 3NF: non-key fields depend on the key, the whole key, and nothing but the key.

## 2. SQL patterns

```sql
SELECT d.name, COUNT(*) AS student_count
FROM departments AS d
JOIN students AS s ON s.department_id = d.id
GROUP BY d.id, d.name
HAVING COUNT(*) >= 10
ORDER BY student_count DESC;
```

Use `WHERE` to filter input rows before grouping; use `HAVING` to filter groups after aggregation. Prefer explicit columns over `SELECT *` in application queries.

## 3. Transactions

Transactions group changes into one unit. Use `BEGIN`, perform the changes, then `COMMIT`; use `ROLLBACK` if a step fails. ACID means atomicity, consistency, isolation, and durability.

## 4. Indexing and query plans

Indexes can speed up filters and joins but make writes more expensive and consume storage. Index columns used frequently in selective predicates or joins. Check `EXPLAIN` before adding indexes; avoid indexing every column.

## 5. Lab exercise

Create `departments(id, name)` and `students(id, name, department_id)`. Add primary-key and foreign-key constraints, insert sample rows, and write a query that lists departments with no students using a `LEFT JOIN` and `WHERE students.id IS NULL`.
