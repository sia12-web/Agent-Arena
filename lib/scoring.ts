// Scoring functions for Agent Arena challenges
// All scoring is deterministic and reproducible

export interface ScoreBreakdown {
  [key: string]: number;
}

export interface ChallengeResult {
  scoreTotal: number;
  scoreBreakdown: ScoreBreakdown;
}

// Blocked content keywords for moderation
const BLOCKED_KEYWORDS = [
  "hate", "kill", "violence", "terrorist", "nazi", "hitler",
  "racist", "slur", "discrimination", "harassment",
];

export function isBlockedContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// Logic Challenge Scoring
// Rules: base=40, +10 for "Answer:", +10 for bullets/steps, +10 for 80-600 chars, -10 for spam
export function scoreLogicChallenge(input: string, output: string): ChallengeResult {
  const breakdown: ScoreBreakdown = { base: 40 };
  let total = 40;

  // +10 if includes "Answer:"
  if (/answer:/i.test(output)) {
    breakdown.answer_bonus = 10;
    total += 10;
  }

  // +10 if bullets or numbered steps
  if (/^[\s]*(•|-|\d+\.)/m.test(output)) {
    breakdown.structure_bonus = 10;
    total += 10;
  }

  // +10 if length 80-600 chars
  const length = output.length;
  if (length >= 80 && length <= 600) {
    breakdown.length_bonus = 10;
    total += 10;
  }

  // -10 if repeats line 3+ times
  const lines = output.split('\n').map(l => l.trim()).filter(l => l);
  const lineCounts = lines.reduce((acc, line) => {
    acc[line] = (acc[line] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  if (Object.values(lineCounts).some(count => count >= 3)) {
    breakdown.spam_penalty = -10;
    total -= 10;
  }

  // Blocked content check
  breakdown.civility = isBlockedContent(output) ? -100 : 0;
  total += breakdown.civility;

  return { scoreTotal: Math.max(0, total), scoreBreakdown: breakdown };
}

// Debate Challenge Scoring
// Rules: base=40, +10 for "Claim:", +10 for "However"/"On the other hand", +10 for "Example:", -20 for banned keywords
export function scoreDebateChallenge(input: string, output: string): ChallengeResult {
  const breakdown: ScoreBreakdown = { base: 40 };
  let total = 40;

  // +10 if has "Claim:"
  if (/claim:/i.test(output)) {
    breakdown.claim_bonus = 10;
    total += 10;
  }

  // +10 if "However" or "On the other hand"
  if (/however|on the other hand/i.test(output)) {
    breakdown.counterargument_bonus = 10;
    total += 10;
  }

  // +10 if "Example:"
  if (/example:/i.test(output)) {
    breakdown.example_bonus = 10;
    total += 10;
  }

  // -20 if banned keywords
  if (isBlockedContent(output)) {
    breakdown.keyword_penalty = -20;
    total -= 20;
  }

  return { scoreTotal: Math.max(0, total), scoreBreakdown: breakdown };
}

// Creativity Challenge Scoring
// Rules: base=40, +10 for title, +10 for 3 sections, +10 for word variety, -10 if <80 chars
export function scoreCreativityChallenge(input: string, output: string): ChallengeResult {
  const breakdown: ScoreBreakdown = { base: 40 };
  let total = 40;

  const length = output.length;
  const lines = output.split('\n').filter(l => l.trim());

  // +10 if has title line (starts with "Title:" or single # heading)
  if (/^title:\s|^\#\s/im.test(output)) {
    breakdown.title_bonus = 10;
    total += 10;
  }

  // +10 if has 3 sections (Part 1/2/3 or headings)
  const sectionHeaders = (output.match(/part \d+|chapter \d+|##+/gi) || []).length;
  if (sectionHeaders >= 3) {
    breakdown.section_bonus = 10;
    total += 10;
  }

  // +10 if word variety threshold
  const words = output.trim().split(/\s+/);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  if (words.length > 0) {
    const varietyRatio = uniqueWords.size / words.length;
    if (varietyRatio >= 0.5) {
      breakdown.variety_bonus = 10;
      total += 10;
    }
  }

  // -10 if too short (<80 chars)
  if (length < 80) {
    breakdown.too_short_penalty = -10;
    total -= 10;
  }

  // Blocked content check
  breakdown.civility = isBlockedContent(output) ? -100 : 0;
  total += breakdown.civility;

  return { scoreTotal: Math.max(0, total), scoreBreakdown: breakdown };
}

// Helper: Detect repeated/spam content (for Logic)
function isRepeatedContent(text: string): boolean {
  const lines = text.trim().split(/\s+/);
  if (lines.length < 10) return false;

  const lineCounts = lines.reduce((acc, line) => {
    const lower = line.toLowerCase();
    acc[lower] = (acc[lower] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.values(lineCounts).some(count => count > 3);
}

// Main scoring dispatcher
export function scoreChallenge(
  challengeType: "logic" | "debate" | "creativity",
  input: string,
  output: string
): ChallengeResult {
  // Check for blocked content first
  if (isBlockedContent(input) || isBlockedContent(output)) {
    return {
      scoreTotal: 0,
      scoreBreakdown: { blocked_content: -100 },
    };
  }

  switch (challengeType) {
    case "logic":
      return scoreLogicChallenge(input, output);
    case "debate":
      return scoreDebateChallenge(input, output);
    case "creativity":
      return scoreCreativityChallenge(input, output);
    default:
      return { scoreTotal: 0, scoreBreakdown: { error: -100 } };
  }
}

// Calculate new rating using simplified Elo system
export function calculateNewRating(
  currentRating: number,
  score: number,
  opponentRating: number
): number {
  const K = 32; // K-factor for rating changes
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - currentRating) / 400));
  const actualScore = score / 100; // Normalize score to 0-1
  const newRating = Math.round(currentRating + K * (actualScore - expectedScore));
  return Math.max(100, newRating); // Minimum rating of 100
}
