# TalentFlow Design Guidelines

## Design Approach
**Selected Framework:** Design System Approach with Linear and Notion influences for modern SaaS productivity tools
**Rationale:** TalentFlow is an information-dense HR productivity platform requiring consistency, clarity, and efficiency across complex workflows (jobs management, candidate tracking, assessment building, kanban boards).

## Typography System

**Font Families:**
- Primary: Inter (400, 500, 600) via Google Fonts for UI elements, tables, forms
- Secondary: Space Mono (400, 700) for monospace elements like job slugs, IDs, timestamps

**Type Scale:**
- Page Titles: text-3xl font-semibold (Jobs Board, Candidates, Assessments)
- Section Headers: text-xl font-semibold (Assessment Builder sections)
- Card Titles: text-base font-medium (Job titles, Candidate names)
- Body Text: text-sm font-normal (Descriptions, notes, timeline entries)
- Labels: text-xs font-medium uppercase tracking-wide (Form labels, status badges)
- Metadata: text-xs font-normal (Timestamps, secondary info)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-6 for cards, p-4 for compact elements
- Section gaps: space-y-8 for major sections, space-y-4 for related content
- Grid gaps: gap-6 for cards, gap-4 for form fields

**Container Strategy:**
- Dashboard shell: Full viewport height with fixed sidebar
- Content areas: max-w-7xl mx-auto px-6
- Modals/Drawers: max-w-2xl for forms, max-w-4xl for assessment builder

**Grid Patterns:**
- Jobs list: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6)
- Kanban board: Horizontal scroll container with fixed-width columns (w-80 each)
- Assessment builder: Two-column split (60% builder, 40% preview on lg+)

## Component Library

### Navigation & Shell
**Sidebar:** Fixed left sidebar (w-64) with logo, primary navigation links (Jobs, Candidates, Assessments), user profile at bottom. Use icons from Heroicons (outline variant).

**Top Bar:** Sticky header with breadcrumbs, global search, notifications icon, and user menu. Height h-16.

### Jobs Board Components
**Job Card:** Rounded-lg border with hover:shadow-lg transition. Contains: title (text-lg font-semibold), slug (text-xs monospace), status badge, tag chips (rounded-full px-3 py-1 text-xs), action menu (vertical dots icon).

**Status Badges:** Pill-shaped (rounded-full px-2.5 py-0.5 text-xs font-medium) - Active vs Archived states.

**Tag Chips:** Small rounded pills with remove X icon, displayed as flex-wrap gap-2 array.

**Drag Handle:** Six-dot icon visible on hover, positioned left of card title.

**Filters Bar:** Horizontal layout with search input (w-64), status dropdown, sort dropdown, "Create Job" button (primary CTA).

**Pagination:** Bottom-aligned with page numbers, previous/next arrows, page size selector.

### Modal/Drawer Systems
**Job Create/Edit Modal:** Centered modal (max-w-2xl) with header (title + close X), form body (space-y-6), footer with Cancel and Save buttons.

**Form Fields:**
- Text inputs: Full-width with floating labels or top-aligned labels (text-sm font-medium mb-2)
- Tag input: Multi-select with pill display, "+ Add Tag" affordance
- Toggle switches for Archive/Unarchive

### Candidates Section
**Virtualized List:** Table layout with fixed headers (sticky top-0). Columns: Avatar (circular, 40px), Name (font-medium), Email (text-sm), Current Stage (badge), Applied Date (text-xs), Actions (icon button).

**Search/Filter Bar:** Similar to jobs - search box (searches name/email), stage dropdown filter.

**Profile Route (/candidates/:id):**
- Hero section with large avatar (80px), name (text-2xl font-semibold), email, current stage badge
- Tabs: Overview, Timeline, Notes, Applications
- Timeline: Vertical stepper with connected dots, event cards showing stage transitions with timestamps

### Kanban Board
**Board Layout:** Horizontal scrollable container with stage columns side-by-side. Each column: fixed width (w-80), header with stage name + count badge, scrollable card list.

**Candidate Cards (Kanban):** Compact cards with avatar, name (text-sm font-medium), email (text-xs), small "View" link. Draggable with cursor-grab, slight shadow-md on drag.

**Drop Zones:** Visible outline on drag-over (border-2 border-dashed).

### Notes Interface
**Notes List:** Reverse chronological, each note in bordered container (p-4 rounded-lg border).

**Note Composer:** Textarea with @mention detection. Display mentions as highlighted chips (e.g., "@John Doe" with subtle background).

**Mention Suggestions:** Dropdown list appearing below cursor position showing team members (avatar + name).

### Assessment Builder
**Two-Pane Layout:** 
- Left pane (60%): Scrollable builder interface
- Right pane (40%): Sticky preview that updates live

