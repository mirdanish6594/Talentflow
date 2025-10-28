import { nanoid } from "nanoid";
import type {
  Job,
  Candidate,
  Assessment,
  TimelineEvent,
  Note,
  TeamMember,
  CandidateStage,
} from "@shared/schema";

const JOB_TITLES = [
  "Senior Software Engineer",
  "Product Manager",
  "UX Designer",
  "Data Scientist",
  "DevOps Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Marketing Manager",
  "Sales Representative",
  "Customer Success Manager",
  "Technical Writer",
  "QA Engineer",
  "Security Engineer",
  "Machine Learning Engineer",
  "Mobile Developer",
  "Engineering Manager",
  "Product Designer",
  "Content Strategist",
  "Business Analyst",
  "HR Manager",
  "Finance Analyst",
  "Operations Manager",
  "Growth Hacker",
  "UI Designer",
];

const TAGS = [
  "Remote",
  "Full-time",
  "Part-time",
  "Contract",
  "Senior",
  "Junior",
  "Mid-level",
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Urgent",
  "High Priority",
  "Entry Level",
];

const FIRST_NAMES = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
];

const STAGES: CandidateStage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomDate(start: Date, end: Date): string {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
}

export function generateJobs(count: number = 25): Job[] {
  const jobs: Job[] = [];
  const usedTitles = new Set<string>();

  for (let i = 0; i < count; i++) {
    let title: string;
    do {
      title = randomItem(JOB_TITLES);
    } while (usedTitles.has(title) && usedTitles.size < JOB_TITLES.length);
    usedTitles.add(title);

    const status = Math.random() > 0.3 ? "active" : "archived";
    const numTags = Math.floor(Math.random() * 4) + 1;

    jobs.push({
      id: nanoid(),
      title,
      slug: slugify(title),
      status: status as "active" | "archived",
      tags: randomItems(TAGS, numTags),
      order: i,
      createdAt: randomDate(new Date(2024, 0, 1), new Date()),
    });
  }

  return jobs;
}

export function generateCandidates(jobs: Job[], count: number = 1000): Candidate[] {
  const candidates: Candidate[] = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    
    let email: string;
    do {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@email.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const job = randomItem(jobs);
    const stage = randomItem(STAGES);

    candidates.push({
      id: nanoid(),
      name,
      email,
      jobId: job.id,
      stage,
      appliedDate: randomDate(new Date(2024, 0, 1), new Date()),
      avatarUrl: undefined,
    });
  }

  return candidates;
}

