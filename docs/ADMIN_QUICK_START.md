# Admin System - Quick Start Guide

## What Was Created

✅ **Database Schema** - Added `User` model with admin role support  
✅ **Authentication System** - Session-based auth with bcrypt password hashing  
✅ **Login Page** - `/admin/login` with Hebrew RTL interface  
✅ **Admin Dashboard** - `/admin` protected route with basic layout  
✅ **API Routes** - Login, logout, and session management endpoints  
✅ **Helper Script** - Easy admin user creation tool

## Getting Started (3 Steps)

### Step 1: Update Database Schema

```bash
npx prisma db push
```

This creates the `User` table in your database.

### Step 2: Create Your First Admin

```bash
npm run create-admin
```

You'll be prompted to enter:
- Email
- Name
- Password

### Step 3: Login

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin`
3. You'll be redirected to the login page
4. Enter your admin credentials
5. Access granted! 🎉

## Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/admin` | Admin Dashboard | Admins only |
| `/admin/login` | Admin Login Page | Public |

## Features

### Current Features
- ✅ Secure password hashing with bcryptjs
- ✅ Session-based authentication
- ✅ HTTP-only cookies for security
- ✅ Auto-redirect to login if not authenticated
- ✅ Hebrew RTL interface
- ✅ Dark mode support
- ✅ Logout functionality

### Coming Soon
- 📋 View all proposals
- ✅ Approve/reject proposals
- 📊 Statistics and analytics
- 👥 User management
- 📧 Email notifications

## Tech Stack

- **Authentication**: bcryptjs for password hashing
- **Session Storage**: HTTP-only cookies
- **Database**: PostgreSQL via Prisma
- **UI**: React + Tailwind CSS (RTL)
- **Backend**: Next.js 15 App Router

## File Locations

```
📁 Admin System Files
├── app/admin/
│   ├── login/page.tsx         # Login page
│   └── page.tsx               # Dashboard (protected)
├── app/api/admin/
│   ├── login/route.ts         # Login endpoint
│   ├── logout/route.ts        # Logout endpoint
│   └── session/route.ts       # Session check
├── components/
│   ├── AdminLoginForm.tsx     # Login form UI
│   └── AdminDashboard.tsx     # Dashboard UI
├── lib/
│   └── auth.ts                # Auth utilities
├── scripts/
│   └── create-admin.ts        # Admin creation script
└── prisma/schema.prisma       # User model
```

## Security Notes

🔒 **Password Security**
- Passwords are hashed with bcrypt (10 salt rounds)
- Never stored or transmitted in plain text

🔒 **Session Security**
- HTTP-only cookies (not accessible via JavaScript)
- Secure flag enabled in production
- 7-day expiration
- Server-side validation on every request

🔒 **Access Control**
- Server-side route protection
- Role-based authorization
- Automatic redirect for unauthorized access

## Troubleshooting

**Can't create admin user?**
```bash
# Make sure database is accessible
npx prisma studio

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

**Can't login?**
- Verify user exists in database (use Prisma Studio)
- Check that role is set to "admin"
- Ensure password is correct

**Database connection error?**
- Check `.env` file has correct `DATABASE_URL`
- Verify database is running
- Check network/firewall settings

## Next Steps

After logging in for the first time:

1. **Explore the Dashboard** - Familiarize yourself with the admin interface
2. **Plan Features** - Decide what admin features you need next
3. **Add Functionality** - Start building proposal management features

## Need Help?

📖 See detailed documentation: `docs/ADMIN_SETUP.md`

---

**Remember:** The admin system is in Hebrew (RTL) by default, following the project's primary language requirements.

