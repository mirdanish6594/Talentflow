import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Mail, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StageBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline } from "@/components/timeline";
import { NotesList } from "@/components/notes-list";
import type { Candidate, TimelineEvent, Note } from "@shared/schema";

export default function CandidateProfile() {
  const [, params] = useRoute("/candidates/:id");
  const candidateId = params?.id;

  const { data: candidate, isLoading } = useQuery<Candidate>({
    queryKey: ["/api/candidates", candidateId],
    enabled: !!candidateId,
  });

  const { data: timeline } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/candidates", candidateId, "timeline"],
    enabled: !!candidateId,
  });

  const { data: notes } = useQuery<Note[]>({
    queryKey: ["/api/candidates", candidateId, "notes"],
    enabled: !!candidateId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4" />
        <Card className="p-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button asChild className="mt-4">
          <Link href="/candidates">Back to Candidates</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4" data-testid="button-back">
          <Link href="/candidates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Link>
        </Button>
      </div>

      <Card className="p-8">
        <div className="flex items-start gap-6 flex-wrap">
          <Avatar className="h-20 w-20">
            <AvatarImage src={candidate.avatarUrl} />
            <AvatarFallback className="text-2xl">
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold mb-2" data-testid="text-candidate-name">
              {candidate.name}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span data-testid="text-candidate-email">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Job ID: {candidate.jobId}</span>
              </div>
            </div>
            <StageBadge stage={candidate.stage} />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline" data-testid="tab-timeline">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="notes" data-testid="tab-notes">
            Notes
          </TabsTrigger>
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Timeline events={timeline || []} />
        </TabsContent>

        <TabsContent value="notes">
          <NotesList candidateId={candidate.id} notes={notes || []} />
        </TabsContent>

        <TabsContent value="overview">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Application Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Candidate ID</span>
                <span className="font-mono">{candidate.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Current Stage</span>
                <StageBadge stage={candidate.stage} />
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Applied Date</span>
                <span>{new Date(candidate.appliedDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Job Position</span>
                <Link href={`/jobs/${candidate.jobId}`}>
                  <span className="text-primary hover:underline">View Job →</span>
                </Link>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
