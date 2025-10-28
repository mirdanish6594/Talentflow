import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Users, ClipboardList, Edit2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { TagChip } from "@/components/tag-chip";
import type { Job, Candidate } from "@shared/schema";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const jobId = params?.id;

  const { data: job, isLoading } = useQuery<Job>({
    queryKey: ["/api/jobs", jobId],
    enabled: !!jobId,
  });

  const { data: candidatesData } = useQuery<{ data: Candidate[] }>({
    queryKey: ["/api/candidates", { jobId }],
    enabled: !!jobId,
  });

  const candidates = candidatesData?.data || [];
  const candidatesByStage = {
    applied: candidates.filter((c) => c.stage === "applied").length,
    screen: candidates.filter((c) => c.stage === "screen").length,
    tech: candidates.filter((c) => c.stage === "tech").length,
    offer: candidates.filter((c) => c.stage === "offer").length,
    hired: candidates.filter((c) => c.stage === "hired").length,
    rejected: candidates.filter((c) => c.stage === "rejected").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <Card className="p-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job not found</p>
        <Button asChild className="mt-4">
          <Link href="/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4" data-testid="button-back-jobs">
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
      </div>

      <Card className="p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-semibold mb-2" data-testid="text-job-title">
              {job.title}
            </h1>
            <code className="text-sm font-mono text-muted-foreground" data-testid="text-job-slug">
              /{job.slug}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <Button variant="outline" size="icon">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Archive className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {job.tags.map((tag) => (
              <TagChip key={tag} tag={tag} readonly />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Applicants</p>
            <p className="text-2xl font-semibold" data-testid="text-total-candidates">
              {candidates.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Active Candidates</p>
            <p className="text-2xl font-semibold">
              {candidates.length - candidatesByStage.hired - candidatesByStage.rejected}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Hired</p>
            <p className="text-2xl font-semibold text-green-600">
              {candidatesByStage.hired}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Candidate Pipeline</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(candidatesByStage).map(([stage, count]) => (
              <div key={stage} className="flex justify-between items-center p-3 rounded-lg border">
                <span className="capitalize font-medium">{stage}</span>
                <span className="text-muted-foreground">{count} candidates</span>
              </div>
            ))}
          </div>
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href={`/candidates?jobId=${job.id}`}>
              View All Candidates
            </Link>
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Assessment</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Configure custom assessments for candidates applying to this position.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <Link href={`/assessments/${job.id}/edit`}>
                Configure Assessment
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href={`/assessments/${job.id}/preview`}>
                Preview Assessment
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