export function generateAssessments(jobs: Job[]): Assessment[] {
  const assessments: Assessment[] = [];
  
  // Create assessments for 3+ jobs
  const jobsWithAssessments = jobs.slice(0, Math.max(3, Math.floor(jobs.length * 0.4)));

  jobsWithAssessments.forEach((job, idx) => {
    const now = new Date().toISOString();
    
    assessments.push({
      id: nanoid(),
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Comprehensive assessment for ${job.title} candidates`,
      createdAt: now,
      updatedAt: now,
      sections: [
        {
          id: nanoid(),
          title: "Background & Experience",
          description: "Tell us about your background",
          questions: [
            {
              id: nanoid(),
              type: "short-text",
              text: "What is your current job title?",
              required: true,
            },
            {
              id: nanoid(),
              type: "numeric",
              text: "How many years of experience do you have?",
              required: true,
              minValue: 0,
              maxValue: 50,
            },
            {
              id: nanoid(),
              type: "single-choice",
              text: "What is your highest level of education?",
              required: true,
              options: [
                "High School",
                "Bachelor's Degree",
                "Master's Degree",
                "PhD",
                "Other",
              ],
            },
            {
              id: nanoid(),
              type: "long-text",
              text: "Describe your most significant professional achievement",
              required: true,
              maxLength: 1000,
            },
          ],
        },
        {
          id: nanoid(),
          title: "Technical Skills",
          description: "Assess your technical capabilities",
          questions: [
            {
              id: nanoid(),
              type: "multi-choice",
              text: "Which programming languages are you proficient in?",
              required: true,
              options: [
                "JavaScript/TypeScript",
                "Python",
                "Java",
                "C++",
                "Go",
                "Rust",
                "Ruby",
                "PHP",
              ],
            },
            {
              id: nanoid(),
              type: "single-choice",
              text: "Do you have experience with cloud platforms?",
              required: true,
              options: ["Yes", "No"],
            },
            {
              id: nanoid(),
              type: "multi-choice",
              text: "Which cloud platforms have you worked with?",
              required: false,
              options: ["AWS", "Azure", "Google Cloud", "DigitalOcean", "Other"],
              conditionalOn: "", // Will be set dynamically
              conditionalValue: "Yes",
            },
            {
              id: nanoid(),
              type: "numeric",
              text: "Rate your proficiency with version control (1-10)",
              required: true,
              minValue: 1,
              maxValue: 10,
            },
          ],
        },
        {
          id: nanoid(),
          title: "Scenario Questions",
          description: "How would you handle these situations?",
          questions: [
            {
              id: nanoid(),
              type: "long-text",
              text: "Describe a challenging project you worked on and how you overcame obstacles",
              required: true,
              maxLength: 2000,
            },
            {
              id: nanoid(),
              type: "long-text",
              text: "How do you stay current with industry trends and technologies?",
              required: true,
              maxLength: 1000,
            },
            {
              id: nanoid(),
              type: "single-choice",
              text: "What is your preferred work environment?",
              required: true,
              options: ["Remote", "Office", "Hybrid", "Flexible"],
            },
          ],
        },
        {
          id: nanoid(),
          title: "Additional Information",
          description: "Help us get to know you better",
          questions: [
            {
              id: nanoid(),
              type: "file-upload",
              text: "Upload your resume/CV",
              required: true,
            },
            {
              id: nanoid(),
              type: "file-upload",
              text: "Upload portfolio or work samples (optional)",
              required: false,
            },
            {
              id: nanoid(),
              type: "short-text",
              text: "LinkedIn profile URL",
              required: false,
            },
            {
              id: nanoid(),
              type: "short-text",
              text: "GitHub profile URL",
              required: false,
            },
          ],
        },
      ],
    });

    // Set conditional question reference
    const sections = assessments[assessments.length - 1].sections;
    const techSection = sections[1];
    if (techSection.questions.length >= 3) {
      techSection.questions[2].conditionalOn = techSection.questions[1].id;
    }
  });

  return assessments;
}

export function generateTimelineEvents(candidates: Candidate[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const teamMembers = ["HR Manager", "Tech Lead", "Hiring Manager", "Recruiter"];

  candidates.forEach((candidate) => {
    // Application event
    events.push({
      id: nanoid(),
      candidateId: candidate.id,
      eventType: "stage_change",
      toStage: "applied",
      timestamp: candidate.appliedDate,
      userId: nanoid(),
      userName: randomItem(teamMembers),
    });

    // Additional events for non-applied stages
    if (candidate.stage !== "applied") {
      const stageIndex = STAGES.indexOf(candidate.stage);
      for (let i = 1; i <= stageIndex; i++) {
        events.push({
          id: nanoid(),
          candidateId: candidate.id,
          eventType: "stage_change",
          fromStage: STAGES[i - 1],
          toStage: STAGES[i],
          timestamp: randomDate(
            new Date(candidate.appliedDate),
            new Date()
          ),
          userId: nanoid(),
          userName: randomItem(teamMembers),
        });
      }
    }
  });

  return events;
}

export function generateNotes(candidates: Candidate[]): Note[] {
  const notes: Note[] = [];
  const teamMembers = [
    "HR Manager",
    "Tech Lead",
    "Hiring Manager",
    "Recruiter",
    "Engineering Manager",
  ];

  // Add notes to ~30% of candidates
  const candidatesWithNotes = candidates
    .filter(() => Math.random() > 0.7)
    .slice(0, 300);

  candidatesWithNotes.forEach((candidate) => {
    const numNotes = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numNotes; i++) {
      const author = randomItem(teamMembers);
      const notes_text = [
        "Great technical skills, strong communication",
        "Needs more experience with cloud platforms",
        "Very impressed with their portfolio",
        "Scheduling technical interview for next week",
        "Salary expectations align with our budget",
        "Cultural fit looks excellent",
        "Follow up on references",
        "Recommended by @Tech Lead",
        "Moving forward to next stage",
        "Awaiting feedback from @Hiring Manager",
      ];

      notes.push({
        id: nanoid(),
        candidateId: candidate.id,
        content: randomItem(notes_text),
        author,
        authorId: nanoid(),
        mentions: [],
        timestamp: randomDate(
          new Date(candidate.appliedDate),
          new Date()
        ),
      });
    }
  });

  return notes;
}

export function generateTeamMembers(): TeamMember[] {
  return [
    {
      id: nanoid(),
      name: "Sarah Johnson",
      email: "sarah@talentflow.com",
    },
    {
      id: nanoid(),
      name: "Michael Chen",
      email: "michael@talentflow.com",
    },
    {
      id: nanoid(),
      name: "Emily Rodriguez",
      email: "emily@talentflow.com",
    },
    {
      id: nanoid(),
      name: "David Kim",
      email: "david@talentflow.com",
    },
    {
      id: nanoid(),
      name: "Jessica Williams",
      email: "jessica@talentflow.com",
    },
  ];
}
