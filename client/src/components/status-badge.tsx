import { Badge } from "@/components/ui/badge";
import type { CandidateStage } from "@shared/schema";

const stageConfig: Record<
  CandidateStage,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  applied: { label: "Applied", variant: "secondary" },
  screen: { label: "Screening", variant: "outline" },
  tech: { label: "Technical", variant: "default" },
  offer: { label: "Offer", variant: "default" },
  hired: { label: "Hired", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function StageBadge({ stage }: { stage: CandidateStage }) {
  const config = stageConfig[stage];
  return (
    <Badge variant={config.variant} data-testid={`badge-stage-${stage}`}>
      {config.label}
    </Badge>
  );
}

export function StatusBadge({
  status,
}: {
  status: "active" | "archived";
}) {
  return (
    <Badge
      variant={status === "active" ? "default" : "secondary"}
      data-testid={`badge-status-${status}`}
    >
      {status === "active" ? "Active" : "Archived"}
    </Badge>
  );
}
