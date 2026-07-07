# Test Organization Structure

This directory follows the R103 Test Organization and Cleanup Protocol.

## Active Tests

| Path | Purpose |
|------|---------|
| `tests/*.test.{ts,tsx}` | Unit and integration tests (Vitest) |
| `tests/integration/` | Integration test suites |
| `tests/unit/` | Unit test suites |
| `tests/components/` | Component test suites |
| `tests/e2e/` | Playwright end-to-end specs |

Run active tests:

```bash
npm test          # Vitest
npm run test:e2e  # Playwright
```

## Archived / QA Validation

Orphaned and one-off validation files moved from project root and `src/`:

### `qa-validation/scripts/`

12 standalone QA validation scripts (formerly `qa-*.js` at project root).

Run individually:

```bash
node tests/qa-validation/scripts/qa-configurator-validation.js
```

### `archive/`

| Subfolder | Contents | Former location |
|-----------|----------|-----------------|
| `debug-components/` | Unused debug UI test components | `src/components/debug/` |
| `manual/` | Manual/browser console validation | `src/utils/editFlowTests.js`, `src/components/__tests__/qa-configurator-manual-validation.tsx` |
| `scripts/` | Ad-hoc test helper scripts | `scripts/test-*.js` |
| `src/` | Misplaced tests from `src/` tree | `src/__tests__/`, `src/components/__tests__/`, `src/lib/__tests__/`, `src/tests/` |

## Cleanup Summary

**Files moved (July 5, 2026):**

- 12 QA validation scripts → `tests/qa-validation/scripts/`
- 4 debug components → `tests/archive/debug-components/`
- 2 manual validation files → `tests/archive/manual/`
- 2 ad-hoc scripts → `tests/archive/scripts/`
- 7 scattered src tests → `tests/archive/src/`

**Total archived:** 27 files

Project root is clean — no `qa-*.js` files remain.
