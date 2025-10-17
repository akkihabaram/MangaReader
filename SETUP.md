# Full Stack Manga Site - Setup & Configuration

## Project Structure

```
├── Client/          # Next.js 13 Frontend (Port 3000)
├── Server/          # Express Backend (Port 3001)
└── SETUP.md         # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

**Client:**
```bash
cd Client
npm install
```

**Server:**
```bash
cd Server
npm install
```

### 2. Environment Configuration

#### Server (.env file)
```bash
MONGODB_URL=mongodb+srv://ertu341242:ertu341242@ertuu.i1khy31.mongodb.net/?retryWrites=true&w=majority&appName=Ertuu
PORT=3001
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
NODE_ENV=development
```

#### Client (.env.local file)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3RpcnJpbmctY29yYWwtMzYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_SGaqXW9uG0VI6hmEg2cr4T7cm06QSZnsFcsRDssyXu
NEXT_PUBLIC_MONGO_DB_URL=http://localhost:3001/
NEXT_PUBLIC_BASE_URL=http://localhost:3000/
NODE_ENV=development
```

### 3. Run the Application

**Terminal 1 - Server:**
```bash
cd Server
npm start          # or npm run dev for development with auto-reload
```

**Terminal 2 - Client:**
```bash
cd Client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:3000 (Turkish: http://localhost:3000/tr)
- **Backend:** http://localhost:3001

## 📋 Features Implemented

### User Management
- ✅ User registration with email verification
- ✅ User login with Clerk authentication
- ✅ First registered user automatically becomes site owner/admin
- ✅ User roles: `user`, `admin`, `owner`
- ✅ MongoDB integration for user persistence

### Authentication Flow
1. User signs up via `/register`
2. Clerk verifies email with OTP
3. User data is synced to MongoDB via `/api/clerk/user`
4. `useUserSync` hook automatically detects user role
5. First user is automatically assigned `owner` role
6. User can access admin features if role is `admin` or `owner`

### Localization
- ✅ Turkish (tr) - Default locale
- ✅ English (en)
- ✅ URL-based routing: `/tr/...` or `/en/...`
- ✅ Clerk localization support for both languages

### API Endpoints

#### User Routes
- `POST /users/create` - Create new user (called by Clerk webhook)
- `GET /users/:clerkId` - Get user details
- `PATCH /users/:clerkId/role` - Update user role (admin only)
- `GET /users/` - List all users (admin only)

#### Clerk Webhook
- `POST /webhooks/clerk` - Receives user events from Clerk

#### Frontend API Routes
- `POST /api/clerk/user` - Sync user to MongoDB
- `GET /api/clerk/user` - Get user role and admin status

## 🔐 Admin Features

After the first user is registered and becomes owner/admin:

1. **Admin Panel** - Access at `/:locale/admin`
2. **Manga Management** - Add, edit, delete manga
3. **Chapter Management** - Manage chapters
4. **Genre Management** - Manage genres
5. **User Management** - Manage user roles
6. **Announcements** - Create site announcements

## 🌐 Deployment

### Vercel Compatible
Both Client and Server are configured for Vercel deployment:

**Frontend:** Deploy `Client/` folder to Vercel
**Backend:** Deploy `Server/` folder to Vercel with `vercel.json` config

### Environment Variables on Vercel
Set the following environment variables in Vercel:
- `MONGODB_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_MONGO_DB_URL` (Backend API URL)
- `NEXT_PUBLIC_BASE_URL` (Frontend URL)

## 🐛 Troubleshooting

### User not synced to MongoDB
1. Check that Server is running on port 3001
2. Verify MongoDB connection string
3. Check `/api/clerk/user` endpoint for errors
4. Review browser console and server logs

### Turkish locale not working
1. Default locale is set to `tr` in `middleware.js`
2. URL should be `/tr/...` or just `/` (redirects to `/tr/`)
3. Check `next-intl` configuration

### Admin panel not accessible
1. Verify user role is `admin` or `owner` in MongoDB
2. Check Clerk user metadata
3. Ensure `useUserSync` hook is syncing properly

## 📝 Important Notes

- **svix** package is used for Clerk webhook verification (optional - can be removed for development)
- **First user** - Always becomes `owner` automatically
- **Turkish Support** - Full Turkish UI, API responses, and error messages
- **Clerk Integration** - Authentication and user management via Clerk
- **MongoDB** - User data persistence and role management

## 🚀 Next Steps

1. Set up Clerk webhooks in Clerk Dashboard:
   - Go to Clerk Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`

2. Configure environment variables for production

3. Test the full flow:
   - Register new user
   - Verify email
   - Check MongoDB for user creation
   - Check if first user is marked as owner

4. Deploy to Vercel

---

For more information on Clerk, visit: https://clerk.com/docs
For more information on Next.js, visit: https://nextjs.org/docs
