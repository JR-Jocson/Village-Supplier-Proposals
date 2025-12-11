# n8n Integration Setup

## Environment Variables

Add the following to your `.env` file:

```bash
# n8n Integration
N8N_BASE_URL=https://tauga.app.n8n.cloud
N8N_AUTH_HEADER_NAME=village_proposal_auth
N8N_AUTH_HEADER_VALUE=G5EhcKzo6BvFpv
```

## How It Works

### Invoice Analysis Workflow

1. **User uploads tax invoice** via `/upload` page
2. **Frontend sends file** to `/api/analyze-invoice`
3. **API converts file** to base64
4. **API calls n8n webhook** at `${N8N_BASE_URL}/webhook/analyze-invoice`
5. **n8n analyzes invoice** and returns detected price
6. **Frontend displays requirements** based on price

### API Request Format

The API sends the following to n8n:

```json
{
  "file": "base64_encoded_file_content",
  "fileName": "invoice.pdf",
  "fileSize": 123456,
  "mimeType": "application/pdf"
}
```

### Expected n8n Response

n8n should return:

```json
{
  "price": 150000,
  // Or alternatively:
  "detectedPrice": 150000,
  "amount": 150000
}
```

The API will look for `price`, `detectedPrice`, or `amount` fields.

## n8n Webhook Endpoint

**URL:** `https://tauga.app.n8n.cloud/webhook/analyze-invoice`

**Method:** `POST`

**Headers:**
- `Content-Type: application/json`
- `village_proposal_auth: G5EhcKzo6BvFpv`

## Development Mode

The API includes a fallback to mock data if n8n is unavailable. This allows development to continue even if the n8n service is down.

To disable the fallback in production, remove the try-catch around the n8n call in `/app/api/analyze-invoice/route.ts`.

## Testing

Test the integration:

```bash
curl -X POST http://localhost:3000/api/analyze-invoice \
  -F "invoice=@/path/to/test-invoice.pdf"
```

Expected response:
```json
{
  "price": 150000,
  "fileName": "test-invoice.pdf",
  "fileSize": 123456
}
```

## Troubleshooting

### Check Environment Variables
```bash
# In your Next.js API route, add logging:
console.log('N8N_BASE_URL:', process.env.N8N_BASE_URL);
console.log('N8N_AUTH_HEADER:', process.env.N8N_AUTH_HEADER);
```

### Common Issues

1. **404 from n8n** - Check webhook URL is correct
2. **401 Unauthorized** - Verify auth header value
3. **CORS errors** - n8n should allow requests from your domain
4. **Timeout** - n8n workflow might be taking too long

## Security Notes

- ⚠️ **Never commit `.env` file** - It's in `.gitignore`
- ✅ Auth header is server-side only (not exposed to client)
- ✅ File validation happens before sending to n8n
- ✅ File size limited to 10MB in frontend

---

## PostgreSQL Node Setup

This section explains how to configure the PostgreSQL node in n8n to connect to your Supabase database.

### Step 1: Get Database Credentials from Supabase

1. Go to your Supabase Dashboard:
   - **URL:** https://app.supabase.com/project/qtjnbtvtuivzikeiufua/settings/database

2. Scroll down to the **"Connection string"** section

3. You have two options:

   **Option A: Connection Pooler (Recommended for n8n)**
   - Select **"Connection pooling"** tab
   - Choose **"Transaction"** mode
   - Copy the connection string
   - Format: `postgresql://postgres.qtjnbtvtuivzikeiufua:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Port:** `6543`
   - **Host:** `aws-0-eu-central-1.pooler.supabase.com`

   **Option B: Direct Connection**
   - Select **"Direct connection"** tab
   - Copy the connection string
   - Format: `postgresql://postgres:[PASSWORD]@db.qtjnbtvtuivzikeiufua.supabase.co:5432/postgres`
   - **Port:** `5432`
   - **Host:** `db.qtjnbtvtuivzikeiufua.supabase.co`

