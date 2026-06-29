import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getOnboardingState } from "@/app/(auth)/onboarding/actions";

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-up", url));
  }

  const onboarding = await getOnboardingState();

  if (onboarding.role === "brand" && onboarding.name) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  if (onboarding.role === "influencer" && onboarding.name) {
    return NextResponse.redirect(new URL("/creator", url));
  }

  return NextResponse.redirect(new URL("/onboarding", url));
}
