import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ClipboardList, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Assessment, Job } from "@shared/schema";
import { Link } from "wouter";

export default function Assessments() {
  const { data: jobs } = useQuery<{ data: Job[] }>({
    queryKey: ["/api/jobs"],
  });

  const { data: assessmentsData, isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const assessments = assessmentsData || [];
  const jobsList = jobs?.data || [];

  const getJobTitle = (jobId: string) => {
    return jobsList.find((j) => j.id === jobId)?.title || "Unknown Job";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-assessments-title">
            Assessments
          </h1>
          <p className="text-muted-foreground">
            Create and manage job-specific assessments with custom questions
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsList.map((job) => {
              const assessment = assessments.find((a) => a.jobId === job.id);
              const questionCount = assessment?.sections.reduce(
                (acc, section) => acc + section.questions.length,
                0
              ) || 0;

              return (
                <Card
                  key={job.id}
                  className="p-6 hover-elevate transition-all"
                  data-testid={`card-assessment-${job.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-1 truncate">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {assessment
                          ? `${assessment.sections.length} sections, ${questionCount} questions`
                          : "No assessment configured"}
                      </p>
                    </div>
                    <Badge variant={assessment ? "default" : "secondary"}>
                      {assessment ? "Active" : "Not Set"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {assessment ? (
                      <>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          data-testid={`button-edit-assessment-${job.id}`}
                        >
                          <Link href={`/assessments/${job.id}/edit`}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="flex-1"
                          data-testid={`button-preview-assessment-${job.id}`}
                        >
                          <Link href={`/assessments/${job.id}/preview`}>
                            Preview
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        className="w-full"
                        data-testid={`button-create-assessment-${job.id}`}
                      >
                        <Link href={`/assessments/${job.id}/edit`}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Assessment
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {jobsList.length === 0 && (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">No jobs available</h3>
                  <p className="text-sm text-muted-foreground">
                    Create jobs first to configure assessments
                  </p>
                </div>
                <Button asChild data-testid="button-create-job-from-assessments">
                  <Link href="/jobs">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Job
                  </Link>
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
