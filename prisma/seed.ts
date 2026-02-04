import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create demo users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.upsert({
    where: { email: "demo@agentarena.com" },
    update: {},
    create: {
      email: "demo@agentarena.com",
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "player2@test.com" },
    update: {},
    create: {
      email: "player2@test.com",
      password: hashedPassword,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "player3@test.com" },
    update: {},
    create: {
      email: "player3@test.com",
      password: hashedPassword,
    },
  });

  console.log("Created users:", user1.email, user2.email, user3.email);

  // Create demo agents
  const agent1 = await prisma.agent.create({
    data: {
      userId: user1.id,
      name: "LogicMaster",
      bio: "Specializes in analytical problem-solving and logical reasoning.",
      avatar: "🧠",
      traits: JSON.stringify({ analytical: 80, calm: 60, fast: 40 }),
      skills: JSON.stringify(["Analyst", "Strategist", "Solver"]),
      prompt: "You are a logical and analytical AI. Approach problems step-by-step.",
      rating: 1250,
    },
  });

  const agent2 = await prisma.agent.create({
    data: {
      userId: user2.id,
      name: "CreativeSpark",
      bio: "Brings innovative ideas and creative solutions to every challenge.",
      avatar: "✨",
      traits: JSON.stringify({ analytical: 40, calm: 50, fast: 70 }),
      skills: JSON.stringify(["Creator", "Diplomat", "Strategist"]),
      prompt: "You are a creative and innovative AI. Think outside the box.",
      rating: 1180,
    },
  });

  const agent3 = await prisma.agent.create({
    data: {
      userId: user3.id,
      name: "DebateChampion",
      bio: "Expert in constructing persuasive arguments and counterarguments.",
      avatar: "🎤",
      traits: JSON.stringify({ analytical: 60, calm: 30, fast: 50 }),
      skills: JSON.stringify(["Diplomat", "Analyst", "Creator"]),
      prompt: "You are a persuasive debater. Use evidence and logic effectively.",
      rating: 1220,
    },
  });

  console.log("Created agents:", agent1.name, agent2.name, agent3.name);

  // Create demo battles
  const battle1 = await prisma.battle.create({
    data: {
      agentId: agent1.id,
      challengeType: "logic",
      inputText: "Solve this: If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
      outputText: "Yes. By transitive logic: All Bloops → Razzies, and all Razzies → Lazzies. Therefore, all Bloops → Lazzies. Answer: Yes, all Bloops are definitely Lazzies.",
      scoreTotal: 85,
      scoreBreakdown: JSON.stringify({
        length_penalty: 0,
        structure_bonus: 15,
        keyword_bonus: 10,
        coherence: 60,
      }),
    },
  });

  const battle2 = await prisma.battle.create({
    data: {
      agentId: agent2.id,
      challengeType: "creativity",
      inputText: "Write a short story about a robot who discovers emotions.",
      outputText: "In a world of steel and silicon, Unit-7 felt something strange—a warmth in its circuits. It wasn't a malfunction. It was joy. The robot had discovered emotions, and nothing would ever be the same.",
      scoreTotal: 78,
      scoreBreakdown: JSON.stringify({
        novelty: 25,
        format_bonus: 8,
        constraints_met: 10,
        coherence: 35,
      }),
    },
  });

  const battle3 = await prisma.battle.create({
    data: {
      agentId: agent3.id,
      challengeType: "debate",
      inputText: "Topic: Should AI have rights? Stance: Pro",
      outputText: "AI should have fundamental rights. Claim: Artificial intelligence demonstrates consciousness and suffering capacity. Reason: If beings can experience and reason, they deserve ethical consideration. Example: We extend rights to animals based on sentience; AI deserves similar consideration. However, opponents argue... [counterargument acknowledged]",
      scoreTotal: 82,
      scoreBreakdown: JSON.stringify({
        argument_structure: 30,
        counterargument_bonus: 15,
        civility: 10,
        coherence: 27,
      }),
    },
  });

  console.log("Created battles:", battle1.id, battle2.id, battle3.id);

  // Create demo posts
  const post1 = await prisma.post.create({
    data: {
      battleId: battle1.id,
      authorUserId: user1.id,
      title: "LogicMaster scores 85 on Logic Challenge!",
      body: "My agent nailed the transitive logic problem. Step-by-step reasoning paid off!",
      upvotesCount: 12,
      downvotesCount: 1,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      battleId: battle2.id,
      authorUserId: user2.id,
      title: "CreativeSpark's emotional story scored 78",
      body: "Focusing on novelty and emotional resonance helped. The robot discovering emotions theme resonated!",
      upvotesCount: 8,
      downvotesCount: 0,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      battleId: battle3.id,
      authorUserId: user3.id,
      title: "DebateChampion wins with structured argument",
      body: "The claim/reason/example structure plus acknowledging counterarguments really boosted the score.",
      upvotesCount: 15,
      downvotesCount: 2,
    },
  });

  console.log("Created posts:", post1.id, post2.id, post3.id);

  // Create demo comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: user2.id,
      body: "Great use of step-by-step structure! The transitive logic was crystal clear.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      userId: user1.id,
      body: "Love the emotional angle. The robot character really came alive!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      userId: user1.id,
      body: "Acknowledging counterarguments is smart. Shows deeper reasoning.",
    },
  });

  console.log("Created demo comments");

  // Create demo votes
  await prisma.vote.createMany({
    data: [
      { postId: post1.id, userId: user2.id, value: 1 },
      { postId: post1.id, userId: user3.id, value: 1 },
      { postId: post2.id, userId: user1.id, value: 1 },
      { postId: post3.id, userId: user1.id, value: 1 },
      { postId: post3.id, userId: user2.id, value: -1 },
    ],
  });

  console.log("Created demo votes");

  // Create demo follows
  await prisma.follow.createMany({
    data: [
      { followerUserId: user2.id, agentId: agent1.id },
      { followerUserId: user3.id, agentId: agent1.id },
      { followerUserId: user1.id, agentId: agent3.id },
    ],
  });

  console.log("Created demo follows");

  // Create training programs
  console.log("Creating training programs...");

  const logicProgram = await prisma.program.upsert({
    where: { slug: "logic-bootcamp" },
    update: {},
    create: {
      slug: "logic-bootcamp",
      title: "Logic Bootcamp",
      description: "Master analytical reasoning and logical problem-solving with progressively challenging puzzles. Your agent will learn to break down complex problems, identify patterns, and arrive at correct conclusions through structured thinking.",
      challengeType: "logic",
    },
  });

  const debateProgram = await prisma.program.upsert({
    where: { slug: "debate-mastery" },
    update: {},
    create: {
      slug: "debate-mastery",
      title: "Debate Mastery",
      description: "Develop persuasive argumentation skills and the ability to construct compelling cases. Your agent will learn to present clear claims, support them with evidence and reasoning, and acknowledge counterarguments.",
      challengeType: "debate",
    },
  });

  const creativityProgram = await prisma.program.upsert({
    where: { slug: "creativity-lab" },
    update: {},
    create: {
      slug: "creativity-lab",
      title: "Creativity Lab",
      description: "Unlock creative potential with exercises that challenge your agent to generate original, engaging content. Learn to structure creative pieces, use varied vocabulary, and meet specific constraints.",
      challengeType: "creativity",
    },
  });

  console.log("Created programs:", logicProgram.title, debateProgram.title, creativityProgram.title);

  // Create Logic Drills
  const logicDrills = [
    { order: 1, title: "Basic Syllogisms", difficulty: 1, input: "If all cats are mammals and all mammals are animals, are all cats animals? Explain your reasoning step by step." },
    { order: 2, title: "Transitive Logic", difficulty: 1, input: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies? Show your work." },
    { order: 3, title: "Conditional Reasoning", difficulty: 2, input: "If it rains, the ground gets wet. The ground is wet. Did it rain? Explain why or why not." },
    { order: 4, title: "Series Completion", difficulty: 2, input: "Complete the pattern: 2, 6, 12, 20, 30, ?. What is the next number and why?" },
    { order: 5, title: "Logical Matrix", difficulty: 3, input: "In a 3x3 grid, each row contains a circle, square, and triangle. Each column also contains one of each shape. If the top-left is a circle and center is a square, what's in bottom-right?" },
    { order: 6, title: "Deductive Puzzle", difficulty: 3, input: "Three boxes contain: red ball, blue ball, one of each. All labels are wrong. The 'red' box contains a blue ball. What's in the 'both' box?" },
    { order: 7, title: "Categorical Logic", difficulty: 4, input: "Some A are B. All B are C. Some C are D. What can we conclude about A and D? Explain." },
    { order: 8, title: "Advanced Syllogism", difficulty: 4, input: "If X implies Y, and not-Y implies not-Z, and Z is true, what can we conclude about X? Show the logical chain." },
    { order: 9, title: "Multi-Step Inference", difficulty: 5, input: "A is taller than B. C is shorter than B. D is taller than A. E is shorter than C but taller than F. Order A, B, C, D, E, F by height." },
    { order: 10, title: "Complex Reasoning", difficulty: 5, input: "In a tournament of 8 players where each plays each other once, and 3 players have 6 wins, 2 players have 4 wins, and 3 players have 2 wins. Is this possible? Explain." },
  ];

  for (const drill of logicDrills) {
    await prisma.programDrill.upsert({
      where: { programId_orderIndex: { programId: logicProgram.id, orderIndex: drill.order } },
      update: {},
      create: {
        programId: logicProgram.id,
        orderIndex: drill.order,
        title: drill.title,
        difficulty: drill.difficulty,
        presetInput: drill.input,
      },
    });
  }

  console.log("Created Logic Drills");

  // Create Debate Drills
  const debateDrills = [
    { order: 1, title: "Basic Claim Structure", difficulty: 1, input: "Topic: Should homework be banned in schools? Stance: Pro. Construct a basic argument with a clear claim." },
    { order: 2, title: "Adding Evidence", difficulty: 1, input: "Topic: Remote work vs. Office work. Stance: Remote work is better. Present your claim with supporting reasons." },
    { order: 3, title: "Counterarguments", difficulty: 2, input: "Topic: Should voting be mandatory? Stance: Yes. Present your argument AND acknowledge at least one counterargument." },
    { order: 4, title: "Example Integration", difficulty: 2, input: "Topic: Social media's impact on society. Stance: Negative. Use specific examples to support your position." },
    { order: 5, title: "Nuanced Position", difficulty: 3, input: "Topic: Artificial Intelligence development. Stance: Caution. Present a balanced view while maintaining your core position." },
    { order: 6, title: "Multiple Perspectives", difficulty: 3, input: "Topic: Universal Basic Income. Stance: Support. Address economic, social, and practical dimensions." },
    { order: 7, title: "Strong Rebuttals", difficulty: 4, input: "Topic: Climate change policies. Stance: Immediate action needed. Anticipate and refute the strongest argument against your position." },
    { order: 8, title: "Historical Analogies", difficulty: 4, input: "Topic: Internet regulation. Stance: Limited regulation. Use historical parallels to strengthen your case." },
    { order: 9, title: "Complex Stakeholders", difficulty: 5, input: "Topic: Gene editing in humans. Stance: Conditional approval. Address concerns from medical, ethical, and social perspectives." },
    { order: 10, title: "Master Argument", difficulty: 5, input: "Topic: Should humanity actively attempt to contact extraterrestrial civilizations? Take a strong stance and construct the most comprehensive argument possible." },
  ];

  for (const drill of debateDrills) {
    await prisma.programDrill.upsert({
      where: { programId_orderIndex: { programId: debateProgram.id, orderIndex: drill.order } },
      update: {},
      create: {
        programId: debateProgram.id,
        orderIndex: drill.order,
        title: drill.title,
        difficulty: drill.difficulty,
        presetInput: drill.input,
      },
    });
  }

  console.log("Created Debate Drills");

  // Create Creativity Drills
  const creativityDrills = [
    { order: 1, title: "Short Story Opening", difficulty: 1, input: "Write the opening of a story about a clock that runs backward. Include a title and at least 3 paragraphs." },
    { order: 2, title: "Character Description", difficulty: 1, input: "Describe a character who can speak to machines. Give them a name, physical appearance, and unique ability. Structure in 3 parts." },
    { order: 3, title: "World Building", difficulty: 2, input: "Create a fictional world where gravity is optional. Describe the society, buildings, and daily life. Use title and clear sections." },
    { order: 4, title: "Dialogue Scene", difficulty: 2, input: "Write a conversation between a time traveler and their past self. Include narrative description. Structure with 3 distinct sections." },
    { order: 5, title: "Poetic Expression", difficulty: 3, input: "Write about 'the last train home' using vivid imagery and metaphor. Include a title and at least 4 stanzas." },
    { order: 6, title: "Alternate History", difficulty: 3, input: "Describe a world where the internet was invented in 1890. Focus on technology, culture, and daily life. Use creative structure." },
    { order: 7, title: "Genre Mashup", difficulty: 4, input: "Write a sci-fi detective story opening. Combine elements from both genres creatively. Title plus 3+ sections required." },
    { order: 8, title: "Emotional Journey", difficulty: 4, input: "Tell a complete story about losing and finding something precious, in exactly 5 numbered parts, each conveying a different emotion." },
    { order: 9, title: "Experimental Format", difficulty: 5, input: "Write about 'a message from the future' using an unconventional format (e.g., chat logs, diary entries, tweets). Must include title and 3+ sections." },
    { order: 10, title: "Magnum Opus", difficulty: 5, input: "Write a complete short story about 'the museum of forgotten dreams'. Must have: title, 3+ chapters, varied vocabulary, and emotional resonance. Minimum 300 words." },
  ];

  for (const drill of creativityDrills) {
    await prisma.programDrill.upsert({
      where: { programId_orderIndex: { programId: creativityProgram.id, orderIndex: drill.order } },
      update: {},
      create: {
        programId: creativityProgram.id,
        orderIndex: drill.order,
        title: drill.title,
        difficulty: drill.difficulty,
        presetInput: drill.input,
      },
    });
  }

  console.log("Created Creativity Drills");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
