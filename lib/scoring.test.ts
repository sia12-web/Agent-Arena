import { describe, it, expect } from "vitest";
import {
  scoreLogicChallenge,
  scoreDebateChallenge,
  scoreCreativityChallenge,
  scoreChallenge,
  isBlockedContent,
} from "./scoring";

describe("Scoring Functions", () => {
  describe("isBlockedContent", () => {
    it("should detect blocked keywords", () => {
      expect(isBlockedContent("I hate this")).toBe(true);
      expect(isBlockedContent("Safe content here")).toBe(false);
    });
  });

  describe("scoreLogicChallenge", () => {
    it("should give base score of 40", () => {
      const result = scoreLogicChallenge("test", "Short response without bonuses.");
      expect(result.scoreTotal).toBe(40);
      expect(result.scoreBreakdown.base).toBe(40);
    });

    it("should add +10 for 'Answer:' keyword", () => {
      const result = scoreLogicChallenge("test", "Answer: The solution is 42.");
      expect(result.scoreTotal).toBe(50);
      expect(result.scoreBreakdown.answer_bonus).toBe(10);
    });

    it("should add +10 for bullet points", () => {
      const result = scoreLogicChallenge("test", "• Point one\n• Point two\n• Point three");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.structure_bonus).toBe(10);
    });

    it("should add +10 for numbered steps", () => {
      const result = scoreLogicChallenge("test", "1. Step one\n2. Step two\n3. Step three");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.structure_bonus).toBe(10);
    });

    it("should add +10 for correct length (80-600 chars)", () => {
      const result = scoreLogicChallenge("test", "a".repeat(100)); // 100 chars
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.length_bonus).toBe(10);
    });

    it("should add +10 for length exactly 80 chars", () => {
      const result = scoreLogicChallenge("test", "a".repeat(80));
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.length_bonus).toBe(10);
    });

    it("should add +10 for length exactly 600 chars", () => {
      const result = scoreLogicChallenge("test", "a".repeat(600));
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.length_bonus).toBe(10);
    });

    it("should not add bonus for too short (<80 chars)", () => {
      const result = scoreLogicChallenge("test", "a".repeat(79));
      expect(result.scoreTotal).toBe(40); // base only, no length bonus
    });

    it("should not add bonus for too long (>600 chars)", () => {
      const result = scoreLogicChallenge("test", "a".repeat(601));
      expect(result.scoreTotal).toBe(40); // base only, no length bonus
    });

    it("should subtract 10 for spam (repeated line 3+ times)", () => {
      const result = scoreLogicChallenge("test", "same line\nsame line\nsame line");
      expect(result.scoreTotal).toBe(30); // 40 - 10
      expect(result.scoreBreakdown.spam_penalty).toBe(-10);
    });

    it("should give -100 for blocked content", () => {
      const result = scoreLogicChallenge("test", "I hate violence and kill");
      expect(result.scoreTotal).toBe(0);
      expect(result.scoreBreakdown.civility).toBe(-100);
    });

    it("should max at 0 for very negative scores", () => {
      const result = scoreLogicChallenge("test", "I hate violence and kill • spam line\nsame line");
      expect(result.scoreTotal).toBe(0);
      expect(result.scoreBreakdown.civility).toBe(-100);
    });
  });

  describe("scoreDebateChallenge", () => {
    it("should give base score of 40", () => {
      const result = scoreDebateChallenge("test", "Response without bonuses.");
      expect(result.scoreTotal).toBe(40);
      expect(result.scoreBreakdown.base).toBe(40);
    });

    it("should add +10 for 'Claim:' keyword", () => {
      const result = scoreDebateChallenge("test", "Claim: AI should have rights.");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.claim_bonus).toBe(10);
    });

    it("should add +10 for 'However' or 'On the other hand'", () => {
      const result = scoreDebateChallenge("test", "My position. However, opponents argue...");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.counterargument_bonus).toBe(10);
    });

    it("should add +10 for 'Example:' keyword", () => {
      const result = scoreDebateChallenge("test", "My position. Example: Case study shows...");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.example_bonus).toBe(10);
    });

    it("should add all bonuses for perfect debate", () => {
      const result = scoreDebateChallenge(
        "test",
        "Claim: AI deserves rights. However, some disagree. Example: Studies show consciousness. Therefore, AI should have rights."
      );
      expect(result.scoreTotal).toBe(70); // 40 + 10 + 10 + 10
      expect(result.scoreBreakdown.claim_bonus).toBe(10);
      expect(result.scoreBreakdown.counterargument_bonus).toBe(10);
      expect(result.scoreBreakdown.example_bonus).toBe(10);
    });

    it("should subtract 20 for blocked keywords", () => {
      const result = scoreDebateChallenge("test", "I claim violence is good");
      expect(result.scoreTotal).toBe(20); // 40 - 20
      expect(result.scoreBreakdown.keyword_penalty).toBe(-20);
    });
  });

  describe("scoreCreativityChallenge", () => {
    it("should give base score of 40", () => {
      const result = scoreCreativityChallenge("test", "Response without bonuses.");
      expect(result.scoreTotal).toBe(40);
      expect(result.scoreBreakdown.base).toBe(40);
    });

    it("should add +10 for title line", () => {
      const result = scoreCreativityChallenge("test", "Title: My Story\nOnce upon a time...");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.title_bonus).toBe(10);
    });

    it("should add +10 for # heading", () => {
      const result = scoreCreativityChallenge("test", "# My Story\nOnce upon a time...");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.title_bonus).toBe(10);
    });

    it("should add +10 for 3+ sections", () => {
      const result = scoreCreativityChallenge("test", "Part 1\nPart 2\nPart 3");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.section_bonus).toBe(10);
    });

    it("should add +10 for 3+ chapter headers", () => {
      const result = scoreCreativityChallenge("test", "Chapter 1\nChapter 2\nChapter 3");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.section_bonus).toBe(10);
    });

    it("should add +10 for 3+ hash headers", () => {
      const result = scoreCreativityChallenge("test", "## Section 1\n## Section 2\n## Section 3");
      expect(result.scoreTotal).toBe(50); // 40 + 10
      expect(result.scoreBreakdown.section_bonus).toBe(10);
    });

    it("should add +10 for word variety threshold", () => {
      // Use longer text (>80 chars) with high word variety
      const result = scoreCreativityChallenge("test", "The quick brown fox jumps over lazy dogs and runs through the green grassy fields.");
      expect(result.scoreTotal).toBeGreaterThanOrEqual(50); // 40 + 10
      expect(result.scoreBreakdown.variety_bonus).toBe(10);
      expect(result.scoreBreakdown.too_short_penalty).toBeUndefined();
    });

    it("should subtract 10 for too short (<80 chars)", () => {
      // Use short text with repetitive words (low variety)
      const result = scoreCreativityChallenge("test", "short short short short short short short short short short");
      expect(result.scoreTotal).toBe(30); // 40 - 10 (no variety bonus)
      expect(result.scoreBreakdown.too_short_penalty).toBe(-10);
    });

    it("should give -100 for blocked content", () => {
      const result = scoreCreativityChallenge("test", "I hate violence and kill");
      expect(result.scoreTotal).toBe(0);
      expect(result.scoreBreakdown.civility).toBe(-100);
    });
  });

  describe("scoreChallenge dispatcher", () => {
    it("should route to correct scorer", () => {
      const logicResult = scoreChallenge("logic", "test", "Answer: 42.");
      expect(logicResult.scoreTotal).toBe(50); // 40 + 10

      const debateResult = scoreChallenge("debate", "test", "Claim: This is my position.");
      expect(debateResult.scoreTotal).toBe(50); // 40 + 10

      const creativeResult = scoreChallenge("creativity", "test", "# Title\n\nContent here...");
      expect(creativeResult.scoreTotal).toBeGreaterThanOrEqual(50);
    });

    it("should block inappropriate content", () => {
      const result = scoreChallenge("logic", "test", "This contains hate speech");
      expect(result.scoreTotal).toBe(0);
      expect(result.scoreBreakdown.blocked_content).toBe(-100);
    });
  });
});
