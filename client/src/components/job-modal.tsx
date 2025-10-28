import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus } from "lucide-react";
import { useCreateJob, useUpdateJob } from "@/lib/mutations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TagChip } from "@/components/tag-chip";
import type { Job, InsertJob } from "@shared/schema";
import { insertJobSchema } from "@shared/schema";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
}

export function JobModal({ isOpen, onClose, job }: JobModalProps) {
  const [tags, setTags] = useState<string[]>(job?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const isEditing = !!job;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: job
      ? { title: job.title, slug: job.slug, status: job.status, tags: job.tags, order: job.order }
      : { status: "active", tags: [], order: 0 },
  });

  const status = watch("status");

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        slug: job.slug,
        status: job.status,
        tags: job.tags,
        order: job.order,
      });
      setTags(job.tags);
    } else {
      reset({ status: "active", tags: [], order: 0 });
      setTags([]);
    }
  }, [job, reset]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const onSubmit = async (data: InsertJob) => {
    try {
      if (isEditing && job) {
        await updateJob.mutateAsync({ id: job.id, data: { ...data, tags } });
      } else {
        await createJob.mutateAsync({ ...data, tags });
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-job">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {isEditing ? "Edit Job" : "Create New Job"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Senior Software Engineer"
                {...register("title")}
                data-testid="input-job-title"
              />
              {errors.title && (
                <p className="text-sm text-destructive" data-testid="error-title">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="e.g., senior-software-engineer"
                {...register("slug")}
                className="font-mono text-sm"
                data-testid="input-job-slug"
              />
              {errors.slug && (
                <p className="text-sm text-destructive" data-testid="error-slug">
                  {errors.slug.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be unique. Used in the job URL.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  data-testid="input-tag"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  data-testid="button-add-tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <TagChip key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="archive-toggle">
                  {status === "archived" ? "Archived" : "Active"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {status === "archived"
                    ? "This job is archived and not accepting applications"
                    : "This job is active and accepting applications"}
                </p>
              </div>
              <Switch
                id="archive-toggle"
                checked={status === "archived"}
                onCheckedChange={(checked) =>
                  setValue("status", checked ? "archived" : "active")
                }
                data-testid="switch-job-status"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="button-save-job">
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
