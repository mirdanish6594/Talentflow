import { z } from "zod";

// ===== JOB SCHEMAS =====
export const jobSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(["active", "archived"]),
  tags: z.array(z.string()),
  order: z.number(),
  createdAt: z.string(),
});

export const insertJobSchema = jobSchema.omit({ id: true, createdAt: true });
export const updateJobSchema = insertJobSchema.partial();

export type Job = z.infer<typeof jobSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type UpdateJob = z.infer<typeof updateJobSchema>;

// ===== CANDIDATE SCHEMAS =====
export const candidateStageSchema = z.enum([
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
]);

export const candidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  jobId: z.string(),
  stage: candidateStageSchema,
  appliedDate: z.string(),
  avatarUrl: z.string().optional(),
});

export const insertCandidateSchema = candidateSchema.omit({
  id: true,
  appliedDate: true,
});

export type Candidate = z.infer<typeof candidateSchema>;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type CandidateStage = z.infer<typeof candidateStageSchema>;

// ===== TIMELINE SCHEMAS =====
export const timelineEventSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  eventType: z.enum(["stage_change", "note_added", "assessment_completed"]),
  fromStage: candidateStageSchema.optional(),
  toStage: candidateStageSchema.optional(),
  note: z.string().optional(),
  timestamp: z.string(),
  userId: z.string(),
  userName: z.string(),
});

export type TimelineEvent = z.infer<typeof timelineEventSchema>;

// ===== NOTE SCHEMAS =====
export const noteSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  content: z.string(),
  author: z.string(),
  authorId: z.string(),
  mentions: z.array(z.string()),
  timestamp: z.string(),
});

export const insertNoteSchema = noteSchema.omit({ id: true, timestamp: true });

export type Note = z.infer<typeof noteSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;

// ===== ASSESSMENT SCHEMAS =====
export const questionTypeSchema = z.enum([
  "single-choice",
  "multi-choice",
  "short-text",
  "long-text",
  "numeric",
  "file-upload",
]);

export const questionSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  text: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for choice types
  minValue: z.number().optional(), // for numeric
  maxValue: z.number().optional(), // for numeric
  maxLength: z.number().optional(), // for text types
  conditionalOn: z.string().optional(), // question ID to depend on
  conditionalValue: z.string().optional(), // value that triggers display
});

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(questionSchema),
});

export const assessmentSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  sections: z.array(sectionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertAssessmentSchema = assessmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

// ===== ASSESSMENT RESPONSE SCHEMAS =====
export const answerSchema = z.object({
  questionId: z.string(),
  value: z.union([
    z.string(),
    z.array(z.string()),
    z.number(),
    z.null(),
  ]),
});

export const assessmentResponseSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  candidateId: z.string(),
  answers: z.array(answerSchema),
  submittedAt: z.string(),
  completionTime: z.number(), // in seconds
});

export const insertAssessmentResponseSchema = assessmentResponseSchema.omit({
  id: true,
  submittedAt: true,
});

export type Answer = z.infer<typeof answerSchema>;
export type AssessmentResponse = z.infer<typeof assessmentResponseSchema>;
export type InsertAssessmentResponse = z.infer<typeof insertAssessmentResponseSchema>;

// ===== TEAM MEMBER SCHEMAS (for @mentions) =====
export const teamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().optional(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

// ===== PAGINATION & FILTERING =====
export const paginationSchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(12),
  total: z.number(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;

// API Query params
export const jobsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["active", "archived", "all"]).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sort: z.enum(["order", "title", "createdAt"]).optional(),
});

export const candidatesQuerySchema = z.object({
  search: z.string().optional(),
  stage: candidateStageSchema.optional(),
  jobId: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export type JobsQuery = z.infer<typeof jobsQuerySchema>;
export type CandidatesQuery = z.infer<typeof candidatesQuerySchema>;
