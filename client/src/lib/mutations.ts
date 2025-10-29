import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Job, Candidate, Note, Assessment, InsertJob, InsertNote } from "@shared/schema";

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertJob) => {
      return await apiRequest("POST", "/api/jobs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success",
        description: "Job created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      return await apiRequest("PATCH", `/api/jobs/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", variables.id] });
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    },
  });
}

export function useReorderJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, fromOrder, toOrder }: { id: string; fromOrder: number; toOrder: number }) => {
      return await apiRequest("PATCH", `/api/jobs/${id}/reorder`, { fromOrder, toOrder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Reorder Failed",
        description: "Could not reorder job. Changes have been rolled back.",
        variant: "destructive",
      });
    },
  });
}


// 1. Define a type for all variables passed to mutate()
type UpdateCandidateVars = {
  id: string;
  data: Partial<Candidate>;
  candidateName?: string;
  newStageName?: string;
};

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    // 2. Use the new type for the mutation function
    mutationFn: async (variables: UpdateCandidateVars) => {
      // Only send the ID and data to the API
      const { id, data } = variables;
      return await apiRequest("PATCH", `/api/candidates/${id}`, data);
    },
    // 3. Use the new type for the onSuccess callback
    onSuccess: (_, variables: UpdateCandidateVars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates", variables.id, "timeline"] });
      
      if (variables.data.stage) {
        // 4. Create the detailed description
        const description =
          variables.candidateName && variables.newStageName
            ? `Moved ${variables.candidateName} to ${variables.newStageName}.`
            : "Candidate stage updated";

        toast({
          title: "Success",
          description: description,
        });
      }
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Error",
        description: error.message || "Failed to update candidate",
        variant: "destructive",
      });
    },
  });
}
// --- END UPDATE ---

export function useAddNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ candidateId, data }: { candidateId: string; data: InsertNote }) => {
      return await apiRequest("POST", `/api/candidates/${candidateId}/notes`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates", variables.candidateId, "notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates", variables.candidateId, "timeline"] });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    },
  });
}

export function useSaveAssessment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: Omit<Assessment, "id" | "createdAt" | "updatedAt"> }) => {
      return await apiRequest("PUT", `/api/assessments/${jobId}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments", variables.jobId] });
      toast({
        title: "Success",
        description: "Assessment saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment",
        variant: "destructive",
      });
    },
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/assessments/${data.jobId}/submit`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assessment submitted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit assessment",
        variant: "destructive",
      });
    },
  });
}