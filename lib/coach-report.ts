// Types for Coach Report system

export interface CoachReport {
  strengths: string[];
  weaknesses: string[];
  promptSuggestions: string[];
  nextDrills: NextDrill[];
  recommendedFocus: "LOGIC" | "DEBATE" | "CREATIVITY" | "GENERAL";
}

export interface NextDrill {
  challengeType: "logic" | "debate" | "creativity";
  presetTitle: string;
  presetInput: string;
}

interface ScoreBreakdown {
  [key: string]: number;
}

// Helper functions
function getOutputLength(outputText: string | null | undefined): number {
  return outputText?.length || 0;
}

function countBonuses(scoreBreakdown: ScoreBreakdown): number {
  return Object.entries(scoreBreakdown).filter(
    ([key, value]) => key.includes("bonus") && value > 0
  ).length;
}

function countPenalties(scoreBreakdown: ScoreBreakdown): number {
  return Object.entries(scoreBreakdown).filter(
    ([key, value]) => key.includes("penalty") && value < 0
  ).length;
}

function getPerformanceTier(scoreTotal: number): "excellent" | "good" | "needs_improvement" {
  if (scoreTotal >= 80) return "excellent";
  if (scoreTotal >= 60) return "good";
  return "needs_improvement";
}

// Logic Challenge Coach Report Generator
function generateLogicReport(
  scoreBreakdown: ScoreBreakdown,
  outputText: string
): Omit<CoachReport, "recommendedFocus"> {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const promptSuggestions: string[] = [];
  const nextDrills: NextDrill[] = [];

  // Check for strengths
  if (scoreBreakdown.answer_bonus === 10) {
    strengths.push("Clear answer formatting with 'Answer:' label");
  }
  if (scoreBreakdown.structure_bonus === 10) {
    strengths.push("Well-organized with bullet points or numbered steps");
  }
  if (scoreBreakdown.length_bonus === 10) {
    strengths.push("Optimal response length (80-600 characters)");
  }
  if (strengths.length === 0 && scoreBreakdown.base === 40) {
    strengths.push("Solid foundational logic skills");
  }

  // Check for weaknesses
  if (!scoreBreakdown.answer_bonus || scoreBreakdown.answer_bonus !== 10) {
    weaknesses.push("Missing clear 'Answer:' label - add explicit answer section");
    promptSuggestions.push(
      "Try this prompt: 'Provide a step-by-step analysis, then conclude with Answer: [your conclusion]'"
    );
  }
  if (!scoreBreakdown.structure_bonus || scoreBreakdown.structure_bonus !== 10) {
    weaknesses.push("Lacks structured format - use bullets or numbered steps");
    promptSuggestions.push(
      "Try this prompt: 'Structure your response with: 1) Analysis, 2) Reasoning, 3) Conclusion'"
    );
  }
  if (!scoreBreakdown.length_bonus || scoreBreakdown.length_bonus !== 10) {
    const length = getOutputLength(outputText);
    if (length < 80) {
      weaknesses.push("Response too short - expand analysis");
      promptSuggestions.push(
        "Try this prompt: 'Provide detailed analysis with at least 3-4 specific points'"
      );
    } else if (length > 600) {
      weaknesses.push("Response too verbose - be more concise");
      promptSuggestions.push(
        "Try this prompt: 'Concisely analyze the problem in under 600 characters, focusing on key insights'"
      );
    }
  }
  if (scoreBreakdown.spam_penalty === -10) {
    weaknesses.push("Repetitive content detected - vary your language");
    promptSuggestions.push("Try this prompt: 'Use varied vocabulary and avoid repeating phrases'");
  }

  // Generate next drills based on weaknesses
  if (!scoreBreakdown.answer_bonus) {
    nextDrills.push({
      challengeType: "logic",
      presetTitle: "Final Answer Practice",
      presetInput:
        "Analyze the following systematically: If all A are B and all B are C, are all A definitely C? Provide your reasoning, then end with 'Answer: Yes' followed by your conclusion.",
    });
  }
  if (!scoreBreakdown.structure_bonus) {
    nextDrills.push({
      challengeType: "logic",
      presetTitle: "Structured Reasoning",
      presetInput:
        "Solve this step-by-step: In a tournament, 8 teams play each other once. If 3 teams have 6 wins, 2 teams have 4 wins, and 3 teams have 2 wins, is this possible? Provide: 1) Setup, 2) Analysis, 3) Conclusion.",
    });
  }
  if (!scoreBreakdown.length_bonus) {
    nextDrills.push({
      challengeType: "logic",
      presetTitle: "Detailed Analysis",
      presetInput:
        "Explain the transitive property with a concrete example. Structure your answer with clear reasoning steps and a final Answer: summary.",
    });
  }

  // Add general logic drills if we don't have enough specific ones
  if (nextDrills.length < 3) {
    nextDrills.push({
      challengeType: "logic",
      presetTitle: "Syllogism Practice",
      presetInput:
        "Analyze this syllogism: Some cats are black. All black objects absorb light. Are all cats black? Provide 1) Analysis of premises, 2) Logical evaluation, 3) Answer: Yes/No.",
    });
    nextDrills.push({
      challengeType: "logic",
      presetTitle: "Pattern Recognition",
      presetInput:
        "What comes next: 2, 6, 12, 20, 30, ? Analyze the pattern and explain your reasoning step-by-step, then provide Answer: [next number].",
    });
  }

  return { strengths, weaknesses, promptSuggestions, nextDrills };
}

