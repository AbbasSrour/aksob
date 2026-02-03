# AKSOB Alumni App - Design & UI Guidelines

This document outlines the visual language and design system for the AKSOB Alumni application. The goal is to create a **premium, academic, and immersive** experience that integrates seamlessly with the existing AKSOB brand while introducing modern interactive elements.

## 1. Color Palette

The color scheme is built on the **AKSOB Brand Greens**, ranging from deep forest greens for backgrounds to vibrant mints for highlights.

### Primary Brand Colors
| Token             | Hex Value | Usage                                           |
|:------------------|:----------|:------------------------------------------------|
| `Primary Green`   | `#076951` | **Main Actions**, Buttons, Links, Active States |
| `Secondary Green` | `#16876b` | Hover States, Secondary Buttons, Highlights     |
| `Muted Green`     | `#365951` | Subtitles, Secondary Text, Borders              |
| `Darkest Green`   | `#192c27` | Headings, **Galaxy Background Base**            |

### Neutrals & Backgrounds
| Token         | Hex Value | Usage                                      |
|:--------------|:----------|:-------------------------------------------|
| `White`       | `#ffffff` | **Card Backgrounds**, Text on Dark, Popups |
| `Off-White`   | `#f8fafa` | Page Backgrounds (Non-Galaxy)              |
| `Pale Mint`   | `#E7F4F1` | Section Backgrounds, Subtle Highlights     |
| `Footer Grey` | `#F2F7F6` | Footer Backgrounds                         |

---

## 2. Typography

We use a modern, system-native font stack to ensure fast loading and familiarity, consistent with the main university website.

**Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`

### Hierarchy
- **Headings (H1-H3)**: Bold `700`, Darkest Green (`#192c27`). should feel authoritative.
- **Body Text**: Regular `400` or Medium `500`, Muted Green (`#365951`) or Dark Grey.
- **Labels (3D)**: Bold `700`, White (`#ffffff`), often with backdrop blur.

---

## 3. The "Galaxy" Visual Theme

The core feature is the **Galaxy of Stars**, which serves as the visual metaphor for the alumni network.

### Visual Rules
1.  **Background**: NOT pure black. Use a **Radial Gradient** from `Darkest Green (#192c27)` to Black. This maintains brand identity even in "space".
    ```css
    background: radial-gradient(circle at center, #192c27 0%, #000000 100%);
    ```
2.  **Stars (Alumni)**:
    - Should glow or have distinct colors based on their **Major/Cluster**.
    - **Cluster Labels**: Floating, semi-transparent labels that identify groups.
    - Style: Deep Green background (`rgba(7, 105, 81, 0.85)`), White Text, Backdrop Blur.

---

## 4. UI Components

### Cards & Popups
Popups (e.g., Alumni details) should feel lightweight but grounded.
- **Background**: White (`#ffffff`) or very slightly translucent (`rgba(255,255,255, 0.95)`).
- **Border Radius**: `10px` to `12px` (Modern, softened corners).
- **Shadow**: Soft, diffused shadows (`box-shadow: 0 4px 12px rgba(0,0,0,0.15)`).
- **Backdrop Filter**: `blur(10px)` (if transparent).

### Buttons
- **Primary Button**:
    - Background: `Primary Green (#076951)`
    - Text: White
    - Radius: `8px`
    - Hover: `Secondary Green (#16876b)`
    - Transition: `background-color 0.2s ease`

### Interactions
- **Micro-animations**: Hover effects should be immediate but smooth (`0.2s` or `0.3s`).
- **Cursor**: Change to `pointer` explicitly when hovering interactive 3D elements (stars).

---

## 5. Layout Principles
- **Cleanliness**: Avoid clutter. The Galaxy view is complex; the UI overlay should be minimal.
- **Focus**: When a user interacts with a star, the rest of the UI should fade or not compete for attention.