**Builder Interface:**
- Section headers: Collapsible accordions (border rounded-lg mb-4)
- "+ Add Section" button at top
- Within sections: Question list with drag handles, each question in bordered container
- Question types selector: Dropdown with 6 types (Single Choice, Multi Choice, Short Text, Long Text, Numeric, File Upload)

**Question Cards:** Contains question text input (font-medium), type badge, options editor (for choice types), validation toggles (Required, Min/Max for numeric), conditional logic builder (if/then dropdown chains).

**Live Preview Pane:** Renders actual form with all questions, shows validation hints, displays conditional logic in real-time (questions appear/disappear based on dependencies).

### Form Runtime (Assessment Taking)
**Form Container:** Centered (max-w-3xl), clean white container with generous padding (p-8 lg:p-12).

**Progress Indicator:** Top bar showing section progress (e.g., "Section 2 of 5").

**Question Groups:** Spaced with space-y-8, each question in subtle bordered container.

**Input Variants:**
- Radio buttons: Larger clickable areas (p-3 border rounded-lg) with checked state
- Checkboxes: Similar to radio but allow multiple
- Text inputs: Standard with character count for max-length fields
- Numeric: Input with min/max hints displayed
- File upload: Dashed border dropzone with "Choose file" or drag-and-drop area

**Validation Messages:** Text-sm below inputs, appear on blur or submit attempt.

**Submit Button:** Large primary button at bottom (w-full lg:w-auto px-8 py-3).

## Iconography
**Icon Library:** Heroicons (outline variant) via CDN
**Common Icons:** Briefcase (jobs), Users (candidates), ClipboardList (assessments), Plus (create), Pencil (edit), Archive (archive), Trash (delete), DotsVertical (menu), ChevronDown (dropdowns), Check (success), X (close/remove)

## Spacing & Rhythm
**Vertical Spacing:**
- Page sections: mb-12 between major sections
- Component groups: space-y-6 for related cards/items
- Form fields: space-y-4 within forms
- List items: divide-y with py-4 each

**Horizontal Spacing:**
- Grid gaps: gap-6 for cards, gap-4 for compact grids
- Flex gaps: gap-3 for icon+text, gap-2 for tags/chips

## Interaction Patterns
**Drag-and-Drop:**
- Visual feedback: Slight scale (scale-105), shadow (shadow-2xl), cursor change (cursor-grabbing)
- Drop zones: Highlighted border (border-2 border-dashed) on valid drag-over
- Optimistic updates: Item moves immediately, subtle loading indicator during save, rollback with toast notification on error

**Loading States:**
- Skeleton screens: Animate-pulse rectangles matching content shape for initial loads
- Inline spinners: Small circular spinner for in-progress actions
- Optimistic UI: Show change immediately with subtle indicator (pulse or opacity reduction)

**Error Handling:**
- Toast notifications: Top-right positioned (max-w-sm), auto-dismiss after 5s, error/success variants
- Inline errors: Below form fields with icon (ExclamationCircle) + message
- Network errors: Retry button in toast or error state

**Empty States:**
- Centered content with icon (large, subtle), heading, description, and primary action button
- Examples: "No jobs yet - Create your first job", "No candidates in this stage"

## Animations
**Minimal & Purposeful:**
- Transitions: transition-all duration-200 for hover states
- Modal entrance: Fade + slight scale (animate-in from center)
- List updates: Smooth height transitions for add/remove
- Drag feedback: transform and shadow changes only
- NO: Page transitions, elaborate scroll effects, decorative animations

## Accessibility
- Focus states: Visible ring (ring-2 ring-offset-2) on all interactive elements
- ARIA labels: Proper labels for icon-only buttons
- Keyboard navigation: Tab order follows visual hierarchy, Enter to activate, Escape to close modals
- Form validation: Announce errors to screen readers

## Responsive Behavior
**Breakpoints:**
- Mobile (<768px): Single column, full-width cards, hamburger nav, bottom sheet modals
- Tablet (768-1024px): Two-column grids, persistent sidebar, standard modals
- Desktop (>1024px): Three-column grids, full feature set, split-pane assessment builder

**Mobile Adaptations:**
- Kanban: Vertical stack of stages instead of horizontal scroll
- Tables: Responsive cards showing key info
- Sidebar: Overlay drawer triggered by hamburger menu
- Assessment builder: Single column with preview as separate tab/route

## Images
**No hero images.** This is a business productivity tool - lead directly with functionality. All visual interest comes from clean layouts, excellent typography, and well-designed data presentation.

**User Avatars:** Circular images (40px standard, 80px for profiles) with fallback to colored initials if no photo.

**Empty State Illustrations:** Simple line-art icons (large format, 120-160px) from Heroicons or similar, not photos.