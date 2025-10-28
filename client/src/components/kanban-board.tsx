// client/src/components/kanban/KanbanBoard.tsx

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Candidate, CandidateStage } from "@shared/schema";
import { Link } from "wouter";
import { useUpdateCandidate } from "@/lib/mutations";

const stages: { id: CandidateStage; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "bg-blue-100 dark:bg-blue-950" },
  { id: "screen", label: "Screening", color: "bg-yellow-100 dark:bg-yellow-950" },
  { id: "tech", label: "Technical", color: "bg-purple-100 dark:bg-purple-950" },
  { id: "offer", label: "Offer", color: "bg-green-100 dark:bg-green-950" },
  { id: "hired", label: "Hired", color: "bg-emerald-100 dark:bg-emerald-950" },
  { id: "rejected", label: "Rejected", color: "bg-red-100 dark:bg-red-950" },
];

function SortableCandidateCard({ candidate }: { candidate: Candidate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 cursor-grab active:cursor-grabbing hover-elevate"
      data-testid={`kanban-card-${candidate.id}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={candidate.avatarUrl} />
          <AvatarFallback className="text-xs">
            {getInitials(candidate.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{candidate.name}</p>
          <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
          <Link href={`/candidates/${candidate.id}`}>
            <p className="text-xs text-primary hover:underline mt-2">View profile →</p>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function KanbanColumn({
  stage,
  candidates,
  label,
  color,
}: {
  stage: CandidateStage;
  candidates: Candidate[];
  label: string;
  color: string;
}) {
  const columnCandidates = candidates.filter((c) => c.stage === stage);

  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80" data-testid={`kanban-column-${stage}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{label}</h3>
          <Badge variant="secondary" data-testid={`badge-count-${stage}`}>
            {columnCandidates.length}
          </Badge>
        </div>
      </div>
      <div className="space-y-3 min-h-[400px] rounded-lg border-2 border-dashed border-muted p-3">
        <SortableContext items={columnCandidates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {columnCandidates.map((candidate) => (
            <SortableCandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </SortableContext>
        {columnCandidates.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No candidates
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ candidates }: { candidates: Candidate[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const updateCandidate = useUpdateCandidate();

  // --- THIS FUNCTION IS UPDATED ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const activeCandidate = candidates.find((c) => c.id === activeId);

    if (!activeCandidate) return;

    let overStage: CandidateStage;

    // Check if the 'over' ID is a stage ID (e.g., "applied")
    const isOverAStage = stages.some(s => s.id === over.id);

    if (isOverAStage) {
      // Case 1: Dropped directly onto a column
      overStage = over.id as CandidateStage;
    } else {
      // Case 2: Dropped onto another candidate card.
      // We find that card's stage and use it as the destination.
      const overCandidate = candidates.find(c => c.id === over.id);
      if (!overCandidate) return; // Dropped on something invalid
      overStage = overCandidate.stage;
    }

    // Only mutate if the stage has actually changed
    if (activeCandidate.stage !== overStage) {
      // Find the human-readable label for the toast
      const newStageLabel = stages.find(s => s.id === overStage)?.label || overStage;
      
      updateCandidate.mutate({
        id: activeId,
        data: { stage: overStage },
        candidateName: activeCandidate.name,
        newStageName: newStageLabel,
      });
    }
  };
  // --- END UPDATE ---

  const activeCandidate = activeId ? candidates.find((c) => c.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage.id}
              candidates={candidates}
              label={stage.label}
              color={stage.color}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeCandidate ? (
          <Card className="p-4 shadow-2xl w-80">
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="text-xs">
                  {activeCandidate.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{activeCandidate.name}</p>
                <p className="text-xs text-muted-foreground truncate">{activeCandidate.email}</p>
              </div>
            </div>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}