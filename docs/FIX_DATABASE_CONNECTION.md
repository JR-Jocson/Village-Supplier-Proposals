# Fix Database Connection Issue

## Problem
The Prisma client cannot connect to the database, causing the "Failed to create project" error when submitting proposals.

## Root Cause
The `DATABASE_URL` in your `.env` file is using the **direct connection** (port 5432), which may be blocked or have an incorrect password. Supabase recommends using the **connection pooler** (port 6543) for regular database queries.

## Solution

### Step 1: Get Your Database Connection String

1. Go to your Supabase Dashboard:
   https://app.supabase.com/project/qtjnbtvtuivzikeiufua/settings/database

2. Look for **"Connection string"** section

3. Select **"Connection pooling"** (not "Direct connection")

4. Choose **"Transaction"** mode

5. Copy the connection string. It should look like:
   ```
   postgresql://postgres.qtjnbtvtuivzikeiufua:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Step 2: Update Your `.env` File

Open your `.env` file and update the `DATABASE_URL` line:

```env
# Replace this with the connection pooler URL from step 1
DATABASE_URL=postgresql://postgres.qtjnbtvtuivzikeiufua:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password.

### Step 3: Test the Connection

Run this command to verify the connection works:

```bash
npx prisma db pull --force
```

If successful, you should see:
```
✔ Introspected 2 models and wrote them into prisma/schema.prisma
```

### Step 4: Restart the Dev Server

```bash
# Stop the current dev server (Ctrl+C or kill the process)
pkill -f "next dev"

# Start fresh
npm run dev
```

## Verify It's Working

1. Open http://localhost:3000
2. Fill out the proposal form
3. Try submitting - it should now work!

## Alternative: Using Supabase Client Directly

If Prisma connection continues to fail, we can bypass Prisma and use the Supabase client directly for database operations. Let me know if you need this alternative approach.

---

## Quick Reference

**Project ID:** qtjnbtvtuivzikeiufua  
**Region:** eu-central-1 (Frankfurt)  
**Connection Pooler:** `aws-0-eu-central-1.pooler.supabase.com:6543`  
**Direct Connection:** `db.qtjnbtvtuivzikeiufua.supabase.co:5432`

**Use Connection Pooler for:**
- Regular app queries (✅ Recommended)
- High-concurrency applications
- Serverless environments

**Use Direct Connection for:**
- Database migrations
- Development/testing with `npx prisma db push`
- Administrative tasks

