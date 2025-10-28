import { Card } from "@/components/ui/card";
import { StageBadge } from "@/components/status-badge";
import { Clock, ArrowRight, FileText, CheckCircle } from "lucide-react";
import type { TimelineEvent } from "@shared/schema";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const getEventIcon = (type: TimelineEvent["eventType"]) => {
    switch (type) {
      case "stage_change":
        return ArrowRight;
      case "note_added":
        return FileText;
      case "assessment_completed":
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getEventDescription = (event: TimelineEvent) => {
    switch (event.eventType) {
      case "stage_change":
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span>Moved from</span>
            {event.fromStage && <StageBadge stage={event.fromStage} />}
            <ArrowRight className="h-4 w-4" />
            {event.toStage && <StageBadge stage={event.toStage} />}
          </div>
        );
      case "note_added":
        return <span>Added a note</span>;
      case "assessment_completed":
        return <span>Completed assessment</span>;
      default:
        return <span>Activity recorded</span>;
    }
  };

  if (events.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">No timeline events</h3>
            <p className="text-sm text-muted-foreground">
              Activity history will appear here as the candidate progresses
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-6">Activity Timeline</h3>
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = getEventIcon(event.eventType);
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="flex gap-4" data-testid={`timeline-event-${event.id}`}>
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-full border-2 bg-card flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {!isLast && (
                  <div className="w-0.5 bg-border flex-1 my-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{getEventDescription(event)}</div>
                    {event.note && (
                      <p className="text-sm text-muted-foreground mt-2 p-3 rounded-lg bg-muted">
                        {event.note}
                      </p>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleString()}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">
                  by {event.userName}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
