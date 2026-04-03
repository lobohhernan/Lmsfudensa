---
description: "Use when: automatically implementing pagination (15 rows) in listed admin tables, validating loading/error states, and checking admin permissions; excludes course and dashboard."
name: "Admin Panel Pagination Review"
argument-hint: "Optional scope (e.g. only users, payments, enrollments)"
agent: "agent"
model: "GPT-5 (copilot)"
---
Review and automatically implement admin panel listed-table pagination and related quality checks in this workspace.

Goals:
1. Ensure all admin panel listed table sections use pagination with a fixed page size of 15 rows.
2. Add or verify page navigation to move through remaining rows.
3. Validate and improve loading/error state handling in each applicable section.
4. Validate admin permission checks in each applicable section.
5. Exclude all course-related and dashboard sections from analysis and changes.

Execution rules:
- Apply code changes automatically, not only analysis/reporting.
- Inspect existing admin pages/components and identify all listed table sections except course and dashboard.
- Do not include cards or non-tabular layouts.
- Reuse existing design patterns/hooks when possible.
- Keep behavior and naming consistent with the codebase.
- Prefer minimal, targeted edits.

Output format:
1. Coverage summary
- List each admin section reviewed and whether it required changes.

2. Implemented changes
- For each changed section, describe:
  - pagination behavior (15 rows)
  - page controls behavior
  - loading/error handling updates
  - permission handling updates

3. Validation
- Report any checks run (typecheck/tests/lint) and outcomes.

4. Remaining risks
- List gaps, assumptions, or sections that need manual verification.
