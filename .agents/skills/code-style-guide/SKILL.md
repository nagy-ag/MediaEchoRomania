---
name: code-style-guide
description: Defines how code must be written in the project. Enforces modular architecture, reuse, separation of concerns, configuration-driven values, localization support, and strict adherence to the defined tech stack. The rule governs structure, maintainability, and consistency, not feature behavior.
---

# Code Style Guide Rule

This rule defines **how code must be written** across the entire project.  
It governs architecture, modularity, configuration practices, reuse patterns, and separation between frontend, backend, and worker responsibilities.

The rule **does not define what features to implement**, only **how the implementation must be structured**.
Never run npm run dev, assume it is already running.
---

# 1. Core Principles

### 1.1 Modularity
Code MUST be written in **small, composable, reusable modules**.

- Each module MUST have a **single responsibility**.
- Modules MUST be designed so they can be **replaced or modified independently**.
- Avoid tightly coupled logic across modules.
- Prefer composition over monolithic implementations.

Large files MUST be refactored into:

- components
- hooks
- utilities
- services
- configuration modules

---

### 1.2 Separation of Concerns

The codebase MUST strictly separate responsibilities between layers.

Frontend responsibilities:
- UI rendering
- state presentation
- user interaction
- visualization

Backend responsibilities (Convex):
- data persistence
- business logic
- querying and mutations
- real-time data synchronization

Worker responsibilities (Python service):
- ingestion
- heavy computation
- AI processing
- embeddings
- clustering
- background tasks

Frontend code MUST NOT contain backend logic.  
Backend code MUST NOT contain UI logic.

---

### 1.3 Reusability

All reusable logic MUST be abstracted.

Examples include:

- UI components
- layout structures
- hooks
- styling tokens
- chart primitives
- API utilities
- table configurations

Reusable components MUST be written in a **generic way** so they can support multiple use cases.

Duplication MUST be avoided.

If the same logic appears more than once, it MUST be extracted.

---

# 2. Configuration Over Hardcoding

Hardcoded values MUST NOT be used.

Instead use:

- configuration files
- constants
- theme tokens
- environment variables
- translation dictionaries
- reusable schemas

Examples of values that MUST NOT be hardcoded:

- colors
- spacing
- text labels
- API endpoints
- feature flags
- language strings
- chart scales
- UI sizes

Values MUST be defined in centralized configuration modules.

---

# 3. Internationalization (i18n)

All user-facing text MUST support localization.

Supported languages:

- English (en)
- Hungarian (hu)
- Romanian (ro)

Requirements:

- No UI text may be written inline.
- All text MUST come from translation dictionaries.
- Keys MUST be semantic and stable.
- Components MUST accept translated text via props or translation hooks.

Language switching MUST NOT require code modification.

---

# 4. Theming and Design Tokens

The UI MUST support **light and dark themes**.

Theme logic MUST be driven by **design tokens**, not hardcoded values.

Tokens MUST include:

- colors
- typography
- spacing
- borders
- shadows
- animation durations

Components MUST reference tokens rather than raw values.

Example principle: component → token → theme → value

Never: component → hardcoded value

---

# 5. Component Architecture

UI MUST follow a layered component architecture.

Typical structure:

- primitives (basic UI elements)
- shared components
- feature components
- layout components
- pages

Guidelines:

Components MUST:

- be small
- have clear props
- avoid internal hidden state when unnecessary
- remain reusable outside their initial feature

Complex logic MUST be extracted into hooks or utilities.

---

# 6. State Management

State MUST follow clear boundaries.

Use:

- server state from Convex
- local UI state for presentation
- derived state where possible

Avoid:

- duplicated state
- unnecessary global state
- tightly coupled state logic

State transformations SHOULD be implemented using pure functions.

---

# 7. Data Flow

Data flow MUST be predictable.

Guidelines:

- Data should flow **top-down** through props.
- Avoid deep prop drilling by using proper abstractions.
- Backend queries MUST remain separate from presentation logic.
- Components MUST receive prepared data whenever possible.

---

# 8. Visualization Structure

Visualization code MUST be modular.

Each visualization MUST separate:

- data preparation
- layout calculation
- rendering
- interaction handling

Visualization components MUST remain reusable and configurable.

Charts and graphs MUST accept configuration rather than embedding fixed values.

---

# 9. Type Safety

TypeScript MUST run in **strict mode**.

Requirements:

- explicit types for public APIs
- strongly typed props
- typed data models
- typed API responses

Avoid:

- `any`
- implicit type coercion
- unsafe casts

Types MUST be shared where appropriate between frontend and backend.

---

# 10. File and Folder Organization

Code MUST follow a predictable structure.

Folders SHOULD be organized by **feature or responsibility**, not arbitrary grouping.

Avoid:

- dumping logic into large folders
- mixing unrelated concerns in the same directory

Files SHOULD remain small and focused.

---

# 11. Naming Conventions

Names MUST be:

- descriptive
- consistent
- semantic

Avoid:

- abbreviations
- single-letter names
- unclear naming

Examples of good naming patterns:

- `useArticleFilters`
- `EntityGraphNode`
- `buildTimelineData`

Names MUST reflect **purpose and behavior**.

---

# 12. Extensibility

All code MUST be written with future modification in mind.

Design guidelines:

- avoid rigid implementations
- avoid assumptions about fixed data structures
- prefer configuration-driven patterns
- expose extension points where reasonable

Adding new features SHOULD require **minimal modification to existing code**.

---

# 13. Error Handling

Errors MUST be handled explicitly.

Requirements:

- avoid silent failures
- surface errors clearly
- ensure recoverable states where possible

Async logic MUST handle:

- loading states
- error states
- success states

---

# 14. Performance Awareness

Code SHOULD avoid unnecessary work.

Guidelines:

- memoize expensive calculations
- avoid redundant renders
- keep heavy computations outside UI components

Computational tasks MUST be delegated to backend or worker services.

---

# 15. Readability and Maintainability

Code MUST prioritize long-term maintainability.

Guidelines:

- prefer clarity over cleverness
- keep functions short
- break complex logic into named helpers
- maintain consistent formatting

Comments SHOULD explain **why**, not **what**.

---

# 16. Technology Adherence

All implementations MUST respect the defined project stack.

Frontend:
- Next.js App Router
- React
- TypeScript
- Tailwind
- shadcn/ui

Backend:
- Convex

Worker:
- Python service

Do not introduce alternative frameworks or libraries without strong justification.

---

# 17. Consistency

Consistency across the codebase is mandatory.

All new code MUST match:

- architectural patterns
- naming conventions
- folder structure
- styling approaches

# 18. Python

For python code modularity, consistency and clean/readabe code also applies.
When coding always activate .venv in the folder where you write the python codes, and also update requirements.txt anytime a new library/package is added and always use latest compatible versions, always use web search tool to decide this.

When modifying existing code, follow the patterns already established in that module.

---