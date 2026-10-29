Redesign the "Service Management" module of this ECOVIS HRMS app (route /services). Replace the page's UX completely, but keep the rest of the app untouched. Do not ask me questions. Where something is unclear, follow the defaults in this brief and build it.

## 1. Why we are redesigning

Today /services has a hero banner, six KPI tiles and five tabs (Master Catalogue, Client Engagements, Recurring Task Pipeline, Timesheets & Approvals, Workload & Audit). It is organised by system object, not by how people work. Problems:
- Long vertical scrolling and a lot of text; system jargon on the surface (Idempotency Key, Tenant-Isolated, Cross-Entity).
- No month-by-month view of recurring work.
- Task cards only offer "Log Hours" / "Reopen". There is no way to open a task and update it.
- No concept of internal companies (group companies that receive the same services).
- Finding one task takes 4+ clicks plus scrolling.

## 2. Goal

A clean, minimal, month-aware tracker that a director, manager, employee and (later) a client can all use. Anyone should reach any task in 3 clicks or fewer from the board and update it without leaving the page. Directional and intentional, not cluttered: short labels, no paragraphs of description, one idea per screen.

## 3. Core concepts (build one generic model, three "lenses")

- Service: about 10 of them (seed list in section 9). Each has a short card name (e.g. "Accounting") plus the existing full name and code.
- Party: either an External Client or an Internal Company. Same data shape with type "client" | "internal". Internal companies are group entities that receive the same services. They are not the same thing as the existing "Servicing Legal Entity" (the entity delivering the work). Leave that field as it is.
- Engagement: Service x Party. This is the existing subscription (recurrence, billing, fee, servicing entity, deliverables). Keep all of it.
- Task: belongs to an engagement. Fields: title, kind (one-time or recurring), recurrence, cycle key, due date, createdAt, createdBy, assignee, status (Pending, In progress, In review, Done), updatedAt, updatedBy, subtasks[] (title, done, optional assignee), hours logged/budgeted. Keep the existing idempotency key and cross-entity flag in the data, but hide them from the main UI.
- Lenses: Service lens, Client lens, Internal lens. They are three views of the same task data. Build the board and the workspace once and drive them with the lens, instead of three separate implementations.

## 4. Month logic (important)

- A global month toggle sits at the top of every screen in this module: a compact segmented control with three options, previous / current / next month (e.g. "Sep | Oct (current) | Nov"). Default is the current month based on today's real date. Add a small calendar popover to jump to any other month.
- Every task belongs to exactly one month: the month of its due date.
- Recurring work generates one instance per cycle. Monthly services appear every month. Quarterly, half-yearly and yearly services appear only in the month their cycle is due. One-time tasks appear in their due month.
- Unfinished tasks from earlier months also show in the current month under a "Carried over" group with an overdue badge. This applies to the current month only.
- Previous month shows what was due then and how it ended. Next month shows scheduled instances (muted "Scheduled" state, still editable). If next month's instances are not generated yet, show a quiet inline "Generate" action there (this is the existing Run Recurrence Job).
- Every count, card and list in the module follows the selected month. Changing the month updates everything instantly, with no page reload.

## 5. Screen 1: the main board (/services)

Top to bottom:
1. Header row: title "Service Management" on the left. On the right: "+ Assign service" (primary), "Log time", and a "Manage" overflow menu (see section 7).
2. Control bar, one line: Lens toggle [Service | Client | Internal] on the left, month toggle in the middle, search + sort (Most pending, A-Z) on the right. Directly below it, one slim summary line, e.g. "38 pending - 6 overdue - 4 timesheets awaiting approval". Each part is clickable (overdue filters the board, approvals opens the approvals page). No KPI tile row.
3. Card grid.

