# 🔒 Security Advisories

**Status:** ⚠️ Action Required for Production

---

## Current Security Issues

Supabase has detected **2 security advisories** that need attention before deploying to production:

### ⚠️ 1. RLS Disabled on User Table

**Severity:** ERROR  
**Category:** SECURITY  
**Table:** `public.User`

**Issue:**  
Row Level Security (RLS) is not enabled on the User table. This means anyone with the anon key can read/write all user data without restrictions.

**Fix:**
```sql
-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only read their own data
CREATE POLICY "Users can view own data"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Example policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id);
```

**More info:** [RLS Documentation](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)

---

### ⚠️ 2. RLS Disabled on Proposal Table

**Severity:** ERROR  
**Category:** SECURITY  
**Table:** `public.Proposal`

**Issue:**  
Row Level Security (RLS) is not enabled on the Proposal table. This means anyone can access all proposals.

**Fix:**
```sql
-- Enable RLS on Proposal table
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can view their own proposals
CREATE POLICY "Users can view own proposals"
  ON "Proposal"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Example policy: Users can create proposals
CREATE POLICY "Users can create proposals"
  ON "Proposal"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Example policy: Users can update their own proposals
CREATE POLICY "Users can update own proposals"
  ON "Proposal"
  FOR UPDATE
  USING (auth.uid()::text = "userId");

-- Example policy: Users can delete their own proposals
CREATE POLICY "Users can delete own proposals"
  ON "Proposal"
  FOR DELETE
  USING (auth.uid()::text = "userId");
```

**More info:** [RLS Documentation](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)

---

## How to Enable RLS

### Option 1: Using Supabase Dashboard

1. Go to [Database Editor](https://app.supabase.com/project/qtjnbtvtuivzikeiufua/editor)
2. Click on the table (User or Proposal)
3. Click the "Enable RLS" button in the top right
4. Go to the "Policies" tab
5. Click "New Policy"
6. Choose a template or create custom policies

### Option 2: Using SQL Editor

1. Go to [SQL Editor](https://app.supabase.com/project/qtjnbtvtuivzikeiufua/sql)
2. Run the SQL commands shown above
3. Verify policies are created

### Option 3: Using Prisma Migration

Create a new migration file:

```bash
npx prisma migrate dev --name enable_rls
```

Add to the migration file:
```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;

-- Add your policies here
```

---

## Why RLS Matters

Without RLS, **anyone with your anon key** (which is public in your frontend) can:
- ❌ Read all user emails and data
- ❌ Create fake users
- ❌ Modify any proposal
- ❌ Delete any data

With RLS enabled:
- ✅ Users can only access their own data
- ✅ Policies enforce authorization at the database level
- ✅ Security is maintained even if frontend code is bypassed
- ✅ Supabase Auth automatically enforces user context

---

## Development vs Production

### For Development (Current State)
✅ RLS disabled is **OK** for local development and testing  
✅ Easier to test and seed data  
✅ Faster iteration

### For Production
⚠️ RLS **MUST** be enabled  
⚠️ Policies must be carefully designed  
⚠️ Test policies thoroughly before deploying

---

## Next Steps

### Immediate (Development)
- Continue building your app
- Test functionality without RLS
- Understand your data access patterns

### Before Production
1. ✅ Enable RLS on all tables
2. ✅ Create appropriate policies
3. ✅ Test policies thoroughly
4. ✅ Enable Supabase Auth
5. ✅ Review security checklist

---

## Quick RLS Setup for This Project

When you're ready to enable auth and RLS, here's a complete example:

```sql
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;

-- User Policies (with Supabase Auth)
CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id);

-- Proposal Policies
CREATE POLICY "Anyone can view proposals"
  ON "Proposal" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create proposals"
  ON "Proposal" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own proposals"
  ON "Proposal" FOR UPDATE
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own proposals"
  ON "Proposal" FOR DELETE
  USING (auth.uid()::text = "userId");
```

---

## Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Policies](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Security Best Practices](https://supabase.com/docs/guides/database/database-linter)
- [Your Project Security](https://app.supabase.com/project/qtjnbtvtuivzikeiufua/advisors)

---

**Status:** Development - RLS Disabled (expected)  
**Action Required:** Enable RLS before production deployment  
**Priority:** HIGH for production, LOW for development

