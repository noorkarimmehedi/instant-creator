import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedInfluencer } from "@/lib/queries/influencer";
import { Topbar } from "@/components/dashboard/Topbar";
import { PayoutForm } from "./PayoutForm";

export default async function PayoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const influencer = await getCachedInfluencer(userId);

  return (
    <>
      <Topbar title="Add Payout Method" />
      <div className="p-4 sm:p-8 max-w-2xl animate-[fade-up_0.6s_ease-out_both]">
        <p className="text-sm text-mute mb-6">
          Step 3 of 3 — How should we pay you?
        </p>
        <PayoutForm bank={influencer.bank_account} />
      </div>
    </>
  );
}
