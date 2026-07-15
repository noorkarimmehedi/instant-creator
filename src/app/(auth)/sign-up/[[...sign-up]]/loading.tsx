import { Spinner } from "@/components/ui/spinner-1";

export default function Loading() {
  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading sign-up">
      <Spinner size={20} color="currentColor" />
      <span className="sr-only">Loading sign-up</span>
    </div>
  );
}
