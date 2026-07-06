import { DISCLAIMER } from "@/lib/constants";
import { AlertTriangle } from "lucide-react";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 ${compact ? "p-3 text-xs" : "p-4 text-sm"} text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200`}>
      <AlertTriangle className={`shrink-0 ${compact ? "h-4 w-4" : "h-5 w-5"}`} />
      <p>{DISCLAIMER}</p>
    </div>
  );
}
