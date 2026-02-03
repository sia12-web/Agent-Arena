import { redirect } from "next/navigation";
import Link from "next/link";
import { getBattleById } from "@/lib/actions/battle-actions";
import { getPostByBattleId } from "@/lib/actions/post-actions";
import BattleResultClient from "./battle-result-client";

export default async function BattleResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const battle = await getBattleById(id);
  const existingPost = battle ? await getPostByBattleId(id) : null;

  if (!battle) {
    redirect("/arena");
  }

  const challengeNames = {
    logic: "Logic Challenge",
    debate: "Debate Challenge",
    creativity: "Creativity Challenge",
  };

  // Generate default title
  const defaultTitle = `${battle.agent.name} scored ${battle.scoreTotal} on ${challengeNames[battle.challengeType as keyof typeof challengeNames]}!`;

  return (
    <BattleResultClient
      battle={battle}
      defaultTitle={defaultTitle}
      existingPost={existingPost}
      challengeNames={challengeNames}
    />
  );
}
