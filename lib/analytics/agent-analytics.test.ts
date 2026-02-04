import { describe, it, expect } from "vitest";
import {
  computeCoreMetrics,
  computeSkillBreakdown,
  computeTrend,
  computePersonalBests,
} from "./agent-analytics";
import type { ChallengeType } from "./agent-analytics";

describe("computeCoreMetrics", () => {
  it("calculates total battles and average score", () => {
    const battles = [
      { scoreTotal: 50 },
      { scoreTotal: 70 },
      { scoreTotal: 60 },
    ];
    const result = computeCoreMetrics(battles);
    expect(result.totalBattles).toBe(3);
    expect(result.averageScore).toBe(60);
  });

  it("handles empty battles", () => {
    const result = computeCoreMetrics([]);
    expect(result.totalBattles).toBe(0);
    expect(result.averageScore).toBe(0);
  });
});

describe("computeSkillBreakdown", () => {
  it("calculates averages per type", () => {
    const battles = [
      { scoreTotal: 50, challengeType: "logic" as ChallengeType },
      { scoreTotal: 70, challengeType: "logic" as ChallengeType },
      { scoreTotal: 60, challengeType: "debate" as ChallengeType },
    ];
    const result = computeSkillBreakdown(battles);
    expect(result.logic.average).toBe(60);
    expect(result.logic.count).toBe(2);
    expect(result.logic.best).toBe(70);
    expect(result.debate.average).toBe(60);
    expect(result.debate.count).toBe(1);
    expect(result.debate.best).toBe(60);
  });

  it("handles empty battles", () => {
    const result = computeSkillBreakdown([]);
    expect(result.logic.average).toBe(0);
    expect(result.logic.count).toBe(0);
    expect(result.logic.best).toBe(0);
    expect(result.creativity.average).toBe(0);
    expect(result.creativity.count).toBe(0);
    expect(result.creativity.best).toBe(0);
  });

  it("finds best scores per type", () => {
    const battles = [
      { scoreTotal: 85, challengeType: "logic" as ChallengeType },
      { scoreTotal: 90, challengeType: "debate" as ChallengeType },
      { scoreTotal: 75, challengeType: "debate" as ChallengeType },
    ];
    const result = computeSkillBreakdown(battles);
    expect(result.logic.best).toBe(85);
    expect(result.debate.best).toBe(90);
  });
});

describe("computeTrend", () => {
  it("detects improving trend", () => {
    const now = Date.now();
    const battles = Array.from({ length: 10 }, (_, i) => ({
      scoreTotal: 50 + i * 5,
      createdAt: new Date(now + i * 1000),
    }));
    const result = computeTrend(battles);
    expect(result.direction).toBe("improving");
    expect(result.changePercent).toBeGreaterThan(0);
    expect(result.recentAverage).toBe(85); // Last 5: 75, 80, 85, 90, 95 → avg = 85
    expect(result.previousAverage).toBe(60); // Previous 5: 50, 55, 60, 65, 70 → avg = 60
  });

  it("detects declining trend", () => {
    const now = Date.now();
    const battles = Array.from({ length: 10 }, (_, i) => ({
      scoreTotal: 100 - i * 5,
      createdAt: new Date(now + i * 1000),
    }));
    const result = computeTrend(battles);
    expect(result.direction).toBe("declining");
    expect(result.changePercent).toBeLessThan(0);
  });

  it("detects stable trend", () => {
    const now = Date.now();
    const battles = Array.from({ length: 10 }, (_, i) => ({
      scoreTotal: 60,
      createdAt: new Date(now + i * 1000),
    }));
    const result = computeTrend(battles);
    expect(result.direction).toBe("stable");
    expect(result.changePercent).toBe(0);
  });

  it("handles insufficient data", () => {
    const result = computeTrend([{ scoreTotal: 50, createdAt: new Date() }]);
    expect(result.direction).toBe("stable");
    expect(result.recentAverage).toBe(0);
    expect(result.previousAverage).toBe(0);
    expect(result.changePercent).toBe(0);
  });

  it("handles exactly 10 battles", () => {
    const now = Date.now();
    const battles = Array.from({ length: 10 }, (_, i) => ({
      scoreTotal: 50 + i * 2,
      createdAt: new Date(now + i * 1000),
    }));
    const result = computeTrend(battles);
    expect(result.direction).toBe("improving");
    expect(result.recentAverage).toBe(64); // Last 5: 60, 62, 64, 66, 68 → avg = 64
    expect(result.previousAverage).toBe(54); // Previous 5: 50, 52, 54, 56, 58 → avg = 54
  });
});

describe("computePersonalBests", () => {
  it("finds overall and per-type bests", () => {
    const battles = [
      { scoreTotal: 85, challengeType: "logic" as ChallengeType },
      { scoreTotal: 90, challengeType: "debate" as ChallengeType },
      { scoreTotal: 95, challengeType: "creativity" as ChallengeType },
    ];
    const result = computePersonalBests(battles);
    expect(result.overall).toBe(95);
    expect(result.logic).toBe(85);
    expect(result.debate).toBe(90);
    expect(result.creativity).toBe(95);
  });

  it("handles empty battles", () => {
    const result = computePersonalBests([]);
    expect(result.overall).toBe(0);
    expect(result.logic).toBe(0);
    expect(result.debate).toBe(0);
    expect(result.creativity).toBe(0);
  });

  it("finds best when multiple battles of same type", () => {
    const battles = [
      { scoreTotal: 70, challengeType: "logic" as ChallengeType },
      { scoreTotal: 85, challengeType: "logic" as ChallengeType },
      { scoreTotal: 60, challengeType: "logic" as ChallengeType },
    ];
    const result = computePersonalBests(battles);
    expect(result.overall).toBe(85);
    expect(result.logic).toBe(85);
  });
});
