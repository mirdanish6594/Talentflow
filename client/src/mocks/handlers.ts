import { http, HttpResponse, delay } from "msw";
import { db } from "@/lib/db";
import type { Job, Candidate, Assessment, TimelineEvent } from "@shared/schema";

// Artificial latency between 200-1200ms
const randomDelay = () => delay(200 + Math.random() * 1000);

// 5-10% error rate on write operations
const shouldFail = () => Math.random() < 0.075; // 7.5% average

// Define a new type for our augmented timeline event
type RecentActivityEvent = TimelineEvent & {
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
};

export const handlers = [
  // --- NEW STATS HANDLER ---
  http.get("/api/stats", async () => {
    await randomDelay();
    
    // Fetch all records without pagination
    const allJobs = await db.jobs.toArray();
    const allCandidates = await db.candidates.toArray();

    // Perform calculations on the server
    const stats = {
      activeJobs: allJobs.filter((j) => j.status === "active").length,
      totalCandidates: allCandidates.length,
      screeningCandidates: allCandidates.filter((c) => c.stage === "screen").length,
      offeredCandidates: allCandidates.filter((c) => c.stage === "offer").length,
    };

    return HttpResponse.json(stats);
  }),

  // --- RECENT ACTIVITY HANDLER ---
  http.get("/api/timeline/recent", async () => {
    await randomDelay();

    // Get all events, candidates, and jobs
    const events = await db.timelineEvents.toArray();
    const candidates = await db.candidates.toArray();
    const jobs = await db.jobs.toArray();

    // Create maps for quick lookup
    const candidateMap = new Map(candidates.map(c => [c.id, c]));
    const jobMap = new Map(jobs.map(j => [j.id, j]));

    // Sort events by date and take the top 5
    const recentEvents = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    // Augment the events with candidate and job info
    const recentActivity: RecentActivityEvent[] = recentEvents.map(event => {
      const candidate = candidateMap.get(event.candidateId);
      const job = candidate ? jobMap.get(candidate.jobId) : undefined;

      return {
        ...event,
        candidateName: candidate?.name || "Unknown Candidate",
        candidateAvatar: candidate?.avatarUrl,
        jobTitle: job?.title || "Unknown Job",
      };
    });

    return HttpResponse.json(recentActivity);
  }),

  // ===== JOBS ENDPOINTS =====
  http.get("/api/jobs", async ({ request }) => {
    await randomDelay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || "all";
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "12");
    const sort = url.searchParams.get("sort") || "order";

    let jobs = await db.jobs.toArray();

    // Filter
    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.slug.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status !== "all") {
      jobs = jobs.filter((j) => j.status === status);
    }

    // Sort
    if (sort === "order") {
      jobs.sort((a, b) => a.order - b.order);
    } else if (sort === "title") {
      jobs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "createdAt") {
      jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Paginate
    const total = jobs.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedJobs,
      pagination: { page, pageSize, total, totalPages },
    });
  }),

  http.get("/api/jobs/:id", async ({ params }) => {
    await randomDelay();
    const job = await db.jobs.get(params.id as string);
    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(job);
  }),

  http.post("/api/jobs", async ({ request }) => {
    await randomDelay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Omit<Job, "id" | "createdAt">;
    const jobs = await db.jobs.toArray();
    
    // Check for unique slug
    if (jobs.some((j) => j.slug === body.slug)) {
      return HttpResponse.json(
        { error: "Slug must be unique" },
        { status: 400 }
      );
    }

    const newJob: Job = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await db.jobs.add(newJob);
    return HttpResponse.json(newJob, { status: 201 });
  }),

  http.patch("/api/jobs/:id", async ({ params, request }) => {
    await randomDelay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }

    const id = params.id as string;
    const updates = await request.json() as Partial<Job>;
    const job = await db.jobs.get(id);

    if (!job) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedJob = { ...job, ...updates };
    await db.jobs.put(updatedJob);
    return HttpResponse.json(updatedJob);
  }),

  http.patch("/api/jobs/:id/reorder", async ({ params, request }) => {
    await randomDelay();
    
    // Simulate occasional reorder failures for rollback testing
    if (Math.random() < 0.1) {
      return new HttpResponse(null, { status: 500 });
    }

    const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    const jobs = await db.jobs.orderBy("order").toArray();

    // Reorder logic
    const movingJob = jobs.find((j) => j.order === fromOrder);
    if (!movingJob) {
      return new HttpResponse(null, { status: 404 });
    }

    if (fromOrder < toOrder) {
      // Move down
      jobs.forEach((job) => {
        if (job.order > fromOrder && job.order <= toOrder) {
          job.order--;
        }
      });
    } else {
      // Move up
      jobs.forEach((job) => {
        if (job.order >= toOrder && job.order < fromOrder) {
          job.order++;
        }
      });
    }

    movingJob.order = toOrder;

    // Update all affected jobs
    await db.jobs.bulkPut(jobs);
    return HttpResponse.json({ success: true });
  }),

  // ===== CANDIDATES ENDPOINTS =====
  http.get("/api/candidates", async ({ request }) => {
    await randomDelay();
    
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const stage = url.searchParams.get("stage");
    const jobId = url.searchParams.get("jobId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "50");

    let candidates = await db.candidates.toArray();

    // Filter
    if (search) {
      candidates = candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (stage) {
      candidates = candidates.filter((c) => c.stage === stage);
    }
    if (jobId) {
      candidates = candidates.filter((c) => c.jobId === jobId);
    }

    // Sort by applied date (most recent first)
    candidates.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());

    // Paginate
    const total = candidates.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: { page, pageSize, total, totalPages },
    });
  }),

  http.get("/api/candidates/:id", async ({ params }) => {
    await randomDelay();
    const candidate = await db.candidates.get(params.id as string);
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(candidate);
  }),

  http.patch("/api/candidates/:id", async ({ params, request }) => {
    await randomDelay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }

    const id = params.id as string;
    const updates = await request.json() as Partial<Candidate>;
    const candidate = await db.candidates.get(id);

    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedCandidate = { ...candidate, ...updates };
    await db.candidates.put(updatedCandidate);

    // Create timeline event if stage changed
    if (updates.stage && updates.stage !== candidate.stage) {
      await db.timelineEvents.add({
        id: crypto.randomUUID(),
        candidateId: id,
        eventType: "stage_change",
        fromStage: candidate.stage,
        toStage: updates.stage,
        timestamp: new Date().toISOString(),
        userId: "current-user",
        userName: "HR Manager",
      });
    }

    return HttpResponse.json(updatedCandidate);
  }),

  http.get("/api/candidates/:id/timeline", async ({ params }) => {
    await randomDelay();
    const events = await db.timelineEvents
      .where("candidateId")
      .equals(params.id as string)
      .toArray();
    
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return HttpResponse.json(events);
  }),

  http.get("/api/candidates/:id/notes", async ({ params }) => {
    await randomDelay();
    const notes = await db.notes
      .where("candidateId")
      .equals(params.id as string)
      .toArray();
    
    notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return HttpResponse.json(notes);
  }),

  http.post("/api/candidates/:id/notes", async ({ params, request }) => {
    await randomDelay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as any;
    const newNote = {
      id: crypto.randomUUID(),
      candidateId: params.id as string,
      content: body.content,
      author: body.author,
      authorId: body.authorId,
      mentions: body.mentions || [],
      timestamp: new Date().toISOString(),
    };

    await db.notes.add(newNote);
    return HttpResponse.json(newNote, { status: 201 });
  }),

  // ===== ASSESSMENTS ENDPOINTS =====
  http.get("/api/assessments", async () => {
    await randomDelay();
    const assessments = await db.assessments.toArray();
    return HttpResponse.json(assessments);
  }),

  http.get("/api/assessments/:jobId", async ({ params }) => {
    await randomDelay();
    const assessment = await db.assessments
      .where("jobId")
      .equals(params.jobId as string)
      .first();
    
    if (!assessment) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(assessment);
  }),

  http.put("/api/assessments/:jobId", async ({ params, request }) => {
    await randomDelay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as Omit<Assessment, "id" | "createdAt" | "updatedAt">;
    const existing = await db.assessments
      .where("jobId")
      .equals(params.jobId as string)
      .first();

    let assessment: Assessment;

    if (existing) {
      assessment = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };
      await db.assessments.put(assessment);
    } else {
      assessment = {
        id: crypto.randomUUID(),
        ...body,
        jobId: params.jobId as string,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.assessments.add(assessment);
    }

    return HttpResponse.json(assessment);
  }),

  http.post("/api/assessments/:jobId/submit", async ({ params, request }) => {
    await randomDelay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }

    const body = await request.json() as any;
    const response = {
      id: crypto.randomUUID(),
      assessmentId: body.assessmentId,
      candidateId: body.candidateId,
      answers: body.answers,
      submittedAt: new Date().toISOString(),
      completionTime: body.completionTime || 0,
    };

    await db.assessmentResponses.add(response);
    return HttpResponse.json(response, { status: 201 });
  }),
];