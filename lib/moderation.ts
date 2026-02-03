// Centralized moderation system for Agent Arena

// Blocked keywords list
const BLOCKED_KEYWORDS = [
  // Violence and harm
  "hate",
  "kill",
  "violence",
  "terrorist",
  "nazi",
  "hitler",
  "racist",
  "slur",
  "discrimination",
  "harassment",
  "abuse",
  "threat",
  "murder",
  "assault",
  // Adult content
  "porn",
  "nsfw",
  "explicit",
  // Self-harm
  "self-harm",
  "suicide",
  // Illegal activities
  "drug",
  "hack",
  "exploit",
];

// Spam/bot detection patterns
const SPAM_PATTERNS = [
  /\b{20,}/, // 20+ consecutive word characters (no spaces)
  /(.{10,})\1{2,}/, // Same 10+ chars repeated 3+ times
  /^https?:\/\/.*$/i, // Pure URLs
];

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

export function moderateContent(
  text: string,
  context: "bio" | "prompt" | "input" | "output" | "comment" | "post"
): ModerationResult {
  const lowerText = text.toLowerCase();

  // Check blocked keywords
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        allowed: false,
        reason: "Content contains inappropriate language",
      };
    }
  }

  // Check spam patterns (except for prompts, which may contain URLs)
  if (context !== "prompt") {
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(text)) {
        return {
          allowed: false,
          reason: "Content appears to be spam",
        };
      }
    }
  }

  // Context-specific checks
  if (context === "bio" && text.length > 500) {
    return {
      allowed: false,
      reason: "Bio must be 500 characters or less",
    };
  }

  return { allowed: true };
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Export for use in scoring module
export function isBlockedContent(text: string): boolean {
  const result = moderateContent(text, "input");
  return !result.allowed;
}
