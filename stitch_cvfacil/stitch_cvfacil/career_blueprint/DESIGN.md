# Design System Document

## 1. Overview & Creative North Star: "The Editorial Architect"
The design system for this professional productivity tool moves beyond the generic "SaaS template" look. Our Creative North Star is **The Editorial Architect**. 

We treat resume building not as a data-entry task, but as a high-end curation process. The system breaks the rigid grid through **intentional asymmetry** and **tonal depth**. By utilizing a sophisticated scale of whites and soft grays, we create a layout that feels like stacked sheets of premium stationery. The interface should feel invisible, allowing the user's professional content to take center stage, supported by AI insights that appear as "ambient whispers" rather than intrusive pop-ups.

---

## 2. Colors & Surface Architecture
We move away from the "box-in-a-box" layout. The primary goal is to define space through light and texture rather than lines.

### The Palette
*   **Primary (Professional Blue):** `#0b55cf` (Primary) | `#3870ea` (Container). Use for critical actions and brand presence.
*   **Surface (The Canvas):** `#f8f9fa` (Surface) | `#ffffff` (Lowest Container).
*   **Success (Positive AI Feedback):** `#1a6c23` (Tertiary) | `#37863a` (Container). Used sparingly for AI suggestions and completion states.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. Boundaries must be defined through background shifts. 
*   Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f3f4f5) background to create definition. 
*   For horizontal separations, use a `4rem` (16) vertical spacing gap instead of a divider line.

### The Glass & Gradient Rule
To instill a "high-quality productivity" feel, use **Glassmorphism** for floating headers or navigation bars.
*   **Token:** `surface` at 80% opacity with a `12px` backdrop-blur.
*   **Signature Gradients:** For primary CTAs (e.g., "Export Resume"), use a subtle linear gradient from `primary` (#0b55cf) to `primary_container` (#3870ea) at a 135-degree angle. This adds "soul" and prevents the UI from feeling flat.

---

## 3. Typography: The Hierarchical Scale
The system uses a pairing of **Manrope** (Geometric, authoritative) for headlines and **Inter** (Functional, highly legible) for data entry and body copy.

*   **Display (Manrope):** `display-lg` (3.5rem). Use for empty states or "Success" milestones. Tighten letter-spacing by -2% for a premium look.
*   **Headlines (Manrope):** `headline-sm` (1.5rem) to `headline-lg` (2rem). Use for section titles (e.g., "Work Experience").
*   **Titles (Inter):** `title-md` (1.125rem). Semi-bold. Use for form labels or sub-headers within cards.
*   **Body (Inter):** `body-md` (0.875rem). Use for all user-generated content and AI-generated descriptions.

---

## 4. Elevation & Depth: Tonal Layering
We reject traditional drop shadows in favor of **Ambient Light** and **Tonal Stacking**.

*   **The Layering Principle:** 
    1.  Base: `surface` (#f8f9fa)
    2.  Section: `surface_container_low` (#f3f4f5)
    3.  Interactive Card: `surface_container_lowest` (#ffffff)
*   **Ambient Shadows:** If an element must "float" (like a FAB or a modal), use a shadow with a 32px blur, 0px offset, and 6% opacity of the `on_surface` color. It should look like a soft glow, not a hard edge.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use `outline_variant` (#c1c6d6) at **15% opacity**. This creates a "whisper" of a boundary that doesn't clutter the visual field.

---

## 5. Components

### Buttons & CTAs
*   **Primary:** Gradient fill (`primary` to `primary_container`), `md` (0.75rem/12px) corner radius. Height: 56px for mobile ergonomics.
*   **Tertiary (AI Action):** Background `tertiary_fixed` (#a3f69c) with `on_tertiary_fixed` (#002204) text. This signals a "smart" or "positive" action.

### Input Fields (The "Paper" Input)
*   **Style:** No background fill. A bottom-only "Ghost Border" (20% opacity `outline`). 
*   **Focus State:** The bottom border transitions to 2px `primary` (#0b55cf).
*   **AI Suggestion Chips:** Use `secondary_container` (#d6e3fb) with `md` (12px) rounding. These should appear to "slide" under the input field.

### Resume Cards & Lists
*   **Forbid Dividers:** Do not use lines between work experience entries. Use `spacing-8` (2rem) of white space.
*   **Nesting:** Place the "Job Title" in `headline-sm` and the "Company Name" in `body-sm` with 50% opacity to create an editorial hierarchy.

### The "AI Pulse" Component
A bespoke component for this system. A small, glowing orb or subtle background shimmer using a gradient of `tertiary_fixed` and `primary_fixed`. Use this to indicate the AI is currently "thinking" or "optimizing" a specific text block.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins (e.g., more padding at the top than the bottom of a card) to create a modern, editorial feel.
*   **Do** use `tertiary` (green) strictly for "Value Add" moments—AI improvements, resume score increases, or successful saves.
*   **Do** allow for generous white space. If you think there is enough space, add `spacing-2` (0.5rem) more.

### Don’t:
*   **Don't** use pure black (#000000). Always use `on_surface` (#191c1d) for text to maintain a soft, professional contrast.
*   **Don't** use standard "Material" 4px rounding. Stick strictly to the `md` (12px) or `lg` (16px) scale to maintain the "premium stationery" aesthetic.
*   **Don't** use icons without purpose. Every icon should be paired with text or have a clear, singular function to avoid cognitive load.