Card grid rules:
- Cards are compact, in the same visual family and roughly the same size as the small cards in the dashboard "My Tasks" widget (same radius, border, surface colour). The whole card is clickable and keyboard-focusable. Hover gives a subtle lift.
- Layout is 5 columns on desktop, so 10 service cards sit in 2 rows of 5 and are visible without scrolling at 1440x900. Reduce to 4, 3, then 2 columns as the width shrinks. The grid must handle any number of cards: Client lens has more than 10 clients, Internal lens has 15-20 companies. It flows into extra rows with a sticky control bar, and search and sort stay available.
- Service card: short service name (max 2 lines), "N clients", a large pending count with the label "pending". A small red "N overdue" appears only when N > 0.
- Client card and Internal card: initials avatar (logo placeholder), party name, "N services", a large pending count with the label "pending", and the same overdue marker.
- Zero pending shows a muted "All clear" with a tick.
- Nothing else on the card. No descriptions, rates, progress bars or badges.

## 6. Screen 2: the workspace (one layout for all three lenses)

Opens when a card is clicked. Route examples: /services/service/:id, /services/client/:id, /services/internal/:id. The URL also carries month, selected tab and open task, so links are shareable.

- Breadcrumb and back arrow: Service Management > Service > Accounting. The global month toggle stays visible.
- Header: name, one meta line (code - category - N clients - N pending), and a "..." menu for Edit / Engagement settings.
- Navigation bar (the key element): a horizontally scrollable tab strip. Each tab is a name plus a small pending-count badge.
  - In a service workspace the tabs are the clients (and internal companies) of that service.
  - In a client or internal workspace the tabs are the services provided to that party.
  - First tab is "All" (default), showing everything for the month. Then one tab per party or service.
  - If there are more than about 12 tabs, add a "More" dropdown with search.
- Task list below the tabs, grouped as Carried over / Pending / Completed (Completed collapsed by default). Compact rows with these columns:
  - Task title with a tiny tag: "Monthly" or "One-time".
  - On the "All" tab also the party or service name.
  - Subtasks as "2 of 5 pending" with a small progress ring (only if the task has subtasks).
  - Assigned to (avatar and name).
  - Created date.
  - Last updated (relative time, and by whom).
  - Due date.
  - Status chip.
- A chevron on the row expands subtasks inline, with checkboxes.
- Quick actions without opening anything: click the status chip to change status, click the avatar to reassign, tick a subtask to complete it. Counts on cards and tabs update live.
- Filter chips: status, and "Assigned to me". For employees "Assigned to me" is on by default.
- Client preview toggle (client workspace only): hides internal-only fields (hours, rates, billing, internal comments, cross-entity info) so I can see what a client would see. No sharing links yet, but build the workspace components with an audience prop ("internal" | "client") and a readOnly prop so a dedicated client portal can reuse them later.

## 7. Task detail: a right-side drawer (not a full page, not a centred modal)

- Opens when a task row is clicked (also by URL ?task=ID). Width about 480px. The list stays visible behind it. Esc or clicking outside closes it.
- Content, top to bottom: editable title; status segmented control (Pending / In progress / In review / Done); meta grid (assignee, due date, service, party, cycle); subtasks checklist (tick, add, assign); hours (reuse the existing Log Time flow); activity feed and comment box; a collapsed "Technical details" section (idempotency key, cross-entity flag).
- Auto-save with a small "Saved" indicator and an Undo toast. Primary footer button is "Mark complete" (shows "Reopen" on done tasks). Prev/Next arrows move through the current list so a manager can go through tasks quickly.
- Completing or changing a task updates board counts immediately.

## 8. Where the existing features go (do not delete functionality)

The "Manage" menu in the header opens secondary pages, each with a "Back to board" link. Reuse the existing components and logic wherever possible:
- Service Catalogue: the current Master Catalogue (create and edit services, deliverables and default subtask templates).
- Engagements: the current "Subscribe client to service" form with the same fields (target, catalogue service, servicing legal entity, billing type and value, deliverable selection, recurrence frequency, cycle due day). Add "Internal company" as a target type. "+ Assign service" on the board opens this form as a drawer.
- Timesheets & Approvals: the current table with Approve / Reject, plus a "Log time" entry.
- Entities & Audit Trail: the current Workload & Audit content (collaboration matrix, audit log, Export Audit JSON).
- Insights (partner and director only): billed revenue, approved hours. These no longer sit on the main board.
- Run Recurrence Job becomes "Generate recurring tasks" in this menu. It remains idempotent.

