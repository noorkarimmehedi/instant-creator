import { Webhook } from "svix";
import { headers } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } =
      event.data as {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name: string | null;
        last_name: string | null;
        unsafe_metadata?: { role?: string };
      };

    const email = email_addresses[0]?.email_address ?? "";
    const name =
      [first_name, last_name].filter(Boolean).join(" ") || "My Brand";
    const role = unsafe_metadata?.role;

    const supabase = createSupabaseAdmin();

    if (role === "influencer") {
      await supabase.from("influencers").insert({
        clerk_user_id: id,
        email,
        display_name: name === "My Brand" ? null : name,
      });
    } else {
      await supabase.from("brands").insert({
        clerk_user_id: id,
        email,
        name,
      });
    }
  }

  return NextResponse.json({ received: true });
}