4. **Get your database password:**
   - If you don't remember it, click **"Reset Database Password"** button
   - Copy the new password immediately (you won't be able to see it again!)

### Step 2: Configure PostgreSQL Node in n8n

1. **Open your n8n workflow** (or create a new one)

2. **Add PostgreSQL node:**
   - Click the **"+"** button to add a node
   - Search for **"PostgreSQL"**
   - Select **"PostgreSQL"** node

3. **Configure the connection:**
   - Click on the PostgreSQL node
   - In the **"Credential"** dropdown, select **"Create New Credential"** (or edit existing)

4. **Fill in the connection details:**

   **For Connection Pooler (Recommended):**
   ```
   Host: aws-0-eu-central-1.pooler.supabase.com
   Port: 6543
   Database: postgres
   User: postgres.qtjnbtvtuivzikeiufua
   Password: [YOUR_DATABASE_PASSWORD]
   SSL: Enable SSL/TLS
   ```

   **For Direct Connection:**
   ```
   Host: db.qtjnbtvtuivzikeiufua.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [YOUR_DATABASE_PASSWORD]
   SSL: Enable SSL/TLS
   ```

5. **SSL Configuration:**
   - **SSL Mode:** Select **"require"** or **"prefer"**
   - Supabase requires SSL connections for security

6. **Save the credential:**
   - Give it a name like: `Supabase PostgreSQL - Village Supplier Proposals`
   - Click **"Save"**

### Step 3: Test the Connection

1. **In the PostgreSQL node**, select **"Execute Query"** operation

2. **Test query:**
   ```sql
   SELECT version();
   ```

3. **Click "Execute Node"** or **"Test workflow"**

4. **Expected result:**
   ```json
   {
     "version": "PostgreSQL 17.6.1..."
   }
   ```

### Step 4: Query Your Tables

Once connected, you can query your database tables:

**Example: Get all proposals:**
```sql
SELECT * FROM "Proposal" ORDER BY "createdAt" DESC LIMIT 10;
```

**Example: Get all users:**
```sql
SELECT * FROM "User" ORDER BY "createdAt" DESC;
```

**Example: Count proposals by status:**
```sql
SELECT status, COUNT(*) as count 
FROM "Proposal" 
GROUP BY status;
```

### Connection Details Summary

**Supabase Project:** Village Supplier Proposals  
**Project ID:** `qtjnbtvtuivzikeiufua`  
**Region:** EU Central (Frankfurt) - `eu-central-1`

**Connection Pooler (Recommended):**
- **Host:** `aws-0-eu-central-1.pooler.supabase.com`
- **Port:** `6543`
- **Database:** `postgres`
- **User:** `postgres.qtjnbtvtuivzikeiufua`
- **SSL:** Required

**Direct Connection:**
- **Host:** `db.qtjnbtvtuivzikeiufua.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **SSL:** Required

### Troubleshooting PostgreSQL Connection

**Issue: Connection timeout**
- ✅ Check if you're using the correct host and port
- ✅ Verify your database password is correct
- ✅ Ensure SSL is enabled

**Issue: Authentication failed**
- ✅ Verify the username format (pooler uses `postgres.qtjnbtvtuivzikeiufua`, direct uses `postgres`)
- ✅ Reset your database password in Supabase dashboard
- ✅ Check that the password doesn't contain special characters that need URL encoding

**Issue: SSL connection error**
- ✅ Enable SSL/TLS in n8n PostgreSQL node settings
- ✅ Try SSL mode "require" or "prefer"

**Issue: Table not found**
- ✅ Remember that Prisma uses quoted table names (e.g., `"Proposal"` not `proposal`)
- ✅ Check table names in Supabase dashboard: https://app.supabase.com/project/qtjnbtvtuivzikeiufua/editor

### Best Practices

1. **Use Connection Pooler** for n8n workflows (better performance, handles connections better)
2. **Store credentials securely** - Use n8n's credential system, don't hardcode passwords
3. **Use parameterized queries** - Prevent SQL injection attacks
4. **Test queries first** - Use "Execute Query" to test before using in production workflows
5. **Monitor connection limits** - Supabase has connection limits based on your plan

### Example n8n Workflow with PostgreSQL

**Workflow: Get Proposal Details**

1. **Webhook node** - Receives proposal ID
2. **PostgreSQL node** - Query:
   ```sql
   SELECT * FROM "Proposal" WHERE id = $1;
   ```
   - Parameter: `{{ $json.body.proposalId }}`
3. **IF node** - Check if proposal exists
4. **PostgreSQL node** - Get related user:
   ```sql
   SELECT * FROM "User" WHERE id = $1;
   ```
5. **Return response** with proposal and user data

