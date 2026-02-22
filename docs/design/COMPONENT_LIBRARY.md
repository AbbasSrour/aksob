# AKSOB Component Library

A comprehensive specification of all reusable UI components in the AKSOB application. All components reference design tokens from [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

---

## Table of Contents

1. [Button](#button)
2. [Input](#input)
3. [Password Input](#password-input)
4. [Password Strength Indicator](#password-strength-indicator)
5. [User Type Selector](#user-type-selector)
6. [Card](#card)
7. [Checkbox](#checkbox)
8. [Divider](#divider)
9. [Loading Spinner](#loading-spinner)
10. [Avatar](#avatar)
11. [Badge](#badge)

---

## Button

### Variants

#### Primary Button
```
┌─────────────────────────────────┐
│         Button Label            │
└─────────────────────────────────┘
```

| Property      | Value                       |
|---------------|-----------------------------|
| Background    | `--aksob-primary` (#076951) |
| Text Color    | `#FFFFFF`                   |
| Font          | 14px, 500 weight            |
| Padding       | 12px 24px                   |
| Border Radius | 8px                         |
| Min Height    | 44px                        |
| Cursor        | pointer                     |

**States:**

| State    | Background              | Text      | Other               |
|----------|------------------------|-----------|---------------------|
| Default  | `#076951`              | `#FFFFFF` | —                   |
| Hover    | `#16876b`              | `#FFFFFF` | —                   |
| Active   | `#065743`              | `#FFFFFF` | scale(0.98)         |
| Disabled | `#076951` opacity 50%  | `#FFFFFF` | cursor: not-allowed |
| Loading  | `#076951`              | Hidden    | Show spinner        |

#### Secondary Button

| Property         | Value                       |
|------------------|-----------------------------|
| Background       | `transparent`               |
| Text Color       | `--aksob-primary`           |
| Border           | 1px solid `--aksob-primary` |
| Hover Background | `--pale-mint` (#E7F4F1)     |

#### Ghost Button

| Property         | Value         |
|------------------|---------------|
| Background       | `transparent` |
| Text Color       | `--gray-600`  |
| Hover Background | `--gray-100`  |

#### Danger Button

| Property         | Value               |
|------------------|---------------------|
| Background       | `--error` (#EF4444) |
| Text Color       | `#FFFFFF`           |
| Hover Background | `#DC2626`           |

### Button Sizes

| Size | Padding   | Font Size | Min Height |
|------|-----------|-----------|------------|
| `sm` | 8px 16px  | 12px      | 32px       |
| `md` | 12px 24px | 14px      | 44px       |
| `lg` | 16px 32px | 16px      | 52px       |

### Button with Icon

```
┌─────────────────────────────────┐
│  [Icon]  Button Label           │
└─────────────────────────────────┘

Icon size: 16px (sm), 20px (md), 24px (lg)
Gap between icon and label: 8px
```

---

## Input

### Text Input

```
Label Text
┌─────────────────────────────────┐
│ Placeholder text...             │
└─────────────────────────────────┘
Helper text appears here
```

| Property          | Value                  |
|-------------------|------------------------|
| Background        | `#FFFFFF`              |
| Border            | 1px solid `--gray-200` |
| Border Radius     | 8px                    |
| Padding           | 12px 16px              |
| Font Size         | 16px                   |
| Min Height        | 48px                   |
| Placeholder Color | `--gray-400`           |

**States:**

| State    | Border Color      | Other                                      |
|----------|-------------------|--------------------------------------------|
| Default  | `--gray-200`      | —                                          |
| Focus    | `--aksob-primary` | ring: 2px `--aksob-primary` opacity 20%    |
| Error    | `--error`         | ring: 2px `--error` opacity 20%            |
| Disabled | `--gray-200`      | bg: `--gray-50`, cursor: not-allowed       |

### Label Styling

| Property      | Value             |
|---------------|-------------------|
| Font Size     | 14px              |
| Font Weight   | 500               |
| Color         | `--aksob-darkest` |
| Margin Bottom | 6px               |

### Helper/Error Text

| Type   | Color        | Font Size |
|--------|--------------|-----------|
| Helper | `--gray-600` | 12px      |
| Error  | `--error`    | 12px      |

---

## Password Input

```
Password
┌─────────────────────────────────┬───┐
│ ••••••••••••                    │ 👁 │
└─────────────────────────────────┴───┘
```

| Element       | Specification                                              |
|---------------|------------------------------------------------------------|
| Base          | Same as Text Input                                         |
| Toggle Button | 44px × 44px, right-aligned inside input                    |
| Eye Icon      | 20px, `--gray-400` default, `--aksob-primary` when visible |
| Icon States   | `EyeIcon` (hidden), `EyeOffIcon` (visible)                 |

**Behavior:**
- Click toggle switches between `type="password"` and `type="text"`
- Icon changes to reflect current state

---

## Password Strength Indicator

```
Password
┌─────────────────────────────────┬───┐
│ MyP@ssw0rd                      │ 👁 │
└─────────────────────────────────┴───┘
┌────┬────┬────┬────┐
│████│████│████│    │  Strong
└────┴────┴────┴────┘
```

| Strength Level | Bars Filled | Color       | Label    |
|----------------|-------------|-------------|----------|
| Weak           | 1/4         | `--error`   | "Weak"   |
| Fair           | 2/4         | `--warning` | "Fair"   |
| Good           | 3/4         | `--info`    | "Good"   |
| Strong         | 4/4         | `--success` | "Strong" |

| Property   | Value            |
|------------|------------------|
| Bar Height | 4px              |
| Bar Gap    | 4px              |
| Bar Radius | 2px              |
| Label Font | 12px, 500 weight |
| Margin Top | 8px              |

**Strength Rules (Visual Feedback Only):**
- 8+ characters: +1
- Contains lowercase: +1
- Contains uppercase: +1
- Contains number: +1
- Contains special char: +1

---

## User Type Selector

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

| Property            | Value                       |
|---------------------|-----------------------------|
| Card Size           | 120px × 100px               |
| Gap                 | 16px                        |
| Border Radius       | 12px                        |
| Border              | 2px solid `--gray-200`      |
| Selected Border     | 2px solid `--aksob-primary` |
| Selected Background | `--pale-mint`               |
| Icon Size           | 32px                        |
| Label Font          | 14px, 500 weight            |

**States:**

| State    | Border            | Background  |
|----------|-------------------|-------------|
| Default  | `--gray-200`      | `#FFFFFF`   |
| Hover    | `--gray-300`      | `--gray-50` |
| Selected | `--aksob-primary` | `--pale-mint` |

**Card Details:**

| Type    | Icon            | Subtext               |
|---------|-----------------|-----------------------|
| Student | `GraduationCap` | "Current LAU student" |
| Alumni  | `Award`         | "LAU graduate"        |
| Faculty | `Briefcase`     | "Faculty or staff"    |

---

## Card

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

| Property      | Value                                       |
|---------------|---------------------------------------------|
| Background    | `#FFFFFF`                                   |
| Border Radius | 12px                                        |
| Padding       | 24px                                        |
| Shadow        | `--shadow-md`                               |
| Border        | none (or 1px solid `--gray-100` for subtle) |

### Card Variants

| Variant  | Background               | Border                            | Shadow               |
|----------|--------------------------|-----------------------------------|----------------------|
| Default  | `#FFFFFF`                | none                              | `--shadow-md`        |
| Outlined | `#FFFFFF`                | 1px solid `--gray-200`            | none                 |
| Glass    | `rgba(255,255,255,0.95)` | 1px solid `rgba(255,255,255,0.2)` | `--shadow-md` + blur |
| Elevated | `#FFFFFF`                | none                              | `--shadow-lg`        |

---

## Checkbox

```
┌──┐
│✓ │  Remember me
└──┘
```

| Property           | Value                  |
|--------------------|------------------------|
| Box Size           | 20px × 20px            |
| Border Radius      | 4px                    |
| Border             | 2px solid `--gray-300` |
| Checked Background | `--aksob-primary`      |
| Checked Border     | `--aksob-primary`      |
| Checkmark          | White, 2px stroke      |
| Label Gap          | 8px                    |
| Label Font         | 14px, 400 weight       |

**States:**

| State    | Border            | Background    |
|----------|-------------------|---------------|
| Default  | `--gray-300`      | `#FFFFFF`     |
| Hover    | `--aksob-muted`   | `#FFFFFF`     |
| Checked  | `--aksob-primary` | `--aksob-primary` |
| Disabled | `--gray-200`      | `--gray-100`  |

---

## Divider

### Horizontal Divider

```
──────────────────────────────────────────
```

| Property   | Value        |
|------------|--------------|
| Height     | 1px          |
| Background | `--gray-200` |
| Margin     | 24px 0       |

### Divider with Text

```
─────────────  OR  ─────────────
```

| Property     | Value            |
|--------------|------------------|
| Text Font    | 12px, 500 weight |
| Text Color   | `--gray-500`     |
| Text Padding | 0 16px           |
| Line Color   | `--gray-200`     |

---

## Loading Spinner

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
| `sm` | 16px     | 2px          |
| `md` | 24px     | 2px          |
| `lg` | 40px     | 3px          |

| Property      | Value                               |
|---------------|-------------------------------------|
| Border Color  | `--gray-200`                        |
| Active Border | `--aksob-primary` (top segment)     |
| Animation     | rotate 360deg, 0.8s linear infinite |

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

| Property | Value                               |
|----------|-------------------------------------|
| Backdrop | `rgba(255,255,255,0.80)` with blur  |
| Spinner  | `lg` size                           |
| Text     | 14px, `--gray-600`, margin-top 16px |

---

## Avatar

```
  ┌───┐      ┌─────┐      ┌───────┐
  │ JD│      │ JD  │      │  JD   │
  └───┘      └─────┘      └───────┘
   sm          md            lg
```

| Size | Diameter | Font Size |
|------|----------|-----------|
| `xs` | 24px     | 10px      |
| `sm` | 32px     | 12px      |
| `md` | 40px     | 14px      |
| `lg` | 56px     | 20px      |
| `xl` | 80px     | 28px      |

| Property              | Value                                        |
|-----------------------|----------------------------------------------|
| Shape                 | Circle (`border-radius: 9999px`)             |
| Background (no image) | `--aksob-muted`                              |
| Text Color            | `#FFFFFF`                                    |
| Font Weight           | 600                                          |
| Border                | 2px solid `#FFFFFF` (optional, for stacking) |

### Avatar with Status

```
  ┌───┐
  │ JD│●  ← Online indicator
  └───┘
```

| Status  | Color        | Size |
|---------|--------------|------|
| Online  | `--success`  | 10px |
| Offline | `--gray-400` | 10px |
| Busy    | `--error`    | 10px |

Position: bottom-right, overlapping avatar edge by 2px

---

## Badge

```
┌────────┐
│  New   │
└────────┘
```

| Variant | Background         | Text Color   |
|---------|--------------------|--------------|
| Default | `--gray-100`       | `--gray-700` |
| Primary | `--aksob-primary`  | `#FFFFFF`    |
| Success | `--success` bg 10% | `--success`  |
| Warning | `--warning` bg 10% | `--warning`  |
| Error   | `--error` bg 10%   | `--error`    |

| Property      | Value         |
|---------------|---------------|
| Padding       | 4px 8px       |
| Font Size     | 12px          |
| Font Weight   | 500           |
| Border Radius | 9999px (pill) |

### Notification Badge (Count)

```
  ┌─┐
  │3│  ← Positioned on parent element
  └─┘
```

| Property    | Value                            |
|-------------|----------------------------------|
| Min Width   | 18px                             |
| Height      | 18px                             |
| Background  | `--error`                        |
| Text Color  | `#FFFFFF`                        |
| Font Size   | 10px                             |
| Font Weight | 600                              |
| Position    | absolute, top: -4px, right: -4px |

---

*All components reference tokens from DESIGN_SYSTEM.md*
