# Database Migrations Guide

## Current Situation

✅ **Your app works perfectly** using Supabase Client for database operations  
⚠️ **Prisma migrations don't work** due to network connectivity to direct PostgreSQL port (5432)

## Recommended Approach: Supabase Migrations

Since Prisma can't connect but Supabase client works perfectly, use **Supabase migrations** instead.

### How to Create a Migration

#### 1. Using Supabase MCP Tools (Easy in Cursor)

In Cursor, I can run migrations for you:

```typescript
// Example: Add a new field
mcp_supabase_apply_migration({
  project_id: 'qtjnbtvtuivzikeiufua',
  name: 'add_project_description',
  query: `
    ALTER TABLE "Project" 
    ADD COLUMN "description" TEXT;
  `
})
```

#### 2. Using Supabase Dashboard (Manual)

1. Go to: https://app.supabase.com/project/qtjnbtvtuivzikeiufua/editor
2. Click **SQL Editor**
3. Write your migration SQL
4. Run it
5. Save the SQL file in `prisma/migrations/` for version control

#### 3. Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref qtjnbtvtuivzikeiufua

# Create migration
supabase migration new add_description_field

# Edit the generated file in supabase/migrations/
# Then apply:
supabase db push
```

## Example Migrations

### Add a New Column

```sql
-- Migration: add_project_category
ALTER TABLE "Project" 
ADD COLUMN "category" TEXT;
```

### Add a New Table

```sql
-- Migration: create_comments_table
CREATE TABLE "Comment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "projectId" TEXT NOT NULL REFERENCES "Project"("id") ON DELETE CASCADE,
  "authorName" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Comment_projectId_idx" ON "Comment"("projectId");
```

### Modify an Existing Column

```sql
-- Migration: make_invoice_price_required
ALTER TABLE "Project" 
ALTER COLUMN "invoicePrice" SET NOT NULL;
```

## Update Prisma Schema (Optional)

If you want to keep `prisma/schema.prisma` as documentation:

1. **Make changes** to `schema.prisma`
2. **Don't run** `prisma migrate` (it won't work)
3. **Manually write SQL** for the same changes
4. **Apply via Supabase** migration tools

## Migration History

Your current migrations (already applied):

1. ✅ `init_schema` - Initial database setup
2. ✅ `create_project_and_project_file_tables` - Main tables
3. ✅ `remove_unused_user_and_proposal_tables` - Cleanup
4. ✅ `add_approval_fields_and_file_types` - Added LA/Aviva approvals
5. ✅ `enable_storage_policies_for_projects` - Storage RLS policies

## Why Doesn't Prisma Work?

**Short answer:** Network restrictions on PostgreSQL port 5432.

**Details:**
- Supabase Client uses HTTPS (port 443) ✅ Works
- Prisma uses PostgreSQL protocol (port 5432) ❌ Blocked
- Likely ISP, router, or firewall blocking outbound PostgreSQL connections
- Very common in corporate/restricted networks

## Should You Fix Prisma?

**No need!** Supabase migrations work great and have advantages:

### Supabase Migrations Pros:
- ✅ Already working with your network setup
- ✅ Direct SQL - more powerful and flexible
- ✅ Can use Supabase-specific features (RLS, triggers, etc.)
- ✅ Version controlled via Supabase
- ✅ Visible in Supabase Dashboard

### Prisma Migrations Pros:
- ✅ Type-safe schema in code
- ✅ Auto-generates SQL from schema
- ❌ Doesn't work with your network

## Best Practice: Hybrid Approach

1. **Keep** `prisma/schema.prisma` for TypeScript types
2. **Generate types** with `npx prisma generate` (doesn't need DB connection)
3. **Apply changes** using Supabase migrations
4. **Update schema** manually to match your SQL migrations

This gives you type safety + working migrations!

## Quick Reference

**Project ID:** qtjnbtvtuivzikeiufua  
**Database Host:** db.qtjnbtvtuivzikeiufua.supabase.co  
**Dashboard:** https://app.supabase.com/project/qtjnbtvtuivzikeiufua  
**SQL Editor:** https://app.supabase.com/project/qtjnbtvtuivzikeiufua/sql/new

---

## TL;DR

**Question:** Can we make migrations without Prisma working?  
**Answer:** YES! Use Supabase migration tools instead. They work perfectly and are actually better for Supabase projects.




