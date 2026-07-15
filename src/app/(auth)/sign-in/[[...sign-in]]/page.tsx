import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="animate-[fade-up_0.6s_ease-out_both]">
      <SignIn fallbackRedirectUrl="/onboarding" />
    </div>
  );
}
