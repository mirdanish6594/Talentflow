import { useQuery } from "@tanstack/react-query";
import { 
  Briefcase, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  Clock,
  ArrowRight,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StageBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import type { TimelineEvent } from "@shared/schema";

// Defining the types for our new data
type DashboardStats = {
  activeJobs: number;
  totalCandidates: number;
  screeningCandidates: number;
  offeredCandidates: number;
};

type RecentActivityEvent = TimelineEvent & {
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
};

// --- Helper functions for rendering activity (from timeline.tsx) ---

function getEventIcon(type: TimelineEvent["eventType"]) {
  switch (type) {
    case "stage_change":
      return ArrowRight;
    case "note_added":
      return FileText;
    case "assessment_completed":
      return ClipboardCheck;
    default:
      return Clock;
  }
};

function getEventDescription(event: RecentActivityEvent) {
  switch (event.eventType) {
    case "stage_change":
      return (
        <>
          <Link href={`/candidates/${event.candidateId}`} className="font-semibold text-primary hover:underline">{event.candidateName}</Link>
          <span> moved to </span>
          {event.toStage && <StageBadge stage={event.toStage} />}
        </>
      );
    case "note_added":
      return (
        <>
          <span>Added a note for </span>
          <Link href={`/candidates/${event.candidateId}`} className="font-semibold text-primary hover:underline">{event.candidateName}</Link>
        </>
      );
    case "assessment_completed":
      return (
        <>
          <Link href={`/candidates/${event.candidateId}`} className="font-semibold text-primary hover:underline">{event.candidateName}</Link>
          <span> completed an assessment</span>
        </>
      );
    default:
      return <span>Activity recorded</span>;
  }
};

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export default function Dashboard() {
  // --- UPDATED QUERIES ---
  const { data: statsData, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery<RecentActivityEvent[]>({
    queryKey: ["/api/timeline/recent"],
  });
  // --- END UPDATED QUERIES ---

  const stats = [
    {
      label: "Active Jobs",
      // Use data from the new query
      value: isLoadingStats ? "..." : statsData?.activeJobs ?? 0,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950",
    },
    {
      label: "Total Candidates",
      value: isLoadingStats ? "..." : statsData?.totalCandidates ?? 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-950",
    },
    {
      label: "In Screening",
      value: isLoadingStats ? "..." : statsData?.screeningCandidates ?? 0,
      icon: ClipboardCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950",
    },
    {
      label: "Offers Extended",
      value: isLoadingStats ? "..." : statsData?.offeredCandidates ?? 0,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-950",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome to TalentFlow. Here's an overview of your hiring pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover-elevate transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold" data-testid={`text-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/jobs"
              className="block p-4 rounded-lg border hover-elevate active-elevate-2 transition-all"
              data-testid="link-create-job"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Create New Job</p>
                  <p className="text-sm text-muted-foreground">
                    Add a new position to your hiring pipeline
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/candidates"
              className="block p-4 rounded-lg border hover-elevate active-elevate-2 transition-all"
              data-testid="link-view-candidates"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">View All Candidates</p>
                  <p className="text-sm text-muted-foreground">
                    Manage and review candidate applications
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/assessments"
              className="block p-4 rounded-lg border hover-elevate active-elevate-2 transition-all"
              data-testid="link-manage-assessments"
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Manage Assessments</p>
                  <p className="text-sm text-muted-foreground">
                    Create and edit job-specific assessments
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </Card>

        {/* --- RECENT ACTIVITY CARD --- */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {isLoadingActivity ? (
              // Loading Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : !recentActivity || recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity to show.
              </p>
            ) : (
              // Render real activity
              recentActivity.map(event => {
                const Icon = getEventIcon(event.eventType);
                return (
                  <div key={event.id} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 mt-1">
                      <AvatarImage src={event.candidateAvatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(event.candidateName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        {getEventDescription(event)}
                      </p>
                      <time className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </Card>
        {/* --- END UPDATED CARD --- */}
      </div>
    </div>
  );
}