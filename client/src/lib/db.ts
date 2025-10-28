import Dexie, { Table } from "dexie";
import type {
  Job,
  Candidate,
  Assessment,
  AssessmentResponse,
  TimelineEvent,
  Note,
  TeamMember,
} from "@shared/schema";

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;
  assessmentResponses!: Table<AssessmentResponse, string>;
  timelineEvents!: Table<TimelineEvent, string>;
  notes!: Table<Note, string>;
  teamMembers!: Table<TeamMember, string>;

  constructor() {
    super("TalentFlowDB");
    this.version(1).stores({
      jobs: "id, status, order, slug",
      candidates: "id, jobId, stage, email, name",
      assessments: "id, jobId",
      assessmentResponses: "id, assessmentId, candidateId",
      timelineEvents: "id, candidateId, timestamp",
      notes: "id, candidateId, timestamp",
      teamMembers: "id, email",
    });
  }
}

export const db = new TalentFlowDB();
