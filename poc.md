# Music Blocks Temperament POC

## Purpose

This proof of concept demonstrates a focused fix for the core temperament pipeline in Music Blocks v3. The larger project goal is to make temperament work reliably across pitch operations, intervals, chords, widgets, and import/export. This POC intentionally starts with the foundation: making non-12 EDO pitch values flow correctly from note resolution to frequency generation and playback.

The project description says Music Blocks v3 still has artifacts from an older 12-EDO-centered implementation. This POC addresses one of those artifacts directly: numeric pitch steps used by non-12 EDO temperaments could be mishandled by utilities that expected 12-EDO note strings.

## What This POC Proves

- Numeric pitch inputs no longer break `getNote()` in non-12 EDO contexts.
- Numeric non-12 EDO pitch steps preserve octave rollover, negative wrapping, and transposition.
- Frequency generation can use an explicit active temperament instead of relying only on global state.
- Numeric non-12 EDO steps are converted to hertz before reaching synth playback.
- 12-EDO behavior remains stable.
- Mode step patterns can be scaled to target EDO sizes using Largest Remainder.

## Files Changed

### `js/utils/musicutils.js`

- Added `scaleModeToEDO(mode12, targetN)`.
- Added optional target EDO support to `getModeNumbers(name, targetN)`.
- Fixed numeric non-12 EDO handling in `getNote()`.
- Added explicit temperament support to `pitchToFrequency()`.

### `js/turtle-singer.js`

- Added temperament to the pitch-frequency cache key.
- Passed active temperament into cached frequency calculations.
- Converted numeric non-12 EDO step indices to real hertz before synth playback.

This file is included because the project description explicitly mentions `turtle-singer.js` as part of the implementation area, and because utility-only fixes are not enough if playback still treats step indices as raw hertz.

### `js/__tests__/temperament-regression.test.js`

- Expanded the regression suite to 15 focused tests.
- Added coverage for 12-EDO safety.
- Added non-12 EDO numeric pitch tests.
- Added `getNote() -> pitchToFrequency()` pipeline tests.
- Added mode scaling tests.


## Alignment With project goals

The project description lists these goals:

- Goal 1: Supporting any EDO temperament
- Goal 2: Refactor custom pitch block
- Goal 3: Supporting non-EDO temperaments
- Goal 4: Scale and Mode Builder
- Goal 5: Temperament Visualizer Widget
- Goal 6: Exporting and Importing temperaments

This POC is aligned with **Goal 1**. It is not trying to complete the full project before selection. Instead, it proves the most important foundation: non-12 EDO temperament can be made to work correctly in the engine path.

The expected project outcome says temperament should work across basic and advanced pitch operations, including step pitch, nth modal pitch, intervals, and chords. This POC begins that work by fixing the lower-level note and frequency behavior those features depend on.

## Why This Is The Right Starting Point

The larger project will likely touch several UI and block-level features, but those features depend on the same core pitch pipeline. If the engine still mishandles non-12 EDO numeric steps, then widgets and blocks can appear correct while producing wrong audio.

This POC therefore fixes and tests the path that matters first:

```text
numeric EDO pitch step -> getNote() -> pitchToFrequency() -> turtle-singer playback -> synth hertz
```

That makes later work on custom pitch blocks, intervals, chords, scale builders, and widgets safer.

## Verification

The following checks were run successfully:

- `npm test -- --runInBand`
    - 155 test suites passed
    - 5138 tests passed
    - coverage thresholds passed

- `npx jest --runInBand --coverage=false js/__tests__/temperament-regression.test.js js/utils/__tests__/musicutils.test.js`
    - 405 tests passed

- `npx prettier --check js/utils/musicutils.js js/turtle-singer.js js/__tests__/temperament-regression.test.js`
    - passed

- `npm run lint`
    - passed with existing warnings
    - 0 errors


## Summary

This POC is intentionally narrow but technically meaningful. It fixes a real temperament pipeline issue, proves the fix with tests, preserves existing 12-EDO behavior, and aligns with the project description by starting at the engine layer that the rest of the temperament work depends on.
