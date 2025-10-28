# TalentFlow - Modern Hiring Platform

![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.3.1-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-blue?logo=tailwindcss&logoColor=white)
![MSW](https://img.shields.io/badge/MSW-2.3.4-orange?logo=msw)
![Dexie.js](https://img.shields.io/badge/Dexie.js-4.0.7-yellow)

## Overview

TalentFlow is a comprehensive React-based hiring platform for managing jobs, candidates, and assessments. The application is built as a **frontend-only solution** that simulates a complete backend using Mock Service Worker (MSW) and IndexedDB for local data persistence. It provides a modern SaaS-style interface for HR teams to manage the entire hiring pipeline, from job posting creation to candidate evaluation.

The platform supports job management with drag-and-drop reordering, a virtualized candidate list supporting 1000+ entries, a Kanban board for candidate stage management, and a sophisticated assessment builder with multiple question types and conditional logic.

## 🚀 Features

### Jobs Management
- ✅ Create, edit, and archive job postings
- ✅ Drag-and-drop job reordering with optimistic updates
- ✅ Rollback on reorder failures (simulated 10% failure rate)
- ✅ Server-like pagination and filtering (title, status, tags)
- ✅ Deep linking to jobs (`/jobs/:jobId`)
- ✅ Unique slug validation

### Candidates Management
- ✅ Virtualized list supporting 1000+ candidates
- ✅ Client-side search (name/email) and server-like filtering (stage)
- ✅ Candidate profile with timeline showing all status changes
- ✅ Kanban board with drag-and-drop between stages
- ✅ Stage transitions: Applied → Screening → Technical → Offer → Hired/Rejected
- ✅ Notes with @mention support (suggestions from local team list)

### Assessments
- ✅ Assessment builder per job with multiple sections
- ✅ 6 question types:
  - Single-choice (radio buttons)
  - Multi-choice (checkboxes)
  - Short text (input with max length)
  - Long text (textarea with max length)
  - Numeric (with min/max range validation)
  - File upload (stub interface)
- ✅ Live preview pane showing real-time form rendering
- ✅ Validation rules (required fields, numeric ranges, max length)
- ✅ Conditional question logic (show Q3 only if Q1 === "Yes")
- ✅ Form runtime with full validation

## 🏗️ System Architecture

### Frontend Architecture

* **Core Framework:** **React 18 with TypeScript** serves as the foundation, providing type safety and modern React features throughout the application.
* **Routing Strategy:** **Wouter** is used for client-side routing instead of React Router, offering a lightweight alternative for single-page navigation.
* **UI Component System:** The application uses **Shadcn UI** components built on **Radix UI** primitives, providing accessible, unstyled components that are customized with **Tailwind CSS**. This follows the "New York" style variant.
* **State Management Approach:** **TanStack Query (React Query) v5** handles all server state management, caching, and data synchronization. The application uses optimistic updates for operations like job reordering and candidate stage transitions, with automatic rollback on failure.
* **Form Handling:** **React Hook Form** combined with **Zod** validation provides type-safe form management.
* **Drag and Drop System:** **`@dnd-kit`** libraries provide drag-and-drop functionality for both job reordering (sortable list) and the candidate Kanban board (between columns).
* **Virtualization:** **`@tanstack/react-virtual`** enables efficient rendering of large lists, specifically used for the candidates page to handle 1000+ entries without performance degradation.

### Data Layer & API Simulation

* **Client-Side Database:** **Dexie.js** wraps IndexedDB to provide a more ergonomic API for local data persistence. The database schema is defined in `client/src/lib/db.ts` with tables for jobs, candidates, assessments, timeline events, notes, and team members.
* **API Simulation Layer:** **Mock Service Worker (MSW) v2** intercepts fetch requests and provides simulated API responses. Handlers in `client/src/mocks/handlers.ts` implement CRUD operations that interact with the IndexedDB database, including:
    * Artificial latency (200-1200ms) to simulate network conditions
    * Simulated failure rates (7.5% on write operations) to test error handling
    * RESTful endpoint patterns (`/api/jobs`, `/api/candidates`, etc.)
* **Schema Definitions:** **Zod** schemas in `shared/schema.ts` define the data models and validation rules for all entities.
* **Data Seeding:** On first load, the database is populated with realistic test data (25 jobs, 1000 candidates, assessments, timeline events, notes).

### Build and Development

* **Build System:** **Vite** serves as the development server and build tool, configured with Hot Module Replacement (HMR) and path aliases for cleaner imports.
* **Styling Pipeline:** **PostCSS** with Tailwind CSS and Autoprefixer processes all styles.

## 💾 Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Shadcn base components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── job-modal.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── timeline.tsx
│   │   │   ├── notes-list.tsx
│   │   │   └── assessment-preview.tsx
│   │   ├── pages/             # Route components
│   │   │   ├── dashboard.tsx
│   │   │   ├── jobs.tsx
│   │   │   ├── job-detail.tsx
│   │   │   ├── candidates.tsx
│   │   │   ├── candidate-profile.tsx
│   │   │   └── assessment-builder.tsx
│   │   ├── lib/               # Utilities & configuration
│   │   │   ├── db.ts          # Dexie database schema
│   │   │   ├── seed-data.ts   # Data generation
│   │   │   ├── init-db.ts     # Database initialization
│   │   │   ├── mutations.ts   # React Query mutations
│   │   │   └── queryClient.ts # Query client config
│   │   ├── mocks/             # MSW handlers
│   │   │   ├── handlers.ts    # API route handlers
│   │   │   └── browser.ts     # MSW worker setup
│   │   ├── App.tsx            # Main app with routing
│   │   └── main.tsx           # Entry point with MSW init
│   └── index.html
├── shared/
│   └── schema.ts              # Shared TypeScript types & Zod schemas
└── public/
    └── mockServiceWorker.js   # MSW service worker file
```

## 🛠️ Setup & Installation

1.  **Clone and install dependencies**:
```bash
    npm install
```

2.  **Start development server**:
```bash
    npm run dev
```

3.  **Access the application**:
    * Open your browser to `http://localhost:3000` (or as specified by Vite).
    * MSW will automatically intercept API calls.
    * The database will seed automatically on the first load.

## 🌱 Data Seeding

The application automatically seeds the following data into IndexedDB on first launch:

-   **25 Jobs**: Mix of active (70%) and archived (30%) positions.
-   **1,000 Candidates**: Distributed across all 25 jobs and 6 stages.
-   **3+ Assessments**: Each with 4 sections and 10+ questions.
-   **Timeline Events**: Complete history for all candidate stage transitions.
-   **Notes**: Added to ~30% of candidates with @mentions.
-   **Team Members**: 5 mock team members for @mention suggestions.

Data persists between sessions. To re-seed, clear your browser's IndexedDB for this site.

## 💡 Key Feature Implementation

### Drag-and-Drop with Rollback
Jobs can be reordered via drag-and-drop using `@dnd-kit`. The system:
1.  Applies the UI change optimistically.
2.  Makes the API call (`PATCH /api/jobs/:id/reorder`) to persist the change.
3.  On a simulated failure (10% chance), it rolls back the change and shows a failure toast.

### Kanban Board
Candidates can be moved between stages (Applied, Screening, Technical, Offer, Hired, Rejected) by dragging cards from one column to another. This action triggers a `useUpdateCandidate` mutation, which patches the candidate's `stage` and automatically creates a new `stage_change` event in the timeline.

### Assessment Conditional Logic
Questions can be conditionally displayed based on the answer to a previous question. This is defined in the question schema:
```typescript
{
  id: "q2",
  text: "Which cloud platforms?",
  conditionalOn: "q1",  // Show only if...
  conditionalValue: "Yes"  // ...q1 answer is "Yes"
}
```
The AssessmentPreview component contains the runtime logic to handle this.

### Virtualized List Performance
The main candidates list uses `@tanstack/react-virtual` to efficiently render 1000+ items, ensuring smooth 60fps scrolling by only rendering the DOM nodes that are currently in or near the viewport.

## 🔌 API Endpoints (Simulated via MSW)

### Jobs
- `GET /api/jobs?search=&status=&page=&pageSize=&sort=`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `PATCH /api/jobs/:id`
- `PATCH /api/jobs/:id/reorder`

### Candidates
- `GET /api/candidates?search=&stage=&page=`
- `GET /api/candidates/:id`
- `PATCH /api/candidates/:id`
- `GET /api/candidates/:id/timeline`
- `GET /api/candidates/:id/notes`
- `POST /api/candidates/:id/notes`

### Assessments
- `GET /api/assessments`
- `GET /api/assessments/:jobId`
- `PUT /api/assessments/:jobId`
- `POST /api/assessments/:jobId/submit`

## 💭 Technical Decisions

### Why MSW over real backend?
- Eliminates server setup complexity for a frontend-focused assignment.
- Provides a realistic network simulation, complete with artificial latency and random error rates.
- Works offline and is perfect for demos.
- Allows easy simulation of edge cases (e.g., 500 error on reorder).

### Why IndexedDB with Dexie.js?
- Provides true persistence across browser sessions, unlike localStorage.
- Handles large and complex datasets (1000+ candidates, relational data) efficiently.
- Dexie.js provides a modern, async/await wrapper over the complex IndexedDB API.
- Browser-native, no external database dependencies required.

### Why Virtualized Lists?
- It's a hard requirement for handling 1000+ items.
- Rendering all 1000+ candidates at once would crash the browser.
- Virtualization ensures 60fps smooth scrolling by only rendering visible DOM nodes.

### Why React Query?
- Drastically simplifies server state management, caching, and refetching.
- Provides a robust system for optimistic updates with automatic rollback.
- Handles loading and error states out-of-the-box.
- Simplifies cache invalidation (e.g., "refetch jobs list" after a new one is created).

## 🎨 Design System

The application follows a modern SaaS design inspired by Linear and Notion:

- **Typography**: Inter (UI), Space Mono (monospace for slugs/IDs)
- **Colors**: Blue primary, semantic status colors, dark mode support
- **Spacing**: Consistent 4px/6px/8px/12px/16px rhythm
- **Components**: Shadcn UI (Radix primitives + Tailwind)
- **Interactions**: Subtle hover elevations, smooth transitions

## 📦 External Dependencies

### UI and Component Libraries
- Radix UI Primitives: (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.)
- Shadcn UI: Pre-configured component patterns
- Lucide React: Icon library
- class-variance-authority: For component variants
- cmdk: Command palette component

### State Management and Data Fetching
- @tanstack/react-query: Server state management
- dexie: IndexedDB wrapper

### Forms and Validation
- react-hook-form: Form state management
- zod: Schema validation
- @hookform/resolvers: Zod resolver for React Hook Form

### Drag and Drop
- @dnd-kit/core: Core drag-and-drop
- @dnd-kit/sortable: Sortable list utilities

### Virtualization
- @tanstack/react-virtual: Virtual scrolling

### API Mocking
- msw: Mock Service Worker

### Routing
- wouter: Lightweight client-side routing

### Utilities
- nanoid: Unique ID generation
- clsx & tailwind-merge: Merging Tailwind classes
- framer-motion: Animation library

## Limitations & Future Enhancements

### Known Limitations
- No authentication: Everyone is a default "HR Manager"
- No real API: All data is local to your browser and does not sync
- No file uploads: The file upload question is a stub and does not actually upload
- Browser-only: Data doesn't sync across devices

### Future Enhancements
- [ ] Add bulk candidate actions (archive, reject)
- [ ] Assessment analytics dashboard
- [ ] Export functionality (CSV, PDF)
- [ ] Interview scheduling integration
- [ ] Offer letter generation
- [ ] Real-time collaboration

## ⚖️ License
MIT - Built as a technical assignment showcase