// client/src/lib/init-db.ts

import { db } from "./db";
import { faker } from "@faker-js/faker";
import type { Job, Candidate, Assessment, CandidateStage } from "@shared/schema";

const JOB_COUNT = 25;
const CANDIDATE_COUNT = 1000;
const STAGES: CandidateStage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

export async function initializeDatabase() {
  try {
    // === ADD THESE LINES TO FORCE CLEAR ===
    console.log("Forcibly clearing database for development...");
    await db.delete(); // Delete the database
    await db.open();   // Re-open the connection
    // ======================================

    // Check if data already exists
    const jobCount = await db.jobs.count();
    if (jobCount > 0) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding database...");

    // === 1. Create Jobs ===
    const jobs: Job[] = [];
    for (let i = 0; i < JOB_COUNT; i++) {
      const title = faker.person.jobTitle();
      jobs.push({
        id: crypto.randomUUID(),
        title: title,
        slug: faker.helpers.slugify(title).toLowerCase() + "-" + i,
        status: faker.helpers.arrayElement(["active", "archived"]),
        tags: faker.helpers.arrayElements(["Engineering", "Remote", "Full-time"], {
          min: 1,
          max: 3,
        }),
        order: i,
        createdAt: faker.date.past().toISOString(),
      });
    }
    await db.jobs.bulkAdd(jobs);
    console.log(`Added ${jobs.length} jobs.`);

    // === 2. Create Candidates ===
    const candidates: Candidate[] = [];
    for (let i = 0; i < CANDIDATE_COUNT; i++) {
      candidates.push({
        id: crypto.randomUUID(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        stage: faker.helpers.arrayElement(STAGES),
        jobId: faker.helpers.arrayElement(jobs).id,
        appliedDate: faker.date.past().toISOString(),
        avatarUrl: faker.image.avatar(),
      });
    }
    await db.candidates.bulkAdd(candidates);
    console.log(`Added ${candidates.length} candidates.`);

    // === 3. Create Assessments ===
    const assessments: Assessment[] = [];
    // Just create 3 for the first 3 jobs
    for (let i = 0; i < 3; i++) {
      assessments.push({
        id: crypto.randomUUID(),
        jobId: jobs[i].id,
        title: `${jobs[i].title} - Skills Assessment`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: [
          {
            id: crypto.randomUUID(),
            title: "General Logic",
            questions: [
              {
                id: crypto.randomUUID(),
                type: "single-choice",
                text: "What is 2 + 2?",
                options: ["3", "4", "5"],
                required: true,
              },
              {
                id: crypto.randomUUID(),
                type: "short-text",
                text: "What is the capital of France?",
                required: true,
              },
            ],
          },
          {
            id: crypto.randomUUID(),
            title: "Role-Specific Skills",
            questions: [
              {
                id: crypto.randomUUID(),
                type: "long-text",
                text: "Describe a complex project you worked on.",
                required: true,
              },
            ],
          },
        ],
      });
    }
    await db.assessments.bulkAdd(assessments);
    console.log(`Added ${assessments.length} assessments.`);
    
    console.log("Database seeding complete.");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}