import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, MoreVertical, Archive, Edit2, GripVertical } from "lucide-react";
import { useUpdateJob } from "@/lib/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { TagChip } from "@/components/tag-chip";
import { JobModal } from "@/components/job-modal";
import type { Job } from "@shared/schema";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "wouter";

function SortableJobCard({ job, onEdit, onArchive }: {
  job: Job;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-6 hover-elevate transition-all duration-200"
      data-testid={`card-job-${job.id}`}
    >
      <div className="flex items-start gap-4">
        <button
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1"
          {...attributes}
          {...listeners}
          data-testid={`drag-handle-job-${job.id}`}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.id}`}>
                <h3 className="text-lg font-semibold mb-1 hover:text-primary transition-colors" data-testid={`text-job-title-${job.id}`}>
                  {job.title}
                </h3>
              </Link>
              <code className="text-xs font-mono text-muted-foreground" data-testid={`text-job-slug-${job.id}`}>
                /{job.slug}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={job.status} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid={`button-job-menu-${job.id}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit} data-testid={`menu-edit-job-${job.id}`}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onArchive} data-testid={`menu-archive-job-${job.id}`}>
                    <Archive className="h-4 w-4 mr-2" />
                    {job.status === "active" ? "Archive" : "Unarchive"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <TagChip key={tag} tag={tag} readonly />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { data, isLoading } = useQuery<{ data: Job[]; pagination: any }>({
    queryKey: ["/api/jobs", { search, status: statusFilter }],
  });

  const jobs = data?.data || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = jobs.findIndex((j) => j.id === active.id);
      const newIndex = jobs.findIndex((j) => j.id === over.id);
      
      // Optimistic update would go here
      console.log(`Reorder job ${active.id} from ${oldIndex} to ${newIndex}`);
    }
  };

  const updateJob = useUpdateJob();

  const handleArchive = (job: Job) => {
    updateJob.mutate({
      id: job.id,
      data: { status: job.status === "active" ? "archived" : "active" },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold mb-2" data-testid="text-jobs-title">
            Jobs
          </h1>
          <p className="text-muted-foreground">
            Manage your job postings, reorder priorities, and track applications
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} data-testid="button-create-job">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-jobs"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
              <p className="text-sm text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first job posting to get started"}
              </p>
            </div>
            {!search && statusFilter === "all" && (
              <Button onClick={() => setIsModalOpen(true)} data-testid="button-create-first-job">
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={jobs.map(j => j.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <SortableJobCard
                  key={job.id}
                  job={job}
                  onEdit={() => {
                    setEditingJob(job);
                    setIsModalOpen(true);
                  }}
                  onArchive={() => handleArchive(job)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        job={editingJob}
      />
    </div>
  );
}
