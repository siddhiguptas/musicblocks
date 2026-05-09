# Temperament Refactor POC Status

Branch: `poc/temperament-refactor`

Status date: 2026-05-09

## Executive Verdict

The POC is functionally ready for review. It proves the core Goal 1 claim from the project brief: non-12 EDO numeric pitches can move through `getNote()`, frequency calculation, and playback conversion without collapsing into invalid octave data or raw step-index hertz.

This is intentionally scoped as a Goal 1 engine POC, not the full Music Blocks Temperament project. The full project still includes custom pitch block refactoring, non-EDO temperament support, scale/mode builder work, visualizer work, and import/export.

## Scope Comparison

| Requirement                                       | Current status | Notes                                                                                                         |
| ------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- |
| `getNote()` handles number inputs in non-12 EDO   | Done           | Numeric non-12 pitches preserve wrapping, octave rollover, negative indices, and numeric transposition.       |
| No `.substr()` crash for numeric pitch inputs     | Done           | Numeric handling happens before string-only parsing.                                                          |
| Pitch-to-frequency math works for arbitrary N-EDO | Done           | `pitchToFrequency()` supports explicit temperament and computes `C4 * 2^(step / divisions) * octave * cents`. |
| 12-EDO behavior unchanged                         | Done           | Existing `musicutils` tests and full Jest suite pass.                                                         |
| Mode scaling uses Largest Remainder               | Done           | `scaleModeToEDO()` is implemented and `getModeNumbers(name, targetN)` can use scaled steps.                   |
| Regression test suite added                       | Done           | `js/__tests__/temperament-regression.test.js` has 15 focused tests.                                           |
| Real playback path works                          | Done           | `turtle-singer.js` converts numeric non-12 EDO step indices to hertz before synth playback.                   |

## Files Changed

- `js/utils/musicutils.js`
    - Added `scaleModeToEDO()`.
    - Added optional target EDO support to `getModeNumbers()`.
    - Fixed numeric non-12 EDO `getNote()` wrapping, transposition, and octave rollover.
    - Added explicit temperament support to `pitchToFrequency()`.

- `js/turtle-singer.js`
    - Added temperament to the pitch-frequency cache key.
    - Passed active temperament into cached frequency calculations.
    - Converted numeric non-12 EDO step indices to hertz before synth playback.

- `js/__tests__/temperament-regression.test.js`
    - Expanded coverage for 12-EDO regression safety.
    - Added non-12 EDO direct frequency tests.
    - Added `getNote() -> pitchToFrequency()` pipeline tests.
    - Added mode scaling and `getModeNumbers()` target EDO tests.

## Verification Performed

Passing checks:

- `npm test -- --runInBand`
    - Result: passed
    - Suites: 155 passed
    - Tests: 5138 passed
    - Coverage thresholds: passed

- `npx jest --runInBand --coverage=false js/__tests__/temperament-regression.test.js js/utils/__tests__/musicutils.test.js`
    - Result: passed
    - Tests: 405 passed

- `npx prettier --check js/utils/musicutils.js js/turtle-singer.js js/__tests__/temperament-regression.test.js`
    - Result: passed

- `npm run lint`
    - Result: passed with existing warnings
    - Errors: 0

Known non-blocking caveats:

- `npm test -- --runInBand js/__tests__/temperament-regression.test.js` passes all 15 assertions but exits non-zero because global coverage thresholds are enforced on a single-file run.
- `npx prettier --check .` fails on unrelated existing repository files, including malformed/generated HTML in docs/examples/planet files. The POC-touched files pass Prettier.

## Final Readiness Decision

Ready as a working POC: yes.

This is enough to demonstrate technical direction to mentors: it fixes a real core pitch pipeline problem, preserves existing 12-EDO behavior, verifies the actual audio path, and keeps the changes small.
