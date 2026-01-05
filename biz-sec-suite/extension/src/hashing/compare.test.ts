import { bestSimilarity, similarityScore } from "./compare";

test("similarityScore is 1 for identical", () => {
  expect(similarityScore("ff", "ff")).toBe(1);
});

test("banding with thresholds", () => {
  const candidate = { phash: "ff", dhash: "00" };
  const baselines = [{ phash: "ff", dhash: "00" }];
  const { band } = bestSimilarity(candidate, baselines, { strong: 0.85, medium: 0.7 });
  expect(band).toBe("STRONG");
});
