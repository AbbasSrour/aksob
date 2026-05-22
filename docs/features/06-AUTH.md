# Authentication (Sign Up & Login)

## What Is This Feature?

Authentication is how users create accounts and sign in. It handles registration, login, password resets, and email verification. Once signed up, every new user goes through onboarding before they can access the full platform.

---

## Who Can Do What?

| Action | Anyone | Logged In |
|---|---|---|
| Register a new account | ✅ | ❌ |
| Log in | ✅ | ❌ |
| Request a password reset | ✅ | ❌ |
| Reset password (with token) | ✅ | ❌ |
| Verify email (with token) | ✅ | ✅ |
| Log out | ❌ | ✅ |

---

## How It Works

### Registration

1. User fills out: **name**, **email**, **password**, and selects a **user type** (Student, Alumni, or Faculty)
2. Account is created immediately — no email confirmation required to start using the platform
3. User is taken directly to **onboarding**
4. Email verification is optional — the user can verify later from their profile

> **Default admin account**: The system automatically creates `admin@aksob.lau.edu.lb` on first startup. The password is set by the system administrator. This admin account has full platform access.

### Login

- Email + password authentication
- "Keep me signed in" checkbox — extends the session duration
- Sessions last **7 days** by default
- On login, user is redirected to the **Galaxy** page (or the page they were trying to access before logging in)

### Password Reset

1. User clicks "Forgot password" on the login page
2. Enters their email address
3. A reset link is sent to their email
4. User clicks the link, enters a new password
5. Redirected to login to sign in with the new password

### Email Verification

- Optional — users can use the platform without verifying their email
- Verification link is sent to the user's email
- After clicking the link, the email is marked as verified
- Users can request a new verification email from their profile

### User Types

The user type is set **once at registration** and determines what features are available:

| Type | Who Should Choose It |
|---|---|
| **Student** | Currently enrolled at LAU |
| **Alumni** | Graduated from LAU |
| **Faculty** | Teaching or working at LAU |

> The user type affects which connection types you can use and which profile fields you see. It cannot be changed after registration.

---

## How To — Step by Step

---

#### 1. Register a New Account

1. Go to the public website
2. Click **"Join"** (top-right) or go to `/auth/register`
3. Fill in:
   - **Name**: Your full name
   - **Email**: A valid email address
   - **Password**: At least 8 characters (a strength indicator shows how strong it is)
   - **User Type**: Select Student, Alumni, or Faculty
4. Click **"Create Account"**
5. You're taken to the **onboarding wizard** to complete your profile

---

#### 2. Log In

1. Go to the public website
2. Click **"Login"** (top-right) or go to `/auth/login`
3. Enter your email and password
4. Optionally check **"Keep me signed in"**
5. Click **"Sign In"**
6. You're taken to the Galaxy page

---

#### 3. Reset Your Password

1. From the login page, click **"Forgot password?"**
2. Enter your email address
3. Click **"Send Reset Link"**
4. Check your inbox for the password reset email
5. Click the link in the email (takes you to `/auth/reset-password?token=...`)
6. Enter a new password and confirm it
7. Click **"Reset Password"**
8. Go back to the login page and sign in with your new password

---

#### 4. Verify Your Email

1. Check your inbox for the verification email (sent after registration)
2. Click the verification link
3. You'll see a confirmation that your email is verified
4. If the link expired, go to your profile and click "Resend verification email"

---

#### 5. Log Out

1. Click your **avatar** (top-right)
2. Click **"Log Out"**

---

## Common Questions

**Q: Do I need to verify my email to use the platform?**

→ No. Email verification is optional. You can use all features without it. It's recommended for account recovery.

**Q: Can I change my user type after registration?**

→ No. Student, Alumni, and Faculty types are fixed at registration. If you selected the wrong one, contact an admin.

**Q: What happens if I forget my password?**

→ Use the "Forgot password" link on the login page. You'll receive a reset email. If you don't see it, check your spam folder.

**Q: Is there a limit on login attempts?**

→ No. But the session expires after 7 days and you'll need to log in again.

**Q: Can I use Google or social login?**

→ Not yet. Only email and password authentication is supported.

**Q: What's the default admin account?**

→ `admin@aksob.lau.edu.lb` is created automatically on first startup. The password is set in the system configuration — ask the system administrator.
