# Authentication Feature

Complete specification for authentication including design specs, wireframes, and implementation details.

---

## Table of Contents

1. [Design Specification](#design-specification)
   - [Auth Layout](#auth-layout)
   - [Login Page](#login-page)
   - [Register Page](#register-page)
   - [Forgot Password](#forgot-password)
   - [Reset Password](#reset-password)
   - [Verify Email](#verify-email)
2. [Implementation](#implementation)
   - [Database Schema](#database-schema)
   - [Backend Routes](#backend-routes)
   - [Frontend Components](#frontend-components)
   - [File Structure](#file-structure)

---

## Design Specification

### Auth Layout (Shared Wrapper)

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

#### Layout Specifications

| Element             | Specification                                     |
|---------------------|---------------------------------------------------|
| **Page Background** | Galaxy gradient with 30% blur overlay             |
| **Container**       | Centered, max-width 440px, padding 40px           |
| **Card Style**      | Glass effect: `rgba(255,255,255,0.95)`, blur 12px |
| **Card Padding**    | 32px                                              |
| **Card Radius**     | 16px                                              |
| **Card Shadow**     | `--shadow-lg`                                     |

#### Logo Section

| Property    | Value                   |
|-------------|-------------------------|
| Logo Size   | 48px height, auto width |
| Logo Margin | 0 0 24px 0              |
| Alignment   | Center                  |

#### Title Section

| Element    | Style                                      |
|------------|--------------------------------------------|
| Main Title | H2, `--aksob-darkest`, center              |
| Subtitle   | Body, `--gray-600`, center, margin-top 8px |

#### Footer Links

| Property   | Value                          |
|------------|--------------------------------|
| Font Size  | 14px                           |
| Color      | `--gray-600`                   |
| Link Color | `--aksob-primary`              |
| Link Hover | `--aksob-secondary`, underline |
| Margin Top | 24px                           |
| Alignment  | Center                         |

---

### Login Page (`/auth/login`)

#### Wireframe

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

#### Form Fields

| Field    | Type     | Placeholder           | Validation            |
|----------|----------|-----------------------|-----------------------|
| Email    | email    | "name@lau.edu"        | Required, valid email |
| Password | password | "Enter your password" | Required, min 8 chars |

#### Components Used

| Component       | Props/Notes                  |
|-----------------|------------------------------|
| `SocialButton`  | provider="google", fullWidth |
| `Divider`       | text="OR"                    |
| `Input`         | type="email"                 |
| `PasswordInput` | with visibility toggle       |
| `Checkbox`      | label="Remember me"          |
| `Button`        | variant="primary", fullWidth |

#### States

| State   | Behavior                                         |
|---------|--------------------------------------------------|
| Loading | Button shows spinner, inputs disabled            |
| Error   | Red border on invalid field, error message below |
| Success | Redirect to `?redirect` param or "/"             |

---

### Register Page (`/auth/register`)

#### Wireframe

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

#### Form Fields

| Field     | Type     | Placeholder         | Validation                                |
|-----------|----------|---------------------|-------------------------------------------|
| Full Name | text     | "John Doe"          | Required, min 2 chars                     |
| Email     | email    | "name@lau.edu.lb"   | Required, valid email                     |
| Password  | password | "Create a password" | Required, min 8 chars, strength indicator |
| User Type | select   | —                   | Required, one of: student/alumni/faculty  |

#### User Type Cards Detail

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

| Type    | Icon            | Subtext               |
|---------|-----------------|-----------------------|
| Student | `GraduationCap` | "Current LAU student" |
| Alumni  | `Award`         | "LAU graduate"        |
| Faculty | `Briefcase`     | "Faculty or staff"    |

#### States

| State            | Behavior                                    |
|------------------|---------------------------------------------|
| Loading          | Button shows spinner, all inputs disabled   |
| Validation Error | Field border red, error text below field    |
| Email Exists     | "An account with this email already exists" |
| Success          | Redirect to `/auth/verify-email-sent`       |

---

### Forgot Password Page (`/auth/forgot-password`)

#### Wireframe

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

#### Form Fields

| Field | Type  | Validation                   |
|-------|-------|------------------------------|
| Email | email | Required, valid email format |

#### Success State

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

### Reset Password Page (`/auth/reset-password`)

#### Wireframe

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

#### Form Fields

| Field            | Type     | Validation                                |
|------------------|----------|-------------------------------------------|
| New Password     | password | Required, min 8 chars, strength indicator |
| Confirm Password | password | Required, must match new password         |

#### Error States

| Error                 | Message                                                  |
|-----------------------|----------------------------------------------------------|
| Passwords don't match | "Passwords do not match"                                 |
| Token expired         | "This reset link has expired. Please request a new one." |
| Token invalid         | "Invalid reset link. Please request a new one."          |

#### Success State

Redirect to `/auth/login` with toast: "Password reset successful. Please sign in."

---

### Verify Email Page (`/auth/verify-email`)

This page is shown when user clicks the verification link in their email.

#### Loading State

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

#### Success State

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

#### Error State

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

### Verify Email Sent Page (`/auth/verify-email-sent`)

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

#### Resend Behavior

| State   | Button Text                       | Disabled        |
|---------|-----------------------------------|-----------------|
| Default | "Resend verification email"       | No              |
| Sending | "Sending..."                      | Yes             |
| Sent    | "Email sent! Resend again in 60s" | Yes (countdown) |

---

### Social Button Component

#### Google Sign-In Button

```
┌─────────────────────────────────────┐
│  [G]  Continue with Google          │
└─────────────────────────────────────┘
```

| Property         | Value                  |
|------------------|------------------------|
| Background       | `#FFFFFF`              |
| Border           | 1px solid `--gray-200` |
| Text Color       | `--gray-700`           |
| Icon             | Google "G" logo, 20px  |
| Icon Gap         | 12px                   |
| Hover Background | `--gray-50`            |
| Height           | 48px                   |
| Border Radius    | 8px                    |
| Font Weight      | 500                    |

---

## Implementation

### Database Schema

File: `apps/api/src/db/schema.ts`

Better Auth Tables (Auto-generated via `bunx @better-auth/cli generate`):

| Table          | Purpose                                                      |
|----------------|--------------------------------------------------------------|
| `user`         | Core user identity (id, name, email, emailVerified, image)   |
| `session`      | Active sessions (token, expiresAt, userId)                   |
| `account`      | OAuth accounts + password hashes (providerId, accessToken)   |
| `verification` | Email/password reset tokens                                  |

Extended User Profile:

```typescript
export const userProfiles = sqliteTable("user_profiles", {
  id: text("id").primaryKey(), // Same as Better Auth user.id
  
  // User Type
  userType: text("user_type", { 
    enum: ["student", "alumni", "faculty"] 
  }).notNull().default("student"),
  
  // Academic Info
  major: text("major"),
  graduationYear: integer("graduation_year"),
  department: text("department"),
  
  // Professional Info
  currentPosition: text("current_position"),
  currentCompany: text("current_company"),
  linkedinUrl: text("linkedin_url"),
  
  // Galaxy Visibility
  isVisibleInGalaxy: integer("is_visible_in_galaxy", { mode: "boolean" })
    .notNull().default(true),
  galaxyCluster: text("galaxy_cluster"),
  
  // Metadata
  bio: text("bio"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull().$defaultFn(() => new Date()),
});
```

---

### Backend Routes

**Authentication** (via Better Auth):

| Method | Endpoint                    | Description            |
|--------|----------------------------|------------------------|
| POST   | `/api/auth/sign-up/email`  | Register with email    |
| POST   | `/api/auth/sign-in/email`  | Login with email       |
| POST   | `/api/auth/sign-in/social` | OAuth login            |
| POST   | `/api/auth/sign-out`       | Logout                 |
| POST   | `/api/auth/forget-password`| Request password reset |
| POST   | `/api/auth/reset-password` | Reset with token       |
| GET    | `/api/auth/session`        | Get current session    |

**Profile**:

| Method | Endpoint           | Description        |
|--------|-------------------|--------------------|
| GET    | `/profile/me`     | Get own profile    |
| PATCH  | `/profile/me`     | Update own profile |
| GET    | `/profile/:userId`| Get public profile |

---

### Frontend Components

**Pages** (`apps/web/app/auth/`):
- `login.tsx` - Login page
- `register.tsx` - Registration page
- `forgot-password.tsx` - Forgot password
- `reset-password.tsx` - Reset password
- `verify-email.tsx` - Email verification handler
- `verify-email-sent.tsx` - Email sent confirmation

**Components** (`apps/web/app/components/auth/`):
- `auth-layout.tsx` - Shared auth wrapper
- `social-button.tsx` - Google OAuth button
- `password-input.tsx` - Password with visibility toggle
- `password-strength.tsx` - Password strength indicator
- `user-type-select.tsx` - Student/Alumni/Faculty selector

**Hooks**:
- `use-session.ts` - Better Auth session hook
- `use-require-auth.ts` - Auth guard for protected routes

---

### File Structure

```
apps/
├── api/
│   └── src/
│       ├── db/
│       │   └── schema.ts              # User profiles table
│       ├── lib/
│       │   ├── auth.ts               # Better Auth configuration
│       │   └── email.ts              # Resend email service
│       └── modules/
│           └── profile/
│               └── profile.routes.ts # Profile REST API
│
└── web/
    └── app/
        ├── lib/
        │   └── auth-client.ts        # Better Auth client
        ├── hooks/
        │   └── use-require-auth.ts   # Auth guard hook
        ├── components/
        │   ├── auth/
        │   │   ├── auth-layout.tsx
        │   │   ├── social-button.tsx
        │   │   ├── password-input.tsx
        │   │   ├── password-strength.tsx
        │   │   └── user-type-select.tsx
        │   └── navigation.tsx        # Global nav with auth state
        └── auth/
            ├── login.tsx
            ├── register.tsx
            ├── forgot-password.tsx
            ├── reset-password.tsx
            ├── verify-email.tsx
            └── verify-email-sent.tsx
```

---

### Environment Variables

**Backend** (`apps/api/.env`):
```bash
# Database
DATABASE_URL=file:./local.db

# Better Auth
BETTER_AUTH_SECRET=your-secret-min-32-chars-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Server
PORT=3000
LOG_LEVEL=debug
```

**Frontend** (`apps/web/.env`):
```bash
VITE_API_URL=http://localhost:3000
```

---

*Last Updated: February 2026*
