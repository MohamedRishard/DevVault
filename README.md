# DevVault — Personal Tech & Repo Bookmarking Web App

DevVault is a high-contrast, production-ready personal bookmarking vault built for developers, cybersecurity researchers, and engineers. It allows users to curate, categorize, search, filter, update, and manage links to free tools, cybersecurity labs, and GitHub repositories.

---

## 1. Visual Identity & Color Tokens

DevVault strictly applies the custom color palette across the entire application:

| Token / Color | Hex | Role in DevVault UI |
| :--- | :--- | :--- |
| **Canvas / Background** | `#FFECCB` | Main page background (Warm Cream) and subtle surfaces |
| **Primary Accent / Action** | `#E00000` | Primary buttons (`+ Add Resource`, `Verify OTP`), active category pills, delete actions, and focus rings |
| **Secondary Accent / Borders** | `#FFA97B` | Card borders, category tags, interactive chips, hover states, and input borders |
| **Success / Verified Badge** | `#9FED72` | Verified status indicators, "Copied!" toast notifications, and feature pills |
| **Typography & Contrast** | `#1A1A1A` / `#FFFFFF` | Deep charcoal body text and pure white button/card text for high WCAG AAA contrast |

Configured in `tailwind.config.ts` and `src/app/globals.css`.

---

## 2. Architecture & Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components & Route Handlers, TypeScript)
- **Styling:** Tailwind CSS + Lucide React Icons
- **Database:** Neon Serverless PostgreSQL (`DATABASE_URL`)
- **ORM:** Prisma ORM (`@prisma/client`)
- **Authentication:** Custom Passwordless Email OTP via **Resend API** (`RESEND_API_KEY`) + Encrypted JWT session cookies (`jose`)
- **Validation:** Zod schemas (`src/lib/validations.ts`)
- **Deployment:** Vercel (100% serverless compatible)

---

## 3. Database Schema (`prisma/schema.prisma`)

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  createdAt DateTime   @default(now())
  resources Resource[]
}

model OtpCode {
  id        String   @id @default(cuid())
  email     String
  codeHash  String   // SHA-256 hash of 6-digit OTP
  expiresAt DateTime // 10 minutes from creation
  attempts  Int      @default(0) // Max 5 verification attempts
  createdAt DateTime @default(now())

  @@index([email])
}

model Resource {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title         String
  url           String
  category      String
  description   String
  mainFunctions String[] // Array of feature pills
  isPinned      Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([category])
}
```

---

## 4. Authentication & Security Flow

1. **Step 1 — Email Submission (`/login`):**
   - User inputs email address.
   - Rate limit check: Maximum 3 OTP requests per 10 minutes per email.
   - Backend generates a cryptographically secure 6-digit OTP (`crypto.randomInt(100000, 999999)`).
   - Generates SHA-256 hash (`crypto.createHash('sha256')`) and saves to `OtpCode` with 10-minute expiry.
   - Unused previous OTPs for that email are invalidated.
   - Sends HTML email via Resend API (in development without an API key, OTP prints directly to terminal for testing).

2. **Step 2 — OTP Verification:**
   - User inputs the 6-digit code.
   - Backend verifies expiration (`expiresAt > now()`).
   - Enforces maximum 5 failed attempts per OTP code.
   - Compares SHA-256 hash of entered code with stored hash.
   - Upserts `User` record if new user.
   - Signs a secure JWT session token using `jose` (`SignJWT`) valid for 7 days.
   - Issues an `HttpOnly`, `Secure` (production), `SameSite=Lax` cookie named `session_token`.

3. **Route Protection & IDOR Prevention (`middleware.ts`):**
   - `middleware.ts` guards `/dashboard` and all `/api/resources/*` routes using `jose.jwtVerify`.
   - Every database query (`GET`, `POST`, `PATCH`, `DELETE`) is scoped strictly by `userId` extracted from the verified session cookie.

---

## 5. Environment Variables (`.env.example`)

Copy `.env.example` to `.env`:

```env
# Neon PostgreSQL Connection URL
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Resend API Key for Email OTP
RESEND_API_KEY="re_xxxxxxxxx"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Jose JWT Secret Key (32+ characters)
JWT_SECRET="devvault-secret-key-32-chars-jwt-auth-2026"
```

---

## 6. Setup & Execution Commands

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Push Schema to Neon PostgreSQL
```bash
npx prisma db push
```

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Production Build & Start
```bash
npm run build
npm start
```
