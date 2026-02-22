# AKSOB Design System

This document contains all design tokens and foundational design decisions for the AKSOB Alumni application. The goal is to create a **premium, academic, and immersive** experience that integrates seamlessly with the existing AKSOB brand.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Border & Shadows](#border--shadows)
5. [Transitions & Animation](#transitions--animation)
6. [Breakpoints](#breakpoints)
7. [Z-Index Scale](#z-index-scale)
8. [Galaxy Theme](#galaxy-theme)

---

## Color Palette

### Primary Colors (The "Academic Galaxy" Theme)

| Token               | Hex       | RGB                 | Usage                                    |
|---------------------|-----------|---------------------|------------------------------------------|
| `--aksob-primary`   | `#076951` | `rgb(7, 105, 81)`   | Primary buttons, links, active states    |
| `--aksob-secondary` | `#16876b` | `rgb(22, 135, 107)` | Hover states, secondary actions          |
| `--aksob-muted`     | `#365951` | `rgb(54, 89, 81)`   | Secondary text, borders, subtle elements |
| `--aksob-darkest`   | `#192c27` | `rgb(25, 44, 39)`   | Headings, galaxy background base         |

### Neutral Colors

| Token           | Hex       | Usage                                  |
|-----------------|-----------|----------------------------------------|
| `--white`       | `#FFFFFF` | Card backgrounds, primary text on dark |
| `--off-white`   | `#F8FAFA` | Page backgrounds (light mode)          |
| `--pale-mint`   | `#E7F4F1` | Subtle highlights, selected states     |
| `--footer-grey` | `#F2F7F6` | Footer backgrounds, dividers           |
| `--gray-200`    | `#E5E7EB` | Borders (light mode)                   |
| `--gray-300`    | `#D1D5DB` | Secondary text (dark mode)             |
| `--gray-400`    | `#9CA3AF` | Placeholder text                       |
| `--gray-500`    | `#6B7280` | Tertiary text                          |
| `--gray-600`    | `#4B5563` | Secondary text (light mode)            |
| `--gray-700`    | `#374151` | Emphasized text                        |
| `--gray-800`    | `#1F2937` | Strong text                            |
| `--gray-900`    | `#111827` | Headings on light                      |
| `--gray-50`     | `#F9FAFB` | Subtle backgrounds                     |
| `--gray-100`    | `#F3F4F6` | Input backgrounds                      |

### Semantic Colors

| Token       | Hex       | Usage                               |
|-------------|-----------|-------------------------------------|
| `--success` | `#10B981` | Success messages, online indicators |
| `--error`   | `#EF4444` | Error states, validation failures   |
| `--warning` | `#F59E0B` | Warning messages                    |
| `--info`    | `#3B82F6` | Informational highlights            |

---

## Typography

### Font Stack

```css
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

**Fallback Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`

### Type Scale

| Element        | Size            | Weight         | Line Height | Color             |
|----------------|-----------------|----------------|-------------|-------------------|
| **H1**         | 36px / 2.25rem  | 700 (Bold)     | 1.2         | `--aksob-darkest` |
| **H2**         | 30px / 1.875rem | 700 (Bold)     | 1.25        | `--aksob-darkest` |
| **H3**         | 24px / 1.5rem   | 600 (Semibold) | 1.3         | `--aksob-darkest` |
| **H4**         | 20px / 1.25rem  | 600 (Semibold) | 1.4         | `--aksob-darkest` |
| **Body**       | 16px / 1rem     | 400 (Regular)  | 1.5         | `--aksob-muted`   |
| **Body Small** | 14px / 0.875rem | 400 (Regular)  | 1.5         | `--gray-600`      |
| **Caption**    | 12px / 0.75rem  | 500 (Medium)   | 1.4         | `--gray-600`      |
| **Button**     | 14px / 0.875rem | 500 (Medium)   | 1           | Inherited         |

### Typography Principles

- **Headings (H1-H3)**: Bold `700`, Darkest Green (`#192c27`). Should feel authoritative.
- **Body Text**: Regular `400` or Medium `500`, Muted Green (`#365951`) or Dark Grey.
- **Labels (3D)**: Bold `700`, White (`#ffffff`), often with backdrop blur.

---

## Spacing System

Base unit: `4px`

| Token        | Value | Usage                             |
|--------------|-------|-----------------------------------|
| `--space-1`  | 4px   | Tight gaps, icon padding          |
| `--space-2`  | 8px   | Small gaps, button padding-x      |
| `--space-3`  | 12px  | Input padding, card inner spacing |
| `--space-4`  | 16px  | Standard component gaps           |
| `--space-5`  | 20px  | Section padding                   |
| `--space-6`  | 24px  | Card padding, large gaps          |
| `--space-8`  | 32px  | Section margins                   |
| `--space-10` | 40px  | Page section spacing              |
| `--space-12` | 48px  | Large section gaps                |
| `--space-16` | 64px  | Navigation height, major sections |

---

## Border & Shadows

### Border Radius

| Token           | Value  | Usage                  |
|-----------------|--------|------------------------|
| `--radius-sm`   | 4px    | Small elements, badges |
| `--radius-md`   | 8px    | Buttons, inputs        |
| `--radius-lg`   | 12px   | Cards, modals          |
| `--radius-xl`   | 16px   | Large cards, panels    |
| `--radius-2xl`  | 24px   | Message bubbles        |
| `--radius-full` | 9999px | Avatars, pills         |

### Shadows

| Token           | Value                             | Usage             |
|-----------------|-----------------------------------|-------------------|
| `--shadow-sm`   | `0 1px 2px rgba(0, 0, 0, 0.05)`   | Subtle elevation  |
| `--shadow-md`   | `0 4px 12px rgba(0, 0, 0, 0.15)`  | Cards, dropdowns  |
| `--shadow-lg`   | `0 10px 25px rgba(0, 0, 0, 0.20)` | Modals, popovers  |
| `--shadow-glow` | `0 0 20px rgba(7, 105, 81, 0.30)` | Galaxy star hover |

### Glassmorphism Effect

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.20);
}

.glass-panel-dark {
  background: rgba(25, 44, 39, 0.80);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.10);
}
```

---

## Transitions & Animation

### Standard Transitions

| Property                     | Duration | Easing   |
|------------------------------|----------|----------|
| Colors (bg, text, border)    | 200ms    | ease     |
| Transform (scale, translate) | 200ms    | ease-out |
| Opacity                      | 150ms    | ease     |
| Box-shadow                   | 200ms    | ease     |

### Animation Keyframes

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Pulse (loading) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Typing Dots */
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}
```

### Interaction Principles

- **Micro-animations**: Hover effects should be immediate but smooth (`0.2s` or `0.3s`).
- **Cursor**: Change to `pointer` explicitly when hovering interactive 3D elements (stars).

---

## Breakpoints

| Name  | Min Width | Usage                           |
|-------|-----------|---------------------------------|
| `sm`  | 640px     | Mobile landscape, small tablets |
| `md`  | 768px     | Tablets                         |
| `lg`  | 1024px    | Small laptops                   |
| `xl`  | 1280px    | Desktops (max-width container)  |
| `2xl` | 1536px    | Large screens                   |

### Container

```css
.container {
  max-width: 1280px; /* xl */
  margin: 0 auto;
  padding: 0 16px;
}
```

---

## Z-Index Scale

| Layer          | Value | Usage               |
|----------------|-------|---------------------|
| `--z-base`     | 0     | Default content     |
| `--z-dropdown` | 10    | Dropdown menus      |
| `--z-sticky`   | 20    | Sticky headers      |
| `--z-overlay`  | 30    | Overlays, backdrops |
| `--z-modal`    | 40    | Modal dialogs       |
| `--z-popover`  | 50    | Popovers, tooltips  |
| `--z-toast`    | 60    | Toast notifications |

---

## Galaxy Theme

The core feature is the **Galaxy of Stars**, which serves as the visual metaphor for the alumni network.

### Background

NOT pure black. Use a **Radial Gradient** from `Darkest Green (#192c27)` to Black. This maintains brand identity even in "space".

```css
background: radial-gradient(circle at center, #192c27 0%, #000000 100%);
```

**CSS Variable:** `--galaxy-bg`

### Stars (Alumni)

- Should glow or have distinct colors based on their **Major/Cluster**.
- **Cluster Labels**: Floating, semi-transparent labels that identify groups.
- Style: Deep Green background (`rgba(7, 105, 81, 0.85)`), White Text, Backdrop Blur.

### Galaxy-Specific Tokens

| Token           | Value                                                         | Usage                          |
|-----------------|---------------------------------------------------------------|--------------------------------|
| `--galaxy-bg`   | `radial-gradient(circle at center, #192c27 0%, #000000 100%)` | Galaxy scene background        |
| `--glass-white` | `rgba(255, 255, 255, 0.80)`                                   | Glassmorphism overlays (light) |
| `--glass-dark`  | `rgba(25, 44, 39, 0.80)`                                      | Glassmorphism overlays (dark)  |
| `--star-glow`   | `rgba(7, 105, 81, 0.85)`                                      | Star label backgrounds         |

---

## Layout Principles

- **Cleanliness**: Avoid clutter. The Galaxy view is complex; the UI overlay should be minimal.
- **Focus**: When a user interacts with a star, the rest of the UI should fade or not compete for attention.

---

*Last Updated: February 2026*
