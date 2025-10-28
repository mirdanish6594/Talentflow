import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StageBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban-board";
import type { Candidate, CandidateStage } from "@shared/schema";
import { Link } from "wouter";

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<CandidateStage | "all">("all");
  const [view, setView] = useState<"list" | "kanban">("list");

  const { data, isLoading } = useQuery<{ data: Candidate[]; pagination: any }>({
    queryKey: ["/api/candidates", { search, stage: stageFilter !== "all" ? stageFilter : undefined }],
  });

  const candidates = data?.data || [];

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

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
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-candidates-title">
          Candidates
        </h1>
        <p className="text-muted-foreground">
          Manage candidate applications and track progress through hiring stages
        </p>
      </div>

      <Tabs value={view} onValueChange={(v: any) => setView(v)}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="list" data-testid="tab-list-view">
              List View
            </TabsTrigger>
            <TabsTrigger value="kanban" data-testid="tab-kanban-view">
              Kanban Board
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-4 flex-wrap mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-candidates"
            />
          </div>
          <Select value={stageFilter} onValueChange={(v: any) => setStageFilter(v)}>
            <SelectTrigger className="w-[180px]" data-testid="select-stage-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screen">Screening</SelectItem>
              <SelectItem value="tech">Technical</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <Card className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </Card>
          ) : candidates.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">No candidates found</h3>
                  <p className="text-sm text-muted-foreground">
                    {search || stageFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Candidates will appear here as they apply"}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div>
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                  <div className="w-10" />
                  <div>Name</div>
                  <div className="w-32">Stage</div>
                  <div className="w-32">Applied</div>
                  <div className="w-20" />
                </div>
                <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
                  <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const candidate = candidates[virtualRow.index];
                      return (
                        <div
                          key={candidate.id}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <Link href={`/candidates/${candidate.id}`}>
                            <div
                              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 hover-elevate cursor-pointer transition-all border-b"
                              data-testid={`row-candidate-${candidate.id}`}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={candidate.avatarUrl} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(candidate.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate" data-testid={`text-candidate-name-${candidate.id}`}>
                                  {candidate.name}
                                </p>
                                <p className="text-sm text-muted-foreground truncate" data-testid={`text-candidate-email-${candidate.id}`}>
                                  {candidate.email}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <StageBadge stage={candidate.stage} />
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                {new Date(candidate.appliedDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm text-muted-foreground">View →</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard candidates={candidates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
