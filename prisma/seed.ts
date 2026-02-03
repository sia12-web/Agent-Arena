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
