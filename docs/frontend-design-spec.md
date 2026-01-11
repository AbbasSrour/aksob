# AKSOB Frontend Design Specification
## UI/UX Blueprint with Mock Data

> **Purpose**: This document serves as a Figma-like specification for implementing the AKSOB frontend. It contains visual specs, component states, mock data, and layout structures. **No backend integration details** — purely frontend design.

---

# Table of Contents

1. [Design System Foundation](#part-1-design-system-foundation)
2. [Shared UI Components](#part-2-shared-ui-components)
3. [Authentication Pages](#part-3-authentication-pages)
4. [Chat Interface](#part-4-chat-interface)
5. [Profile & Navigation](#part-5-profile--navigation)
6. [Mock Data Reference](#part-6-mock-data-reference)

---

# Part 1: Design System Foundation

## 1.1 Color Palette

### Primary Colors (The "Academic Galaxy" Theme)

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--aksob-primary` | `#076951` | `rgb(7, 105, 81)` | Primary buttons, links, active states |
| `--aksob-secondary` | `#16876b` | `rgb(22, 135, 107)` | Hover states, secondary actions |
| `--aksob-muted` | `#365951` | `rgb(54, 89, 81)` | Secondary text, borders, subtle elements |
| `--aksob-darkest` | `#192c27` | `rgb(25, 44, 39)` | Headings, galaxy background base |

### Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--white` | `#FFFFFF` | Card backgrounds, primary text on dark |
| `--off-white` | `#F8FAFA` | Page backgrounds (light mode) |
| `--pale-mint` | `#E7F4F1` | Subtle highlights, selected states |
| `--footer-grey` | `#F2F7F6` | Footer backgrounds, dividers |
| `--gray-200` | `#E5E7EB` | Borders (light mode) |
| `--gray-600` | `#4B5563` | Secondary text (light mode) |
| `--gray-300` | `#D1D5DB` | Secondary text (dark mode) |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#10B981` | Success messages, online indicators |
| `--error` | `#EF4444` | Error states, validation failures |
| `--warning` | `#F59E0B` | Warning messages |
| `--info` | `#3B82F6` | Informational highlights |

### Galaxy-Specific

| Token | Value | Usage |
|-------|-------|-------|
| `--galaxy-bg` | `radial-gradient(circle at center, #192c27 0%, #000000 100%)` | Galaxy scene background |
| `--glass-white` | `rgba(255, 255, 255, 0.80)` | Glassmorphism overlays (light) |
| `--glass-dark` | `rgba(25, 44, 39, 0.80)` | Glassmorphism overlays (dark) |
| `--star-glow` | `rgba(7, 105, 81, 0.85)` | Star label backgrounds |

---

## 1.2 Typography

### Font Stack

```css
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-------------|-------|
| **H1** | 36px / 2.25rem | 700 (Bold) | 1.2 | `--aksob-darkest` |
| **H2** | 30px / 1.875rem | 700 (Bold) | 1.25 | `--aksob-darkest` |
| **H3** | 24px / 1.5rem | 600 (Semibold) | 1.3 | `--aksob-darkest` |
| **H4** | 20px / 1.25rem | 600 (Semibold) | 1.4 | `--aksob-darkest` |
| **Body** | 16px / 1rem | 400 (Regular) | 1.5 | `--aksob-muted` |
| **Body Small** | 14px / 0.875rem | 400 (Regular) | 1.5 | `--gray-600` |
| **Caption** | 12px / 0.75rem | 500 (Medium) | 1.4 | `--gray-600` |
| **Button** | 14px / 0.875rem | 500 (Medium) | 1 | Inherited |

---

## 1.3 Spacing System

Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Small gaps, button padding-x |
| `--space-3` | 12px | Input padding, card inner spacing |
| `--space-4` | 16px | Standard component gaps |
| `--space-5` | 20px | Section padding |
| `--space-6` | 24px | Card padding, large gaps |
| `--space-8` | 32px | Section margins |
| `--space-10` | 40px | Page section spacing |
| `--space-12` | 48px | Large section gaps |
| `--space-16` | 64px | Navigation height, major sections |

---

## 1.4 Border & Shadows

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards, panels |
| `--radius-2xl` | 24px | Message bubbles |
| `--radius-full` | 9999px | Avatars, pills |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.15)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 25px rgba(0, 0, 0, 0.20)` | Modals, popovers |
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

## 1.5 Transitions & Animation

### Standard Transitions

| Property | Duration | Easing |
|----------|----------|--------|
| Colors (bg, text, border) | 200ms | ease |
| Transform (scale, translate) | 200ms | ease-out |
| Opacity | 150ms | ease |
| Box-shadow | 200ms | ease |

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

---

## 1.6 Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops (max-width container) |
| `2xl` | 1536px | Large screens |

### Container

```css
.container {
  max-width: 1280px; /* xl */
  margin: 0 auto;
  padding: 0 16px;
}
```

---

## 1.7 Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default content |
| `--z-dropdown` | 10 | Dropdown menus |
| `--z-sticky` | 20 | Sticky headers |
| `--z-overlay` | 30 | Overlays, backdrops |
| `--z-modal` | 40 | Modal dialogs |
| `--z-popover` | 50 | Popovers, tooltips |
| `--z-toast` | 60 | Toast notifications |

---

# Part 2: Shared UI Components

## 2.1 Button Component

### Variants

#### Primary Button
```
┌─────────────────────────────────┐
│         Button Label            │
└─────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `--aksob-primary` (#076951) |
| Text Color | `#FFFFFF` |
| Font | 14px, 500 weight |
| Padding | 12px 24px |
| Border Radius | 8px |
| Min Height | 44px |
| Cursor | pointer |

**States:**
| State | Background | Text | Other |
|-------|------------|------|-------|
| Default | `#076951` | `#FFFFFF` | — |
| Hover | `#16876b` | `#FFFFFF` | — |
| Active | `#065743` | `#FFFFFF` | scale(0.98) |
| Disabled | `#076951` opacity 50% | `#FFFFFF` | cursor: not-allowed |
| Loading | `#076951` | Hidden | Show spinner |

#### Secondary Button
| Property | Value |
|----------|-------|
| Background | `transparent` |
| Text Color | `--aksob-primary` |
| Border | 1px solid `--aksob-primary` |
| Hover Background | `--pale-mint` (#E7F4F1) |

#### Ghost Button
| Property | Value |
|----------|-------|
| Background | `transparent` |
| Text Color | `--gray-600` |
| Hover Background | `--gray-100` |

#### Danger Button
| Property | Value |
|----------|-------|
| Background | `--error` (#EF4444) |
| Text Color | `#FFFFFF` |
| Hover Background | `#DC2626` |

### Button Sizes

| Size | Padding | Font Size | Min Height |
|------|---------|-----------|------------|
| `sm` | 8px 16px | 12px | 32px |
| `md` | 12px 24px | 14px | 44px |
| `lg` | 16px 32px | 16px | 52px |

### Button with Icon

```
┌─────────────────────────────────┐
│  [Icon]  Button Label           │
└─────────────────────────────────┘

Icon size: 16px (sm), 20px (md), 24px (lg)
Gap between icon and label: 8px
```

---

## 2.2 Input Component

### Text Input

```
Label Text
┌─────────────────────────────────┐
│ Placeholder text...             │
└─────────────────────────────────┘
Helper text appears here
```

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border | 1px solid `--gray-200` |
| Border Radius | 8px |
| Padding | 12px 16px |
| Font Size | 16px |
| Min Height | 48px |
| Placeholder Color | `--gray-400` |

**States:**
| State | Border Color | Other |
|-------|--------------|-------|
| Default | `--gray-200` | — |
| Focus | `--aksob-primary` | ring: 2px `--aksob-primary` opacity 20% |
| Error | `--error` | ring: 2px `--error` opacity 20% |
| Disabled | `--gray-200` | bg: `--gray-50`, cursor: not-allowed |

### Label Styling

| Property | Value |
|----------|-------|
| Font Size | 14px |
| Font Weight | 500 |
| Color | `--aksob-darkest` |
| Margin Bottom | 6px |

### Helper/Error Text

| Type | Color | Font Size |
|------|-------|-----------|
| Helper | `--gray-600` | 12px |
| Error | `--error` | 12px |

---

## 2.3 Password Input Component

```
Password
┌─────────────────────────────────┬───┐
│ ••••••••••••                    │ 👁 │
└─────────────────────────────────┴───┘
```

| Element | Specification |
|---------|---------------|
| Base | Same as Text Input |
| Toggle Button | 44px × 44px, right-aligned inside input |
| Eye Icon | 20px, `--gray-400` default, `--aksob-primary` when visible |
| Icon States | `EyeIcon` (hidden), `EyeOffIcon` (visible) |

**Behavior:**
- Click toggle switches between `type="password"` and `type="text"`
- Icon changes to reflect current state

---

## 2.4 Password Strength Indicator

```
Password
┌─────────────────────────────────┬───┐
│ MyP@ssw0rd                      │ 👁 │
└─────────────────────────────────┴───┘
┌────┬────┬────┬────┐
│████│████│████│    │  Strong
└────┴────┴────┴────┘
```

| Strength Level | Bars Filled | Color | Label |
|----------------|-------------|-------|-------|
| Weak | 1/4 | `--error` | "Weak" |
| Fair | 2/4 | `--warning` | "Fair" |
| Good | 3/4 | `--info` | "Good" |
| Strong | 4/4 | `--success` | "Strong" |

| Property | Value |
|----------|-------|
| Bar Height | 4px |
| Bar Gap | 4px |
| Bar Radius | 2px |
| Label Font | 12px, 500 weight |
| Margin Top | 8px |

**Strength Rules (Visual Feedback Only):**
- 8+ characters: +1
- Contains lowercase: +1
- Contains uppercase: +1
- Contains number: +1
- Contains special char: +1

---

## 2.5 User Type Selector

```
I am a...

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │
│   🎓            │  │   🎓            │  │   👔            │
│   Student       │  │   Alumni        │  │   Faculty       │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
     ○ Selected           ○                    ○
```

| Property | Value |
|----------|-------|
| Card Size | 120px × 100px |
| Gap | 16px |
| Border Radius | 12px |
| Border | 2px solid `--gray-200` |
| Selected Border | 2px solid `--aksob-primary` |
| Selected Background | `--pale-mint` |
| Icon Size | 32px |
| Label Font | 14px, 500 weight |

**States:**
| State | Border | Background |
|-------|--------|------------|
| Default | `--gray-200` | `#FFFFFF` |
| Hover | `--gray-300` | `--gray-50` |
| Selected | `--aksob-primary` | `--pale-mint` |

---

## 2.6 Card Component

```
┌─────────────────────────────────────────┐
│                                         │
│  Card Title                             │
│                                         │
│  Card content goes here. This is a      │
│  reusable container for grouping        │
│  related content.                       │
│                                         │
└─────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border Radius | 12px |
| Padding | 24px |
| Shadow | `--shadow-md` |
| Border | none (or 1px solid `--gray-100` for subtle) |

### Card Variants

| Variant | Background | Border | Shadow |
|---------|------------|--------|--------|
| Default | `#FFFFFF` | none | `--shadow-md` |
| Outlined | `#FFFFFF` | 1px solid `--gray-200` | none |
| Glass | `rgba(255,255,255,0.95)` | 1px solid `rgba(255,255,255,0.2)` | `--shadow-md` + blur |
| Elevated | `#FFFFFF` | none | `--shadow-lg` |

---

## 2.7 Checkbox Component

```
┌──┐
│✓ │  Remember me
└──┘
```

| Property | Value |
|----------|-------|
| Box Size | 20px × 20px |
| Border Radius | 4px |
| Border | 2px solid `--gray-300` |
| Checked Background | `--aksob-primary` |
| Checked Border | `--aksob-primary` |
| Checkmark | White, 2px stroke |
| Label Gap | 8px |
| Label Font | 14px, 400 weight |

**States:**
| State | Border | Background |
|-------|--------|------------|
| Default | `--gray-300` | `#FFFFFF` |
| Hover | `--aksob-muted` | `#FFFFFF` |
| Checked | `--aksob-primary` | `--aksob-primary` |
| Disabled | `--gray-200` | `--gray-100` |

---

## 2.8 Divider Component

### Horizontal Divider
```
──────────────────────────────────────────
```

| Property | Value |
|----------|-------|
| Height | 1px |
| Background | `--gray-200` |
| Margin | 24px 0 |

### Divider with Text
```
─────────────  OR  ─────────────
```

| Property | Value |
|----------|-------|
| Text Font | 12px, 500 weight |
| Text Color | `--gray-500` |
| Text Padding | 0 16px |
| Line Color | `--gray-200` |

---

## 2.9 Loading Spinner

### Spinner Sizes

```
   ◠        (sm: 16px)
  
  ╭─╮       (md: 24px)
  ╰─╯
  
 ╭───╮      (lg: 40px)
 │   │
 ╰───╯
```

| Size | Diameter | Border Width |
|------|----------|--------------|
| `sm` | 16px | 2px |
| `md` | 24px | 2px |
| `lg` | 40px | 3px |

| Property | Value |
|----------|-------|
| Border Color | `--gray-200` |
| Active Border | `--aksob-primary` (top segment) |
| Animation | rotate 360deg, 0.8s linear infinite |

### Full Page Loading

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              ╭───╮                      │
│              │   │                      │
│              ╰───╯                      │
│                                         │
│           Loading...                    │
│                                         │
└─────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Backdrop | `rgba(255,255,255,0.80)` with blur |
| Spinner | `lg` size |
| Text | 14px, `--gray-600`, margin-top 16px |

---

## 2.10 Avatar Component

```
  ┌───┐      ┌─────┐      ┌───────┐
  │ JD│      │ JD  │      │  JD   │
  └───┘      └─────┘      └───────┘
   sm          md            lg
```

| Size | Diameter | Font Size |
|------|----------|-----------|
| `xs` | 24px | 10px |
| `sm` | 32px | 12px |
| `md` | 40px | 14px |
| `lg` | 56px | 20px |
| `xl` | 80px | 28px |

| Property | Value |
|----------|-------|
| Shape | Circle (`border-radius: 9999px`) |
| Background (no image) | `--aksob-muted` |
| Text Color | `#FFFFFF` |
| Font Weight | 600 |
| Border | 2px solid `#FFFFFF` (optional, for stacking) |

### Avatar with Status

```
  ┌───┐
  │ JD│●  ← Online indicator
  └───┘
```

| Status | Color | Size |
|--------|-------|------|
| Online | `--success` | 10px |
| Offline | `--gray-400` | 10px |
| Busy | `--error` | 10px |

Position: bottom-right, overlapping avatar edge by 2px

---

## 2.11 Badge Component

```
┌────────┐
│  New   │
└────────┘
```

| Variant | Background | Text Color |
|---------|------------|------------|
| Default | `--gray-100` | `--gray-700` |
| Primary | `--aksob-primary` | `#FFFFFF` |
| Success | `--success` bg 10% | `--success` |
| Warning | `--warning` bg 10% | `--warning` |
| Error | `--error` bg 10% | `--error` |

| Property | Value |
|----------|-------|
| Padding | 4px 8px |
| Font Size | 12px |
| Font Weight | 500 |
| Border Radius | 9999px (pill) |

### Notification Badge (Count)

```
  ┌─┐
  │3│  ← Positioned on parent element
  └─┘
```

| Property | Value |
|----------|-------|
| Min Width | 18px |
| Height | 18px |
| Background | `--error` |
| Text Color | `#FFFFFF` |
| Font Size | 10px |
| Font Weight | 600 |
| Position | absolute, top: -4px, right: -4px |

---

# Part 3: Authentication Pages

## 3.1 Auth Layout (Shared Wrapper)

All authentication pages share this layout structure:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                        │
│                      ░░  GALAXY BACKGROUND (blur)  ░░                       │
│                        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                        │
│                                                                             │
│                    ┌─────────────────────────────────┐                      │
│                    │                                 │                      │
│                    │         [AKSOB LOGO]            │                      │
│                    │                                 │                      │
│                    │    Welcome to AKSOB Alumni      │                      │
│                    │                                 │                      │
│                    │   ┌─────────────────────────┐   │                      │
│                    │   │                         │   │                      │
│                    │   │    [AUTH FORM SLOT]     │   │                      │
│                    │   │                         │   │                      │
│                    │   └─────────────────────────┘   │                      │
│                    │                                 │                      │
│                    │   Already have an account?      │                      │
│                    │   Sign in →                     │                      │
│                    │                                 │                      │
│                    └─────────────────────────────────┘                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layout Specifications

| Element | Specification |
|---------|---------------|
| **Page Background** | Galaxy gradient with 30% blur overlay |
| **Container** | Centered, max-width 440px, padding 40px |
| **Card Style** | Glass effect: `rgba(255,255,255,0.95)`, blur 12px |
| **Card Padding** | 32px |
| **Card Radius** | 16px |
| **Card Shadow** | `--shadow-lg` |

### Logo Section

| Property | Value |
|----------|-------|
| Logo Size | 48px height, auto width |
| Logo Margin | 0 0 24px 0 |
| Alignment | Center |

### Title Section

| Element | Style |
|---------|-------|
| Main Title | H2, `--aksob-darkest`, center |
| Subtitle | Body, `--gray-600`, center, margin-top 8px |

### Footer Links

| Property | Value |
|----------|-------|
| Font Size | 14px |
| Color | `--gray-600` |
| Link Color | `--aksob-primary` |
| Link Hover | `--aksob-secondary`, underline |
| Margin Top | 24px |
| Alignment | Center |

---

## 3.2 Login Page (`/auth/login`)

### Wireframe

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│         Welcome Back                │
│    Sign in to your account          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [G] Continue with Google    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────── OR ───────────         │
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐    │
│  │ name@lau.edu                │    │
│  └─────────────────────────────┘    │
│                                     │
│  Password                           │
│  ┌─────────────────────────────┬──┐ │
│  │ ••••••••••••                │👁│ │
│  └─────────────────────────────┴──┘ │
│                                     │
│  ┌──┐                               │
│  │  │ Remember me    Forgot password?│
│  └──┘                               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         Sign In             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Don't have an account? Sign up     │
│                                     │
└─────────────────────────────────────┘
```

### Form Fields

| Field | Type | Placeholder | Validation |
|-------|------|-------------|------------|
| Email | email | "name@lau.edu" | Required, valid email |
| Password | password | "Enter your password" | Required, min 8 chars |

### Components Used

| Component | Props/Notes |
|-----------|-------------|
| `SocialButton` | provider="google", fullWidth |
| `Divider` | text="OR" |
| `Input` | type="email" |
| `PasswordInput` | with visibility toggle |
| `Checkbox` | label="Remember me" |
| `Button` | variant="primary", fullWidth |

### States

| State | Behavior |
|-------|----------|
| Loading | Button shows spinner, inputs disabled |
| Error | Red border on invalid field, error message below |
| Success | Redirect to `?redirect` param or "/" |

### Mock Interaction Flow

```
1. User enters: john.doe@lau.edu.lb
2. User enters: MySecureP@ss123
3. User clicks "Sign In"
4. [Loading state: 1.5s]
5. Redirect to dashboard
```

---

## 3.3 Register Page (`/auth/register`)

### Wireframe

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│       Create Your Account           │
│    Join the AKSOB Alumni Network    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [G] Continue with Google    │    │
│  └─────────────────────────────┘    │
│                                     │
│  ─────────── OR ───────────         │
│                                     │
│  Full Name                          │
│  ┌─────────────────────────────┐    │
│  │ John Doe                    │    │
│  └─────────────────────────────┘    │
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐    │
│  │ john.doe@lau.edu.lb         │    │
│  └─────────────────────────────┘    │
│                                     │
│  Password                           │
│  ┌─────────────────────────────┬──┐ │
│  │ ••••••••••••                │👁│ │
│  └─────────────────────────────┴──┘ │
│  ┌────┬────┬────┬────┐              │
│  │████│████│████│    │  Strong      │
│  └────┴────┴────┴────┘              │
│                                     │
│  I am a...                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │   🎓    │ │   🎓    │ │   👔    ││
│  │ Student │ │ Alumni  │ │ Faculty ││
│  └─────────┘ └─────────┘ └─────────┘│
│                                     │
│  ┌─────────────────────────────┐    │
│  │       Create Account        │    │
│  └─────────────────────────────┘    │
│                                     │
│  Already have an account? Sign in   │
│                                     │
└─────────────────────────────────────┘
```

### Form Fields

| Field | Type | Placeholder | Validation |
|-------|------|-------------|------------|
| Full Name | text | "John Doe" | Required, min 2 chars |
| Email | email | "name@lau.edu.lb" | Required, valid email |
| Password | password | "Create a password" | Required, min 8 chars, strength indicator |
| User Type | select | — | Required, one of: student/alumni/faculty |

### User Type Cards Detail

```
┌─────────────────┐
│                 │
│       🎓        │  ← Lucide: GraduationCap
│                 │
│    Student      │
│                 │
│  Current LAU    │  ← Subtext (12px, gray-500)
│   student       │
│                 │
└─────────────────┘
```

| Type | Icon | Subtext |
|------|------|---------|
| Student | `GraduationCap` | "Current LAU student" |
| Alumni | `Award` | "LAU graduate" |
| Faculty | `Briefcase` | "Faculty or staff" |

### States

| State | Behavior |
|-------|----------|
| Loading | Button shows spinner, all inputs disabled |
| Validation Error | Field border red, error text below field |
| Email Exists | "An account with this email already exists" |
| Success | Redirect to `/auth/verify-email-sent` |

---

## 3.4 Forgot Password Page (`/auth/forgot-password`)

### Wireframe

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│       Forgot Password?              │
│  Enter your email and we'll send   │
│  you a link to reset your password  │
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐    │
│  │ name@lau.edu.lb             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Send Reset Link        │    │
│  └─────────────────────────────┘    │
│                                     │
│         ← Back to Sign In           │
│                                     │
└─────────────────────────────────────┘
```

### Form Fields

| Field | Type | Validation |
|-------|------|------------|
| Email | email | Required, valid email format |

### Success State

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│           ✓ Email Sent              │
│                                     │
│  We've sent a password reset link   │
│  to john.doe@lau.edu.lb             │
│                                     │
│  Didn't receive it?                 │
│  ┌─────────────────────────────┐    │
│  │        Resend Email         │    │  ← Secondary button
│  └─────────────────────────────┘    │
│                                     │
│         ← Back to Sign In           │
│                                     │
└─────────────────────────────────────┘
```

---

## 3.5 Reset Password Page (`/auth/reset-password`)

### Wireframe

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│      Create New Password            │
│   Enter a new password for your     │
│          account                    │
│                                     │
│  New Password                       │
│  ┌─────────────────────────────┬──┐ │
│  │ ••••••••••••                │👁│ │
│  └─────────────────────────────┴──┘ │
│  ┌────┬────┬────┬────┐              │
│  │████│████│████│████│  Strong      │
│  └────┴────┴────┴────┘              │
│                                     │
│  Confirm Password                   │
│  ┌─────────────────────────────┬──┐ │
│  │ ••••••••••••                │👁│ │
│  └─────────────────────────────┴──┘ │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Reset Password         │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Form Fields

| Field | Type | Validation |
|-------|------|------------|
| New Password | password | Required, min 8 chars, strength indicator |
| Confirm Password | password | Required, must match new password |

### Error States

| Error | Message |
|-------|---------|
| Passwords don't match | "Passwords do not match" |
| Token expired | "This reset link has expired. Please request a new one." |
| Token invalid | "Invalid reset link. Please request a new one." |

### Success State

Redirect to `/auth/login` with toast: "Password reset successful. Please sign in."

---

## 3.6 Verify Email Page (`/auth/verify-email`)

This page is shown when user clicks the verification link in their email.

### Loading State

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│              ╭───╮                  │
│              │   │                  │
│              ╰───╯                  │
│                                     │
│      Verifying your email...        │
│                                     │
└─────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│         ✓ Email Verified!           │
│                                     │
│   Your email has been verified.     │
│   You can now access all features.  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Continue to App        │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│        ✗ Verification Failed        │
│                                     │
│   This verification link is         │
│   invalid or has expired.           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Request New Link        │    │
│  └─────────────────────────────┘    │
│                                     │
│         ← Back to Sign In           │
│                                     │
└─────────────────────────────────────┘
```

---

## 3.7 Verify Email Sent Page (`/auth/verify-email-sent`)

Shown after successful registration.

```
┌─────────────────────────────────────┐
│                                     │
│            [AKSOB LOGO]             │
│                                     │
│         📧 Check Your Email         │
│                                     │
│   We've sent a verification link    │
│   to:                               │
│                                     │
│      john.doe@lau.edu.lb            │  ← Bold, --aksob-primary
│                                     │
│   Click the link in the email to    │
│   verify your account.              │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Open Email App          │    │  ← Primary button
│  └─────────────────────────────┘    │
│                                     │
│  Didn't receive the email?          │
│  Check spam folder or               │
│  Resend verification email          │  ← Link
│                                     │
│         ← Back to Sign In           │
│                                     │
└─────────────────────────────────────┘
```

### Resend Behavior

| State | Button Text | Disabled |
|-------|-------------|----------|
| Default | "Resend verification email" | No |
| Sending | "Sending..." | Yes |
| Sent | "Email sent! Resend again in 60s" | Yes (countdown) |

---

## 3.8 Social Button Component

### Google Sign-In Button

```
┌─────────────────────────────────────┐
│  [G]  Continue with Google          │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Border | 1px solid `--gray-200` |
| Text Color | `--gray-700` |
| Icon | Google "G" logo, 20px |
| Icon Gap | 12px |
| Hover Background | `--gray-50` |
| Height | 48px |
| Border Radius | 8px |
| Font Weight | 500 |

### Other Providers (Future)

| Provider | Icon Color | Border Accent |
|----------|------------|---------------|
| Google | Multi-color | `--gray-200` |
| Microsoft | `#00A4EF` | `#00A4EF` (on hover) |
| Apple | `#000000` | `--gray-900` |

---

# Part 4: Chat Interface

## 4.1 Chat Layout (Split View)

### Desktop Layout (≥1024px)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [NAVIGATION BAR - 64px height]                                                  │
├────────────────────────┬─────────────────────────────────────────────────────────┤
│                        │                                                         │
│   SIDEBAR (320px)      │              MAIN CONTENT AREA                          │
│                        │                                                         │
│  ┌──────────────────┐  │  ┌─────────────────────────────────────────────────┐   │
│  │  Search...    🔍 │  │  │  CHAT HEADER                                    │   │
│  └──────────────────┘  │  │  [Avatar] John Doe  ●Online                     │   │
│                        │  └─────────────────────────────────────────────────┘   │
│  ┌──────────────────┐  │                                                         │
│  │ + New Chat       │  │  ┌─────────────────────────────────────────────────┐   │
│  └──────────────────┘  │  │                                                 │   │
│                        │  │                                                 │   │
│  ┌──────────────────┐  │  │              MESSAGE LIST                       │   │
│  │ [Av] John Doe    │  │  │                                                 │   │
│  │ Hey, how are...  │  │  │  ┌─────────────────────┐                        │   │
│  │            2m ago│  │  │  │ Hey! How are you?   │  ← Other's message     │   │
│  ├──────────────────┤  │  │  └─────────────────────┘                        │   │
│  │ [Av] Jane Smith  │  │  │                                                 │   │
│  │ See you tomor... │  │  │              ┌─────────────────────┐            │   │
│  │           1h ago │  │  │              │ I'm good, thanks!   │  ← My msg  │   │
│  ├──────────────────┤  │  │              └─────────────────────┘            │   │
│  │ [Av] Study Group │  │  │                                                 │   │
│  │ Meeting at 3pm   │  │  │  John is typing...                              │   │
│  │          3h ago  │  │  │                                                 │   │
│  └──────────────────┘  │  └─────────────────────────────────────────────────┘   │
│                        │                                                         │
│                        │  ┌─────────────────────────────────────────────────┐   │
│                        │  │  [📎] [📷]  Type a message...          [Send]   │   │
│                        │  └─────────────────────────────────────────────────┘   │
│                        │                                                         │
└────────────────────────┴─────────────────────────────────────────────────────────┘
```

### Layout Specifications

| Element | Value |
|---------|-------|
| Sidebar Width | 320px (fixed) |
| Sidebar Background | `#FFFFFF` (light) / `--aksob-darkest` (dark) |
| Sidebar Border | 1px solid `--gray-200` (right edge) |
| Main Area | flex: 1 (fills remaining space) |
| Main Background | `--off-white` (light) / `#0a0a0a` (dark) |
| Total Height | `100vh - 64px` (below nav) |

### Mobile Layout (<1024px)

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  [NAV]              [☰]     │     │  [←]  John Doe    ●         │
├─────────────────────────────┤     ├─────────────────────────────┤
│                             │     │                             │
│   CONVERSATION LIST         │     │      MESSAGE VIEW           │
│   (Full Width)              │ ──► │      (Full Width)           │
│                             │     │                             │
│  ┌───────────────────────┐  │     │  Messages...                │
│  │ [Av] John Doe      2m │  │     │                             │
│  ├───────────────────────┤  │     ├─────────────────────────────┤
│  │ [Av] Jane Smith    1h │  │     │  [Type a message...]  [➤]   │
│  └───────────────────────┘  │     └─────────────────────────────┘
│                             │
│  [+ New Chat]               │     Tap conversation → Navigate to
│                             │     /chat/:conversationId
└─────────────────────────────┘
```

| Behavior | Description |
|----------|-------------|
| List View | Full-width conversation list |
| Detail View | Full-width message view with back button |
| Navigation | React Router navigation between views |
| Back Button | Returns to `/chat` (list view) |

---

## 4.2 Conversation List Component

### Search Bar

```
┌─────────────────────────────────────┐
│  🔍  Search conversations...        │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 44px |
| Padding | 0 16px |
| Background | `--gray-100` |
| Border Radius | 8px |
| Icon | `Search`, 18px, `--gray-400` |
| Placeholder | "Search conversations..." |
| Focus Border | `--aksob-primary` |

### New Chat Button

```
┌─────────────────────────────────────┐
│  [+]  New Conversation              │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 44px |
| Background | `--aksob-primary` |
| Text | `#FFFFFF` |
| Icon | `Plus`, 18px |
| Border Radius | 8px |
| Hover | `--aksob-secondary` |

### List Container

| Property | Value |
|----------|-------|
| Overflow | `auto` (scrollable) |
| Padding | 8px |
| Gap | 4px |

---

## 4.3 Conversation Item Component

### Standard Item

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌────┐  John Doe                              2m ago    ●  │
│  │ JD │  Hey, how are you doing today?                   3  │
│  └────┘                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
    ↑         ↑                              ↑              ↑
  Avatar    Name                          Time         Unread
            Last Message                              Badge
```

### Item Specifications

| Element | Specification |
|---------|---------------|
| Container Height | 72px |
| Container Padding | 12px 16px |
| Border Radius | 8px |
| Avatar | 44px, circular |
| Name Font | 14px, 600 weight, `--aksob-darkest` |
| Preview Font | 13px, 400 weight, `--gray-600` |
| Preview Max | 1 line, ellipsis overflow |
| Time Font | 12px, 400 weight, `--gray-500` |
| Unread Badge | 18px circle, `--aksob-primary`, white text |

### Item States

| State | Background | Other |
|-------|------------|-------|
| Default | `transparent` | — |
| Hover | `--gray-50` | — |
| Active/Selected | `--pale-mint` | Left border 3px `--aksob-primary` |
| Unread | — | Name bold, preview `--aksob-darkest` |

### Group Conversation Item

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌────┐  Study Group                           3h ago       │
│  │ 👥 │  Jane: Meeting at 3pm tomorrow                      │
│  └────┘                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Difference | Value |
|------------|-------|
| Avatar | Group icon or stacked avatars |
| Preview | Shows sender name prefix |

### Muted Conversation

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌────┐  John Doe                              2m ago   🔇  │
│  │ JD │  Hey, how are you doing today?                      │
│  └────┘                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Indicator | 16px muted icon, `--gray-400` |

### Pinned Conversation

```
📌 ← Pin icon at top-right of item
```

---

## 4.4 Chat Header Component

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [←]   ┌────┐  John Doe                                          [⋯]       │
│        │ JD │  ● Online                                                     │
│        └────┘                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
   ↑       ↑        ↑           ↑                                    ↑
 Back   Avatar    Name       Status                               Menu
(mobile)
```

### Header Specifications

| Property | Value |
|----------|-------|
| Height | 64px |
| Background | `#FFFFFF` / glass effect |
| Border Bottom | 1px solid `--gray-200` |
| Padding | 0 16px |
| Shadow | `--shadow-sm` |

### Elements

| Element | Specification |
|---------|---------------|
| Back Button | 40px, visible only on mobile |
| Avatar | 40px |
| Name | 16px, 600 weight |
| Status Text | 12px, `--gray-500` or `--success` |
| Status Dot | 8px, inline with text |
| Menu Button | 40px, `MoreVertical` icon |

### Status States

| Status | Color | Text |
|--------|-------|------|
| Online | `--success` | "Online" |
| Offline | `--gray-400` | "Offline" or "Last seen 2h ago" |
| Typing | `--aksob-primary` | "Typing..." |

---

## 4.5 Message List Component

### Container

| Property | Value |
|----------|-------|
| Overflow | `auto` (scrollable) |
| Padding | 16px |
| Background | `--off-white` |
| Scroll Behavior | `smooth` |
| Flex Direction | `column` |
| Gap | 8px |

### Date Separator

```
                    ─────────  Today  ─────────
```

| Property | Value |
|----------|-------|
| Font | 12px, 500 weight |
| Color | `--gray-500` |
| Margin | 16px 0 |
| Line Color | `--gray-200` |

### Scroll Behavior

| Trigger | Behavior |
|---------|----------|
| New message (own) | Auto-scroll to bottom |
| New message (other) | Scroll if within 100px of bottom, else show "New message" indicator |
| Initial load | Scroll to bottom |
| Load older | Maintain scroll position |

---

## 4.6 Message Bubble Component

### Own Message (Right-aligned)

```
                                          ┌─────────────────────────────┐
                                          │ I'm doing great! Just       │
                                          │ finished my project.        │
                                          │                    2:34 PM ✓✓│
                                          └─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `--aksob-primary` |
| Text Color | `#FFFFFF` |
| Border Radius | 16px 16px 4px 16px |
| Max Width | 70% of container |
| Padding | 12px 16px |
| Font Size | 15px |
| Line Height | 1.4 |
| Time Font | 11px, right-aligned |
| Alignment | `flex-end` (right) |

### Other's Message (Left-aligned)

```
┌────┐
│ JD │
└────┘
┌─────────────────────────────┐
│ Hey! How are you doing      │
│ today?                      │
│ 2:32 PM                     │
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Text Color | `--aksob-darkest` |
| Border Radius | 16px 16px 16px 4px |
| Border | 1px solid `--gray-200` |
| Avatar | 32px, shown only for first in group |
| Sender Name | 12px, 600 weight, `--aksob-primary` (groups only) |

### Read Receipt Icons

```
✓   = Sent
✓✓  = Delivered  (gray)
✓✓  = Read       (--aksob-primary)
```

| State | Icon | Color |
|-------|------|-------|
| Sending | Spinner (12px) | `--gray-400` |
| Sent | Single check | `--gray-400` |
| Delivered | Double check | `--gray-400` |
| Read | Double check | `--aksob-primary` |

### Reply Preview (Nested)

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ ▌ John: Hey, how are you?           │ │  ← Reply reference
│ └─────────────────────────────────────┘ │
│                                         │
│ I'm good, thanks for asking!            │  ← Actual message
│                              2:34 PM ✓✓ │
└─────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| Reply Container | Background `--gray-100`, padding 8px, radius 8px |
| Left Border | 3px solid `--aksob-primary` |
| Sender Name | 12px, 600 weight |
| Preview Text | 12px, 1 line, ellipsis |
| Margin Bottom | 8px |

---

## 4.7 Message Types

### Text Message
Standard bubble as described above.

### Image Message

```
┌─────────────────────────────┐
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │      [IMAGE PREVIEW]    │ │
│ │       max 300x300       │ │
│ │                         │ │
│ └─────────────────────────┘ │
│ Check out this view!        │  ← Optional caption
│                    2:34 PM ✓✓│
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Image Container | Rounded 12px, overflow hidden |
| Max Dimensions | 300px × 300px |
| Object Fit | `cover` |
| Caption | Below image, same styling as text |
| Click Action | Open in lightbox/new tab |

### File/Document Message

```
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ 📄  project-report.pdf              │ │
│ │     2.4 MB                          │ │
│ └─────────────────────────────────────┘ │
│                              2:34 PM ✓✓ │
└─────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| File Container | Background `rgba(0,0,0,0.05)`, padding 12px, radius 8px |
| Icon | File type icon, 24px |
| Filename | 14px, 500 weight, ellipsis |
| File Size | 12px, `--gray-500` |
| Click Action | Download file |

### System Message

```
                    John Doe joined the conversation
```

| Property | Value |
|----------|-------|
| Alignment | Center |
| Background | None |
| Font | 12px, italic |
| Color | `--gray-500` |
| Padding | 8px 0 |

---

## 4.8 Message Input Component

### Default State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [📎]  [📷]   Type a message...                                    [Send]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specifications

| Property | Value |
|----------|-------|
| Container Height | 64px (min), auto-expand up to 150px |
| Background | `#FFFFFF` |
| Border Top | 1px solid `--gray-200` |
| Padding | 12px 16px |
| Gap | 12px |

### Elements

| Element | Specification |
|---------|---------------|
| Attachment Button | 40px, `Paperclip` icon, `--gray-500` |
| Image Button | 40px, `Image` icon, `--gray-500` |
| Text Area | flex: 1, resize none, no border, 16px font |
| Send Button | 40px, `Send` icon, `--aksob-primary` |
| Send Disabled | `--gray-300` when input empty |

### With Reply Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ▌ Replying to John: Hey, how are you doing today?              [✕] │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  [📎]  [📷]   Type a message...                                    [Send]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Reply Bar Background | `--pale-mint` |
| Reply Bar Padding | 8px 12px |
| Close Button | 24px, `X` icon |
| Left Border | 3px solid `--aksob-primary` |

### With Attachment Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌──────┐ ┌──────┐                                                          │
│  │ IMG  │ │ IMG  │  ← Thumbnail previews                                    │
│  │  ✕   │ │  ✕   │                                                          │
│  └──────┘ └──────┘                                                          │
│                                                                             │
│  [📎]  [📷]   Add a caption...                                     [Send]   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Thumbnail Size | 60px × 60px |
| Thumbnail Radius | 8px |
| Remove Button | 20px circle, top-right, `--error` bg |
| Gap | 8px |

---

## 4.9 Typing Indicator Component

```
┌────┐
│ JD │  John is typing
└────┘  ● ● ●
           ↑
        Animated dots
```

### Specifications

| Property | Value |
|----------|-------|
| Container | Same position as message bubble (left-aligned) |
| Avatar | 32px |
| Text | 13px, italic, `--gray-500` |
| Dots | 6px circles, `--gray-400` |
| Animation | Sequential bounce, 0.6s loop |

### Animation Keyframes

```css
@keyframes typingDot {
  0%, 60%, 100% { 
    transform: translateY(0); 
    opacity: 0.4;
  }
  30% { 
    transform: translateY(-4px); 
    opacity: 1;
  }
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }
```

### Multiple Users Typing

```
John and Jane are typing...
● ● ●
```

---

## 4.10 New Chat Modal

### Wireframe

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  New Conversation                                      [✕]  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  To:                                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍 Search by name or email...                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Selected: ┌─────────┐ ┌─────────┐                          │
│            │ John ✕  │ │ Jane ✕  │   ← Chips                │
│            └─────────┘ └─────────┘                          │
│                                                             │
│  Suggestions                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [Av] Sarah Ahmed          ● Online                  │    │
│  │      sarah.ahmed@lau.edu.lb                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ [Av] Mike Johnson                                   │    │
│  │      mike.johnson@lau.edu.lb                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Start Conversation                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Modal Specifications

| Property | Value |
|----------|-------|
| Width | 480px (desktop), 100% - 32px (mobile) |
| Max Height | 80vh |
| Background | `#FFFFFF` |
| Border Radius | 16px |
| Shadow | `--shadow-lg` |
| Backdrop | `rgba(0,0,0,0.5)` with blur |

### User Search Result Item

| Property | Value |
|----------|-------|
| Height | 56px |
| Avatar | 40px |
| Name | 14px, 600 weight |
| Email | 12px, `--gray-500` |
| Online Dot | 8px, right side |
| Hover Background | `--gray-50` |
| Selected Background | `--pale-mint` |

### Selected User Chip

| Property | Value |
|----------|-------|
| Background | `--pale-mint` |
| Border | 1px solid `--aksob-primary` |
| Padding | 4px 8px 4px 12px |
| Border Radius | 16px |
| Font | 13px |
| Remove Icon | 16px `X`, `--gray-500` |

---

## 4.11 Empty States

### No Conversations

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                         💬                                  │
│                                                             │
│              No conversations yet                           │
│                                                             │
│    Start a conversation with someone from the Galaxy        │
│                                                             │
│           ┌─────────────────────────┐                       │
│           │  Start a Conversation   │                       │
│           └─────────────────────────┘                       │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### No Conversation Selected (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                         👋                                  │
│                                                             │
│              Select a conversation                          │
│                                                             │
│       Choose a chat from the sidebar to get started         │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Empty State Specifications

| Property | Value |
|----------|-------|
| Icon Size | 64px |
| Icon Color | `--gray-300` |
| Title | 20px, 600 weight, `--aksob-darkest` |
| Description | 14px, `--gray-500`, max-width 300px, center |
| Button | Primary, margin-top 24px |
| Alignment | Center (both axes) |