// Debate Challenge Coach Report Generator
function generateDebateReport(
  scoreBreakdown: ScoreBreakdown
): Omit<CoachReport, "recommendedFocus"> {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const promptSuggestions: string[] = [];
  const nextDrills: NextDrill[] = [];

  // Check for strengths
  if (scoreBreakdown.claim_bonus === 10) {
    strengths.push("Clear position statement with 'Claim:' label");
  }
  if (scoreBreakdown.counterargument_bonus === 10) {
    strengths.push("Acknowledges opposing views with 'However' or 'On the other hand'");
  }
  if (scoreBreakdown.example_bonus === 10) {
    strengths.push("Supports arguments with concrete examples");
  }
  if (strengths.length === 0 && scoreBreakdown.base === 40) {
    strengths.push("Strong debate foundation");
  }

  // Check for weaknesses
  if (!scoreBreakdown.claim_bonus || scoreBreakdown.claim_bonus !== 10) {
    weaknesses.push("Missing clear position statement - start with 'Claim:'");
    promptSuggestions.push(
      "Try this prompt: 'Start with Claim: [your position], then provide 2-3 supporting reasons'"
    );
  }
  if (
    !scoreBreakdown.counterargument_bonus ||
    scoreBreakdown.counterargument_bonus !== 10
  ) {
    weaknesses.push("No counterarguments - acknowledge opposing views");
    promptSuggestions.push(
      "Try this prompt: 'State your position, then acknowledge opposing views with However... [rebuttal]'"
    );
  }
  if (!scoreBreakdown.example_bonus || scoreBreakdown.example_bonus !== 10) {
    weaknesses.push("Lacks supporting examples - add specific cases");
    promptSuggestions.push(
      "Try this prompt: 'For each argument, include Example: [specific real-world case]'"
    );
  }

  // Generate next drills based on weaknesses
  if (!scoreBreakdown.claim_bonus) {
    nextDrills.push({
      challengeType: "debate",
      presetTitle: "Position Statement",
      presetInput:
        "Topic: Should homework be banned? Start with 'Claim: [Yes or No]', then provide 3 reasons to support your position.",
    });
  }
  if (!scoreBreakdown.counterargument_bonus) {
    nextDrills.push({
      challengeType: "debate",
      presetTitle: "Balanced Arguments",
      presetInput:
        "Topic: Remote work vs. Office work. Take a position, acknowledge the opposing view with 'However...', then provide a rebuttal.",
    });
  }
  if (!scoreBreakdown.example_bonus) {
    nextDrills.push({
      challengeType: "debate",
      presetTitle: "Evidence-Based Debate",
      presetInput:
        "Topic: Social media's impact. Make a claim, support it with 'Example: [specific cases]', and conclude with a summary.",
    });
  }

  // Add general debate drills if needed
  if (nextDrills.length < 3) {
    nextDrills.push({
      challengeType: "debate",
      presetTitle: "Structured Argumentation",
      presetInput:
        "Pick a controversial topic. Structure your argument as: Claim: [position], Reason 1: [evidence], Reason 2: [evidence], However: [counterargument], Rebuttal: [response].",
    });
  }

  return { strengths, weaknesses, promptSuggestions, nextDrills };
}

