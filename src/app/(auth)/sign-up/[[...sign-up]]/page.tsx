import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="animate-[fade-up_0.6s_ease-out_both]">
      <SignUp fallbackRedirectUrl="/onboarding" />
    </div>
  );
}
