import { describe, expect, it } from "vitest";
import { categorize } from "./categorize";
import { extractLandmark } from "./extractLandmark";
import { sampleComplaints } from "./sampleComplaints";
import { sanitize } from "./sanitize";
import { summarize } from "./summarize";

describe("voice complaint processing", () => {
  it.each([
    ["en", "garbage", "bus stop"],
    ["hi", "water", "सरकारी स्कूल"],
    ["kn", "streetlight", "ಬಸ್ ನಿಲ್ದಾಣದ"],
  ] as const)("extracts the %s sample without adding facts", (language, category, landmark) => {
    const sample = sampleComplaints[language];
    expect(categorize(sample)).toBe(category);
    expect(extractLandmark(sample, language)).toBe(landmark);
    expect(summarize(sample, category, language)).toEqual({ title: expect.any(String), description: sample });
  });

  it("leaves unknown and mixed category reports open for review", () => {
    expect(categorize("A waterfall near the park")).toBeNull();
    expect(categorize("Garbage and water near the park")).toBeNull();
    expect(extractLandmark("Garbage is piling up.", "en")).toBe("");
    expect(extractLandmark("Garbage near the park and beside the school.", "en")).toBe("");
  });

  it.each([
    ["Water leak, Mr. A. Kumar, 1234; pipe 123", "Water leak, [redacted], [redacted]; pipe 123"],
    ["पानी लीक, श्री अमित कुमार; १२३४।", "पानी लीक, [redacted]; [redacted]।"],
    ["ನೀರು, ಶ್ರೀ ರವಿ ಕುಮಾರ್; ೧೨೩೪.", "ನೀರು, [redacted]; [redacted]."],
  ])("redacts names and Unicode digit runs", (source, expected) => {
    expect(sanitize(source)).toBe(expected);
    expect(sanitize(expected)).toBe(expected);
  });
});
