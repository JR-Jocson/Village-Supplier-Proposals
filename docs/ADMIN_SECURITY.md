# Admin Authentication Security

## Overview

The admin authentication system is designed with security as a priority. This document explains the security measures in place and what you need to know.

## ✅ Security Features Implemented

### 1. **Password Security**
- ✅ **Bcrypt Hashing**: All passwords are hashed using bcryptjs with 10 salt rounds
- ✅ **No Plain Text**: Passwords are NEVER stored in plain text
- ✅ **One-way Hashing**: Passwords cannot be reversed or decrypted
- ✅ **Salted Hashes**: Each password has a unique salt, preventing rainbow table attacks

### 2. **Session Security**
- ✅ **HTTP-only Cookies**: Session cookies cannot be accessed by JavaScript (prevents XSS attacks)
- ✅ **Secure Flag**: In production, cookies are only sent over HTTPS
- ✅ **SameSite Protection**: Cookies have SameSite=lax (prevents CSRF attacks)
- ✅ **7-day Expiration**: Sessions automatically expire after 1 week
- ✅ **Server-side Validation**: Every request validates the session against the database

### 3. **Database Security (Row Level Security - RLS)**
- ✅ **RLS Enabled on User Table**: The User table is protected by Row Level Security
- ✅ **Client Access Blocked**: Client-side code CANNOT query the User table
- ✅ **Service Role Only**: Only server-side code with the service role key can access User data
- ✅ **Password Field Protected**: Hashed passwords cannot be read from the client

### 4. **API Security**
- ✅ **Server-side Only**: All authentication logic runs on the server
- ✅ **No Client-side Secrets**: Passwords are never sent to the client
- ✅ **Error Messages**: Generic error messages prevent user enumeration
- ✅ **Rate Limiting**: Consider adding rate limiting for production (TODO)

## 🔐 How Authentication Works

```
1. User enters email/password → Client
2. POST to /api/admin/login → Server
3. Server queries User table (via service role key, bypasses RLS)
4. Server compares password hash using bcrypt
5. If valid: Create session, set HTTP-only cookie
6. Client redirected to /admin
7. Server validates session on every admin page load
```

## ⚙️ Required Configuration

### Service Role Key (CRITICAL for Security)

You **MUST** set the `SUPABASE_SERVICE_ROLE_KEY` environment variable:

1. Go to your Supabase Dashboard
2. Navigate to: **Settings > API**
3. Copy the **`service_role` key** (marked as "secret")
4. Add to your `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Why is this important?**
- The service role key bypasses RLS (Row Level Security)
- Without it, the server cannot access the User table (RLS blocks it)
- With RLS enabled, the anon key CANNOT access the User table
- The service role key allows secure server-side authentication

### Current RLS Policies on User Table

```sql
-- All client-side access is blocked
CREATE POLICY "user_select_policy" ON "User" FOR SELECT USING (false);
CREATE POLICY "user_insert_policy" ON "User" FOR INSERT WITH CHECK (false);
CREATE POLICY "user_update_policy" ON "User" FOR UPDATE USING (false);
CREATE POLICY "user_delete_policy" ON "User" FOR DELETE USING (false);
```

This means:
- ✅ Clients with anon key: **CANNOT** read/write User table
- ✅ Server with service role key: **CAN** read/write User table (bypasses RLS)

## 🔒 Security Best Practices

### DO ✅
- ✅ Use the service role key (set `SUPABASE_SERVICE_ROLE_KEY`)
- ✅ Keep service role key secret (never commit to Git)
- ✅ Use HTTPS in production
- ✅ Change default admin password after first login
- ✅ Create unique admin accounts for each person
- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ✅ Regularly audit admin accounts
- ✅ Enable 2FA when available (future feature)

### DON'T ❌
- ❌ Commit `.env` file to Git
- ❌ Share admin credentials
- ❌ Use weak passwords (like "admin123" - change this!)
- ❌ Disable RLS on the User table
- ❌ Expose the service role key to the client
- ❌ Store passwords in plain text

## 🚨 Security Checklist

Before going to production:

- [ ] Service role key is set in `.env`
- [ ] Default admin password has been changed
- [ ] RLS is enabled on User table (already done ✅)
- [ ] RLS policies are in place (already done ✅)
- [ ] HTTPS is enabled (production only)
- [ ] Session cookies are secure (automatic in production)
- [ ] `.env` is in `.gitignore` (already done ✅)
- [ ] Consider adding rate limiting to login endpoint
- [ ] Consider adding login attempt tracking
- [ ] Consider adding account lockout after failed attempts

## 🔍 How to Verify Security

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'User';
-- Should return: rowsecurity = true
```

### Check RLS Policies Exist
```sql
SELECT policyname, tablename, cmd 
FROM pg_policies 
WHERE tablename = 'User';
-- Should show 4 policies: SELECT, INSERT, UPDATE, DELETE
```

### Test Client-side Access is Blocked
Try querying from the browser console (should fail):
```javascript
// This should return an error or empty result
const { data, error } = await supabase.from('User').select('*');
console.log(error); // Should show permission denied
```

## 📊 Security Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Password Storage | ✅ Bcrypt hashed | ✅ Bcrypt hashed |
| Session Cookies | ✅ HTTP-only | ✅ HTTP-only |
| User Table RLS | ❌ Disabled | ✅ **Enabled** |
| Client Access | ⚠️ Possible | ✅ **Blocked** |
| Service Role Key | ⚠️ Optional | ✅ **Required** |
| Password Exposure | ⚠️ Risk | ✅ **Protected** |

## 🛡️ Is It Secure Now?

**YES** - With proper configuration:

1. ✅ **Passwords**: Hashed with bcrypt (industry standard)
2. ✅ **Sessions**: HTTP-only cookies (XSS protection)
3. ✅ **Database**: RLS enabled (client access blocked)
4. ✅ **Server Auth**: Service role bypasses RLS securely
5. ✅ **No Exposure**: User table inaccessible from client

**Requirements for full security:**
- Set `SUPABASE_SERVICE_ROLE_KEY` in production
- Change the default admin password
- Use HTTPS in production

## 🔐 Additional Security Recommendations

### Future Enhancements
1. **Rate Limiting**: Limit login attempts per IP
2. **Account Lockout**: Lock account after N failed attempts
3. **Audit Logging**: Track all admin actions
4. **2FA**: Two-factor authentication
5. **Password Reset**: Secure password reset flow
6. **Password Policy**: Enforce strong passwords
7. **Session Timeout**: Shorter sessions for inactive users
8. **IP Whitelisting**: Restrict admin access by IP

### Monitoring
- Monitor failed login attempts
- Alert on suspicious activity
- Regular security audits
- Keep dependencies updated

## 📞 Questions?

If you have security concerns or questions:
1. Check this document first
2. Review the code in `lib/auth.ts` and `lib/supabase-server.ts`
3. Consult Supabase security documentation
4. Consider a professional security audit for production

---

**Last Updated**: December 2025
**Security Status**: ✅ Secure (with service role key configured)