## 9. Seed data (replace the current demo data, keep it realistic)

- 10 services: the 4 existing ones plus 6 new. Existing: Statutory Financial Audit & Tax Filing (short: "Statutory Audit"), Monthly GST Retainer (short: "GST"), End-to-End Payroll (short: "Payroll"), SOC2 / ISO 27001 Security Audit (short: "IT Audit"). New: Accounting & Bookkeeping, TDS Compliance, Income Tax Filing, ROC & Company Secretarial, Transfer Pricing, Virtual CFO & MIS Reporting.
- 12 external clients (the 4 existing ones plus 8 more). Each client has 1 to 5 services.
- 16 internal companies (plausible group names). Each has 2 to 4 services (Accounting, GST, Payroll, TDS are the common ones).
- Tasks for the previous, current and next month, generated relative to today's date so the month toggle always shows data. Mix of about 60% recurring and 40% one-time. Many tasks have 2 to 6 subtasks. About 10% overdue, some carried over from earlier months, a few unassigned. Assign to existing employees (Deepa Rathi, Namita Chaudhary, Namdev Malusare, Sudhir Bhosale, Mukesh Singh, Sanjana Konda, Aryan Singh, Pooja Disale, Tammay Vilas, Shweta Chaudhari, Suraj Rajbhar, Rahul Sharma, Bharat Mishra).

## 10. Visual and UX principles

- Keep the existing ECOVIS dark theme and tokens (navy surfaces, cyan primary accent, existing fonts and sidebar). Status colours only for status: red overdue, amber at risk, green done.
- Minimal. One primary number per card. Generous spacing. No gradients, no heavy shadows, no decorative icons. Icons only where they carry meaning. Subtle 150ms transitions.
- Short labels in plain language. No jargon on the surface.
- Loading skeletons, helpful empty states, sticky control bar, responsive down to mobile.
- Accessible: keyboard navigable (tab, Enter, Esc), visible focus rings, aria labels, AA contrast.
- Persist last used lens and month in localStorage (wrapped in try/catch).

## 11. Constraints

- Change only the /services module and its components. Keep the sidebar entry, routes and behaviour of all other pages (Dashboard, Projects, My Tasks, etc.) unchanged.
- Keep the data model backward compatible: add fields, do not remove existing ones.
- Do not add new libraries unless already used in the project. Use TypeScript types for the model above. Mock data in local state is fine.
- No console errors, and the app must build.

## 12. Acceptance checklist (verify before finishing)

1. /services opens on Service lens, current month: lens toggle, month toggle, and 10 cards in 2 rows of 5. No tabs, no KPI tile row, no scrolling at 1440x900.
2. Client lens shows 12 cards that flow onto a third row. Each card shows name, number of services, pending count. Search works.
3. Internal lens shows 16 cards in the same layout.
4. The month toggle changes the counts on every card and list. Next month shows scheduled recurring tasks. Previous month shows how things ended. Overdue tasks from earlier months show under "Carried over" in the current month.
5. Service card -> client tab strip with pending badges -> client tab -> list with subtask count, assignee, created date, last updated. Client card and Internal card give the same experience with services as tabs.
6. Clicking a task opens the drawer. Changing status, reassigning and ticking a subtask all work, counts update without reload, Esc closes.
7. Any task is reachable from the board in 3 clicks or fewer.
8. Catalogue, engagement form, timesheets and approvals, audit trail and recurrence generation are all still reachable from "Manage".
9. Client preview hides internal-only fields.
10. Other pages of the app behave exactly as before.

First give me a 5-line summary of your plan, then implement everything above in one pass.
