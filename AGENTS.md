# AGENTS.MD - CBT SaaS Project Context & Guidelines

> **Notice to AI Agents:** Read this file BEFORE modifying the codebase. This project has transitioned from a prototype to a **professional, data-driven SaaS product**. Do not introduce "toy-like" UI elements or inconsistent patterns.

## 1. Project Overview
**CBT SaaS** is a web application helping users practice Cognitive Behavioral Therapy (CBT) through behavior activation and cognitive restructuring.
- **Vibe:** Professional, Calm, Data-Driven, Safe. (References: Linear, Things 3, Notion).
- **Core Value:** Turning vague anxiety into manageable data and actionable insights.

## 2. Tech Stack
- **Framework:** Vue 3 (Composition API, `<script setup lang="ts">`).
- **Language:** TypeScript (Strict typing required).
- **Styling:** Tailwind CSS (v4).
- **Backend:** Supabase (Auth, Postgres, Realtime).
- **State Management:** Pinia.
- **Routing:** Vue Router.

## 3. Design System & UI Conventions (CRITICAL)
**Do NOT deviate from these unless explicitly instructed.**

### 3.1 Layouts
- **Desktop:** Sidebar navigation (Glassmorphism, collapsible).
- **Mobile:** Bottom navigation bar. Content usually has `pb-24` to avoid overlap.
- **Responsiveness:** Mobile-first approach, using `md:` breakpoints for desktop layouts.

### 3.2 Visual Style ("The Bento Style")
- **Cards:** White background, thin borders (`border-gray-200`), subtle shadows (`shadow-sm` or `hover:shadow-md`). Rounded corners (`rounded-2xl` or `rounded-3xl`).
- **Typography:** Inter/Sans-serif. High contrast for headings (`text-gray-900`), medium for body (`text-gray-500`). Small caps for labels (`text-xs font-bold uppercase tracking-widest`).
- **Colors:** 
  - Primary: Indigo (`indigo-600` for actions, `indigo-50` for backgrounds).
  - Success: Emerald.
  - Accent: Violet/Purple gradients (used sparingly in Hero sections).
- **Input Fields:** Clean, no default borders if inside cards, or subtle gray borders. Focus states should be distinct (`ring-2 ring-indigo-500`).

### 3.3 Components
- **Home:** **Bento Grid** layout. No large generic buttons. specific "Today's Agenda" list.
- **Forms:** **Wizard Pattern** (Step-by-step) for complex flows (like `CompleteCBT`). Avoid long vertical scrolling forms.
- **Task Picker:** **Library Style**. Horizontal pills for categories, Grid for tasks.

## 4. Architecture & Data Flow

### 4.1 Service Layer (`src/services/supabaseApi.ts`)
- **Single Source of Truth:** All Supabase data interaction happens here.
- **Do NOT** call `supa.from(...)` directly inside components for business logic. Use the wrapper functions (e.g., `getPendingRecords`, `scheduleTask`).
- **Joins:** `getPendingRecords` joins `cbt_record` with `tasks` table.

### 4.2 State (`src/stores`)
- **App Store (`app.ts`):** Holds `userId` and global app state.
- **Notification Store:** Handles toast messages.

### 4.3 Key Data Models (`src/types/index.ts`)
- **Task:** A definition of an activity (e.g., "Read a book").
- **TaskRecord:** An instance of a task scheduled for a specific time (Scheduled -> Pending -> Completed).
    - *Note:* `TaskRecord` joins with `Task` to get titles.

## 5. Critical File Map

| Path | Purpose | Key Patterns |
| :--- | :--- | :--- |
| `src/views/Home.vue` | Dashboard / Landing for logged-in users. | Bento Grid, Today's Agenda list. |
| `src/views/Landing.vue` | Public Marketing Page. | High-end SaaS aesthetic, CSS-only mockups. |
| `src/views/CompleteCBT.vue` | **Core Feature**. The reflection flow. | **Wizard Pattern** (Step 1..4), Range sliders, Card selection. |
| `src/views/TaskPicker.vue` | Task Library. | Horizontal Scroll Tabs, Grid Layout, Quick Add Input. |
| `src/components/layout/AppLayout.vue` | Main Shell. | Handles Sidebar (Desktop) / Bottom Nav (Mobile). |
| `src/views/auth/Login.vue` | Auth Page. | **Split Layout** (Visual Left / Form Right). |

## 6. Development Rules
1.  **Type Safety:** Always fix TS errors. Do not use `any` unless absolutely necessary (and verify why).
2.  **Mobile RWD:** Always check `md:` prefixes. Ensure touch targets are large enough (buttons/inputs).
3.  **No "Toy" UI:** Avoid huge cartoony icons or excessive gradients. Keep it clean and "Software" like.
4.  **Refactoring:** If modifying a core flow (like CBT), ensure the "Wizard" state logic is preserved.

## 7. Current Context (As of Jan 2026)
- The project has just undergone a major UI overhaul to match professional standards.
- `TaskPicker` and `CompleteCBT` have been modernized.
- `Home` uses real data for pending tasks.
- **Next Steps:** Charts/Dashboard visualization in `Dashboard.vue` might still need polishing to match the new aesthetic.
