import { TriangleAlert } from "lucide-react";

// Shown in idea/live-idea delete dialogs — the backend deletes an idea together with
// every follow-up chained below it.
export const FollowUpDeleteWarning = () => (
  <div className="mb-5 -mt-1 flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-3 text-left">
    <TriangleAlert className="size-4 shrink-0 mt-0.5 text-danger" />
    <p className="text-[13px] leading-5 text-gray-600 dark:text-gray-700">
      <span className="font-semibold text-danger">This can't be undone.</span>{" "}
      Any follow-ups linked to this idea will be permanently deleted along with it.
    </p>
  </div>
);
