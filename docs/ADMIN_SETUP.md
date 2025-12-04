# Admin Authentication Setup

This guide explains how to set up and use the admin authentication system.

## Overview

The admin system provides:
- Secure login at `/admin/login`
- Protected admin dashboard at `/admin`
- Role-based access control
- Session-based authentication with cookies

## Database Schema

The admin system uses a `User` model with the following structure:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with bcryptjs
  name      String
  role      String   @default("user") // "user" or "admin"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Initial Setup

### 1. Push Schema to Database

First, apply the schema changes to your database:

```bash
npx prisma db push
```

### 2. Create First Admin User

You have two options to create your first admin user:

#### Option A: Using the Helper Script (Recommended)

We've created a script to help you create admin users:

```bash
# Install tsx if you haven't already
npm install -g tsx

# Run the script
npx tsx scripts/create-admin.ts
```

The script will prompt you for:
- Admin email
- Admin name  
- Admin password

#### Option B: Manual Creation using Prisma Studio

1. Open Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to the `User` table
3. Click "Add record"
4. Fill in:
   - email: your admin email
   - name: your admin name
   - password: **Note:** You'll need to hash the password first
   - role: "admin"

To hash a password for manual entry, you can use this Node.js command:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"
```

## Usage

### Accessing Admin Dashboard

1. Navigate to `/admin` in your browser
2. You'll be automatically redirected to `/admin/login`
3. Enter your admin credentials
4. Upon successful login, you'll be redirected to the admin dashboard

### Admin Dashboard Features

Currently, the admin dashboard includes:
- Welcome message
- Placeholder statistics cards
- Logout functionality

More features will be added as the system develops.

### Logout

Click the "התנתק" (Logout) button in the top-right corner of the dashboard.

## API Routes

### POST `/api/admin/login`

Authenticate an admin user.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "email": "admin@example.com",
    "name": "Admin Name"
  }
}
```

**Response (Error):**
```json
{
  "error": "אימייל או סיסמה שגויים"
}
```

### POST `/api/admin/logout`

Logout the current admin user.

**Response:**
```json
{
  "success": true
}
```

### GET `/api/admin/session`

Check the current admin session.

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "user": {
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

## Security Features

### Password Security
- Passwords are hashed using bcryptjs with a salt round of 10
- Plain text passwords are never stored in the database
- Passwords are never returned in API responses

### Session Security
- Sessions are stored in HTTP-only cookies
- Cookies are secure in production (HTTPS only)
- Sessions expire after 7 days
- Session validation on every protected request

### Route Protection
- Admin routes check for valid session on server-side
- Unauthorized access redirects to login page
- Sessions are validated against the database

## File Structure

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx          # Admin login page
│   └── page.tsx               # Admin dashboard (protected)
├── api/
│   └── admin/
│       ├── login/
│       │   └── route.ts       # Login API endpoint
│       ├── logout/
│       │   └── route.ts       # Logout API endpoint
│       └── session/
│           └── route.ts       # Session check API endpoint
components/
├── AdminLoginForm.tsx         # Login form component
└── AdminDashboard.tsx         # Dashboard component
lib/
└── auth.ts                    # Authentication utilities
scripts/
└── create-admin.ts            # Helper script to create admins
```

## Troubleshooting

### Can't Login

1. Verify the user exists in the database:
```bash
npx prisma studio
```

2. Check that the user's role is set to "admin"

3. Make sure you're using the correct email and password

### Session Not Persisting

1. Check browser cookies are enabled
2. Verify `DATABASE_URL` is correctly set in `.env`
3. Check server logs for any errors

### Database Connection Issues

If you get database connection errors:

1. Verify `DATABASE_URL` in `.env` is correct
2. Make sure your database is running and accessible
3. Check firewall settings if using a remote database

## Environment Variables

Make sure these are set in your `.env` file:

```env
DATABASE_URL="postgresql://..."
```

## Next Steps

Future enhancements planned:
- [ ] View and manage all proposals
- [ ] Approve/reject proposals
- [ ] Analytics and reporting
- [ ] User management
- [ ] Audit logs
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Password reset functionality

## Hebrew UI Text

All user-facing text in the admin system is in Hebrew (RTL):
- "כניסת מנהלים" - Admin Login
- "לוח בקרה למנהלים" - Admin Dashboard  
- "התנתק" - Logout
- "אימייל או סיסמה שגויים" - Invalid email or password
- etc.

The UI properly supports RTL layout using Tailwind's logical properties.

