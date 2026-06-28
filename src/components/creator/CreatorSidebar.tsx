import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedInfluencer } from "@/lib/queries/influencer";
import { CreatorSidebarClient } from "@/components/creator/CreatorSidebarClient";

export async function CreatorSidebar() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const influencer = await getCachedInfluencer(userId);

  return (
    <CreatorSidebarClient
      displayName={influencer.display_name ?? "Creator"}
      verified={influencer.verified}
    />
  );
}
