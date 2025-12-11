# n8n PostgreSQL Node - Quick Reference

## Supabase Database Connection Details

**Project:** Village Supplier Proposals  
**Project ID:** `qtjnbtvtuivzikeiufua`  
**Region:** EU Central (Frankfurt) - `eu-central-1`  
**Database:** PostgreSQL 17.6.1

---

## Connection Pooler (Recommended for n8n)

### n8n PostgreSQL Node Settings:

```
Host: aws-0-eu-central-1.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.qtjnbtvtuivzikeiufua
Password: [YOUR_PASSWORD - Get from Supabase Dashboard]
SSL: Enable SSL/TLS
SSL Mode: require (or prefer)
```

### Connection String Format:
```
postgresql://postgres.qtjnbtvtuivzikeiufua:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## Direct Connection (Alternative)

### n8n PostgreSQL Node Settings:

```
Host: db.qtjnbtvtuivzikeiufua.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [YOUR_PASSWORD - Get from Supabase Dashboard]
SSL: Enable SSL/TLS
SSL Mode: require (or prefer)
```

### Connection String Format:
```
postgresql://postgres:[PASSWORD]@db.qtjnbtvtuivzikeiufua.supabase.co:5432/postgres
```

---

## How to Get Your Password

1. Go to: https://app.supabase.com/project/qtjnbtvtuivzikeiufua/settings/database
2. Scroll to **"Database Password"** section
3. Click **"Reset Database Password"** (if you don't remember it)
4. Copy the password immediately (you won't see it again!)

---

## Quick Test Query

After setting up the connection, test with:

```sql
SELECT version();
```

Expected: `PostgreSQL 17.6.1...`

---

## Common Table Queries

### Get All Proposals
```sql
SELECT * FROM "Proposal" ORDER BY "createdAt" DESC LIMIT 10;
```

### Get All Users
```sql
SELECT * FROM "User" ORDER BY "createdAt" DESC;
```

### Count Proposals by Status
```sql
SELECT status, COUNT(*) as count 
FROM "Proposal" 
GROUP BY status;
```

---

## Important Notes

⚠️ **Table Names:** Prisma uses quoted identifiers - always use `"Proposal"` not `proposal`  
⚠️ **SSL Required:** Supabase requires SSL connections  
✅ **Use Pooler:** Connection pooler (port 6543) is recommended for n8n workflows  
✅ **Secure:** Store credentials in n8n's credential system, never hardcode

---

## Full Documentation

See `docs/N8N_SETUP.md` for complete setup instructions and troubleshooting.

