# TalentFlow - Modern Hiring Platform

A comprehensive React-based hiring platform for managing jobs, candidates, and assessments. Built as a front-end only application with simulated API using Mock Service Worker (MSW) and local persistence via IndexedDB.

## Features

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

## Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query (React Query) v5
- **Drag & Drop**: @dnd-kit for jobs reordering and kanban board
- **Virtualization**: @tanstack/react-virtual for 1000+ candidates
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion

### Backend Simulation
- **API Mocking**: Mock Service Worker (MSW) v2
- **Persistence**: Dexie.js (IndexedDB wrapper)
- **Latency**: 200-1200ms artificial delay
- **Error Rate**: 5-10% on write operations for realism

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Shadcn base components
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── job-modal.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── timeline.tsx
│   │   │   ├── notes-list.tsx
│   │   │   ├── assessment-builder.tsx
│   │   │   └── assessment-preview.tsx
│   │   ├── pages/             # Route components
│   │   │   ├── dashboard.tsx
│   │   │   ├── jobs.tsx
│   │   │   ├── job-detail.tsx
│   │   │   ├── candidates.tsx
│   │   │   ├── candidate-profile.tsx
│   │   │   ├── assessments.tsx
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
├── server/                     # Minimal Express server (unused for data)
└── public/
    └── mockServiceWorker.js   # MSW service worker
```

## Setup & Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Open browser to `http://localhost:3000`
   - MSW will automatically intercept API calls
   - Database seeds automatically on first load

## Data Seeding

The application automatically seeds the following data on first launch:

- **25 Jobs**: Mix of active (70%) and archived (30%) positions
- **1,000 Candidates**: Distributed across all 25 jobs and 6 stages
- **3+ Assessments**: Each with 4 sections and 10+ questions
- **Timeline Events**: Complete history for all candidate stage transitions
- **Notes**: Added to ~30% of candidates with @mentions
- **Team Members**: 5 mock team members for @mention suggestions

Data persists in IndexedDB between sessions. Clear browser data to re-seed.

## Key Features & Implementation

### Drag-and-Drop with Rollback
Jobs can be reordered via drag-and-drop. The system:
1. Applies optimistic update immediately
2. Makes API call to persist change
3. Rolls back on simulated failure (10% chance)
4. Shows toast notification on failure

### Kanban Board
Candidates can be moved between stages by dragging cards:
- Applied → Screening → Technical → Offer → Hired
- Rejected is a terminal state
- Each transition creates a timeline event
- Optimistic updates with proper error handling

### Assessment Conditional Logic
Questions can be conditionally displayed:
```typescript
{
  id: "q2",
  text: "Which cloud platforms?",
  conditionalOn: "q1",  // Show only if...
  conditionalValue: "Yes"  // ...q1 answer is "Yes"
}
```

### Virtualized List Performance
The candidates list uses `@tanstack/react-virtual` to efficiently render 1000+ items:
- Only visible rows are rendered
- Smooth scrolling performance
- Estimated row height: 80px
- 5 rows overscan for smooth scrolling

## API Endpoints (Simulated via MSW)

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

## Technical Decisions

### Why MSW over real backend?
- Eliminates server setup complexity
- Realistic network behavior (latency, errors)
- Works offline, perfect for demos
- Easy to simulate edge cases

### Why IndexedDB?
- Persistent storage across sessions
- Handles large datasets (1000+ candidates)
- Structured data with indexes
- Browser-native, no external dependencies

### Why Virtualized Lists?
- Essential for 1000+ candidates performance
- Only renders visible DOM nodes
- Maintains smooth 60fps scrolling
- Memory efficient

### Why React Query?
- Automatic caching and refetching
- Optimistic updates built-in
- Loading/error states management
- Cache invalidation on mutations

## Design System

The application follows a modern SaaS design inspired by Linear and Notion:

- **Typography**: Inter (UI), Space Mono (monospace for slugs/IDs)
- **Colors**: Blue primary, semantic status colors, dark mode support
- **Spacing**: Consistent 4px/6px/8px/12px/16px rhythm
- **Components**: Shadcn UI (Radix primitives + Tailwind)
- **Interactions**: Subtle hover elevations, smooth transitions

## Known Limitations

- **No authentication**: Everyone is "HR Manager"
- **No real API**: All data is local
- **No file uploads**: File upload questions show stub interface
- **No email sending**: Email/notification features not implemented
- **Browser-only**: Data doesn't sync across devices

## Future Enhancements

- [ ] Add bulk candidate actions
- [ ] Assessment analytics dashboard
- [ ] Email template system
- [ ] Export functionality (CSV, PDF)
- [ ] Advanced candidate filtering
- [ ] Interview scheduling
- [ ] Offer letter generation
- [ ] Real-time collaboration

## Performance

- **Initial Load**: ~2-3s (includes MSW setup + database seeding)
- **Job Reorder**: 200-1200ms (artificial latency)
- **Candidate List**: 60fps smooth scrolling with 1000+ items
- **Assessment Builder**: Live preview updates in <16ms

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires IndexedDB and Service Worker support.

## License

MIT - Built as a technical assignment showcase

---

**Note**: This is a front-end only application designed to demonstrate React development skills, state management, performance optimization, and modern UI/UX patterns. No real backend or authentication is implemented.
