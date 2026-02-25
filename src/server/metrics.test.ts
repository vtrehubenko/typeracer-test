import { describe, expect, it } from "vitest";
import { computeMetrics } from "./metrics";

describe("computeMetrics", () => {
  it("returns accuracy=1 and wpm=0 for empty typed", () => {
    const res = computeMetrics({
      sentence: "hello world",
      typed: "",
      startedAt: 0,
      now: 60_000,
    });

    expect(res.accuracy).toBe(1);
    expect(res.wpm).toBe(0);
  });

  it("counts correct chars for accuracy", () => {
    const res = computeMetrics({
      sentence: "abc",
      typed: "axc",
      startedAt: 0,
      now: 60_000,
    });

    expect(res.accuracy).toBeCloseTo(2 / 3, 5);
  });

  it("counts correct words in order for wpm", () => {
    const res = computeMetrics({
      sentence: "one two three",
      typed: "one two XXX",
      startedAt: 0,
      now: 60_000,
    });

    expect(res.wpm).toBeCloseTo(2, 5);
  });

  it("stops word counting at first wrong word", () => {
    const res = computeMetrics({
      sentence: "one two three four",
      typed: "one XX three four",
      startedAt: 0,
      now: 60_000,
    });

    expect(res.wpm).toBeCloseTo(1, 5);
  });

  it("does not produce Infinity when time is near zero", () => {
    const res = computeMetrics({
      sentence: "hello",
      typed: "hello",
      startedAt: 1000,
      now: 1000,
    });

    expect(Number.isFinite(res.wpm)).toBe(true);
    expect(Number.isFinite(res.accuracy)).toBe(true);
  });
});
