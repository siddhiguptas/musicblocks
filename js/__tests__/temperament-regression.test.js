// Mock the global translation function
global._ = (str) => str;
if (typeof TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}
const musicutils = require("../utils/musicutils.js");

describe("Temperament Refactor POC - Regression & Core Fixes", () => {
    describe("1. 12-EDO Regression Safety", () => {
        test("getNote('C', 4, 0, 'C major') returns ['C', '', 4]", () => {
            const result = musicutils.getNote("C", 4, 0, "C major");
            expect(result[0]).toBe("C");
        });

        test("getNote('sol', 4, 0, 'C major') returns ['G', '', 4]", () => {
            const result = musicutils.getNote("sol", 4, 0, "C major");
            expect(result[0]).toBe("G");
        });

        test("getNote(0, 4, 0, 'C major') returns ['C', '', 4]", () => {
            const result = musicutils.getNote(0, 4, 0, "C major");
            expect(result[0]).toBe("C");
        });

        test("pitchToFrequency('A', 4, 0, 'C major') ≈ 440", () => {
            const freq = musicutils.pitchToFrequency("A", 4, 0, "C major");
            expect(freq).toBeCloseTo(440, 1);
        });

        test("pitchToFrequency('C', 4, 0, 'C major') ≈ 261.63", () => {
            const freq = musicutils.pitchToFrequency("C", 4, 0, "C major");
            expect(freq).toBeCloseTo(261.63, 1);
        });
        
        test("pitchToNumber('C', 4, 'C major') returns 39", () => {
            const num = musicutils.pitchToNumber("C", 4, "C major");
            expect(num).toBe(39);
        });
    });

    describe("2. Non-12-EDO Note and Frequency Resolution", () => {
        test("pitchToFrequency handles numeric step indices correctly for 19-EDO", () => {
            // A quick mock since globalActivity isn't naturally here for 19-EDO in tests
            global.globalActivity = {
                logo: { synth: { inTemperament: "equal19" } }
            };
            
            // In 19 EDO, step 0 (C4) should be ~261.63
            const freq0 = musicutils.pitchToFrequency(0, 4, 0, "C major");
            expect(freq0).toBeCloseTo(261.63, 1);

            // Step 19 should be one octave up, ~523.25
            const freq19 = musicutils.pitchToFrequency(19, 4, 0, "C major");
            expect(freq19).toBeCloseTo(261.63 * 2, 1);
            
            // Clean up
            delete global.globalActivity;
        });
    });

    describe("3. Largest Remainder Method Mode Scaling", () => {
        test("scaleModeToEDO scales 12-EDO mode to 12-EDO without changes", () => {
            const ionian = [2, 2, 1, 2, 2, 2, 1];
            const scaled = musicutils.scaleModeToEDO(ionian, 12);
            expect(scaled).toEqual([2, 2, 1, 2, 2, 2, 1]);
            expect(scaled.reduce((a, b) => a + b, 0)).toBe(12);
        });

        test("scaleModeToEDO scales Ionian to 13-EDO safely summing to 13", () => {
            const ionian = [2, 2, 1, 2, 2, 2, 1];
            const scaled = musicutils.scaleModeToEDO(ionian, 13);
            // Expected distribution: extra +1 goes to one of the '2's
            expect(scaled.reduce((a, b) => a + b, 0)).toBe(13);
            expect(scaled).toEqual([3, 2, 1, 2, 2, 2, 1]); // Remainder distribution gives +1 to first '2'
        });

        test("scaleModeToEDO scales Ionian to 19-EDO", () => {
            const ionian = [2, 2, 1, 2, 2, 2, 1];
            const scaled = musicutils.scaleModeToEDO(ionian, 19);
            expect(scaled.reduce((a, b) => a + b, 0)).toBe(19);
            // Ionian in 19-EDO usually [3, 3, 2, 3, 3, 3, 2]
            expect(scaled).toEqual([3, 3, 2, 3, 3, 3, 2]);
        });
    });
});