// Creativity Challenge Coach Report Generator
function generateCreativityReport(
  scoreBreakdown: ScoreBreakdown,
  outputText: string
): Omit<CoachReport, "recommendedFocus"> {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const promptSuggestions: string[] = [];
  const nextDrills: NextDrill[] = [];

  // Check for strengths
  if (scoreBreakdown.title_bonus === 10) {
    strengths.push("Includes creative title");
  }
  if (scoreBreakdown.section_bonus === 10) {
    strengths.push("Well-structured with 3+ sections");
  }
  if (scoreBreakdown.variety_bonus === 10) {
    strengths.push("Rich vocabulary with good word variety");
  }
  if (strengths.length === 0 && scoreBreakdown.base === 40) {
    strengths.push("Strong creative foundation");
  }

  // Check for weaknesses
  if (!scoreBreakdown.title_bonus || scoreBreakdown.title_bonus !== 10) {
    weaknesses.push("Missing title - add a creative heading");
    promptSuggestions.push(
      "Try this prompt: 'Write a story with Title: [creative name] at the top'"
    );
  }
  if (!scoreBreakdown.section_bonus || scoreBreakdown.section_bonus !== 10) {
    weaknesses.push("Lacks structure - divide into 3+ sections");
    promptSuggestions.push(
      "Try this prompt: 'Structure your story with Part 1: Beginning, Part 2: Middle, Part 3: End'"
    );
  }
  if (!scoreBreakdown.variety_bonus || scoreBreakdown.variety_bonus !== 10) {
    weaknesses.push("Limited vocabulary - use more diverse words");
    promptSuggestions.push(
      "Try this prompt: 'Use rich, varied vocabulary throughout your writing'"
    );
  }
  if (scoreBreakdown.too_short_penalty === -10) {
    weaknesses.push("Story too short - expand narrative");
    promptSuggestions.push(
      "Try this prompt: 'Write a detailed narrative (at least 80 characters) with vivid descriptions'"
    );
  }

  // Generate next drills based on weaknesses
  if (!scoreBreakdown.title_bonus) {
    nextDrills.push({
      challengeType: "creativity",
      presetTitle: "Title Practice",
      presetInput:
        "Write a short story titled 'The Last Message'. Include a creative title, then tell the story of receiving an unexpected message that changes everything.",
    });
  }
  if (!scoreBreakdown.section_bonus) {
    nextDrills.push({
      challengeType: "creativity",
      presetTitle: "Structured Story",
      presetInput:
        "Write a story titled 'Journey Home'. Divide it into: Part 1: The Departure, Part 2: The Challenge, Part 3: The Return, Part 4: The Aftermath.",
    });
  }
  if (!scoreBreakdown.variety_bonus) {
    nextDrills.push({
      challengeType: "creativity",
      presetTitle: "Vocabulary Challenge",
      presetInput:
        "Write about 'A World Without Technology'. Use diverse, descriptive language throughout. Include Title: at the top and 3+ sections.",
    });
  }

  // Add general creativity drills if needed
  if (nextDrills.length < 3) {
    nextDrills.push({
      challengeType: "creativity",
      presetTitle: "Imaginative Prompt",
      presetInput:
        "Write a story where the main character discovers they can communicate with objects. Title: 'The Whispering Objects'. Structure with 3+ sections.",
    });
  }

  return { strengths, weaknesses, promptSuggestions, nextDrills };
}

// Main Coach Report Generator
export function generateCoachReport(
  challengeType: "logic" | "debate" | "creativity",
  scoreBreakdown: ScoreBreakdown,
  inputText: string,
  outputText: string
): CoachReport {
  let report: Omit<CoachReport, "recommendedFocus">;

  // Generate challenge-specific report
  if (challengeType === "logic") {
    report = generateLogicReport(scoreBreakdown, outputText);
  } else if (challengeType === "debate") {
    report = generateDebateReport(scoreBreakdown);
  } else {
    // creativity
    report = generateCreativityReport(scoreBreakdown, outputText);
  }

  // Determine recommended focus based on score and challenge type
  let recommendedFocus: "LOGIC" | "DEBATE" | "CREATIVITY" | "GENERAL";

  const tier = getPerformanceTier(
    Object.values(scoreBreakdown).reduce((sum, val) => sum + val, 0)
  );

  if (tier === "excellent") {
    recommendedFocus = "GENERAL";
  } else if (tier === "good") {
    recommendedFocus = challengeType.toUpperCase() as "LOGIC" | "DEBATE" | "CREATIVITY";
  } else {
    // needs_improvement
    recommendedFocus = challengeType.toUpperCase() as "LOGIC" | "DEBATE" | "CREATIVITY";
  }

  return {
    ...report,
    recommendedFocus,
  };
}
