# 💰 مدیریت هزینه‌ها - Persian Expense Tracker

A modern Persian expense tracker Progressive Web App (PWA) built with Next.js, featuring real-time push notifications, reminder system, and full RTL support for Iranian users.

## ✨ Features

- 🌐 **Full Persian/Farsi support** with RTL layout
- 💰 **Iranian Toman currency** (no decimals)
- 📅 **Persian calendar integration** using date-fns-jalali
- 🔐 **Google OAuth authentication**
- 📊 **Expense tracking and categorization**
- ⏰ **Smart reminder system** with scheduled notifications
- 🔔 **Push notifications** for reminders
- 📱 **Progressive Web App** (PWA) with offline support
- 🎨 **Modern UI** with shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google Provider
- **UI Components**: shadcn/ui with Tailwind CSS
- **Notifications**: Web Push API
- **Deployment**: Vercel with Node.js Cron Jobs
- **Language**: TypeScript

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-here-generate-a-random-string
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Get from Google Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database URL (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/expense-tracker

# Push Notifications (Generate VAPID keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### 3. Generate VAPID Keys

Generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

### 4. Database Setup

```bash
# Install dependencies
pnpm install

# Set up database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 5. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your app!

## 📱 Features Overview

### Expense Management

- Add expenses with Persian categories
- Iranian Toman currency support
- Persian date display
- Expense categorization with icons

### Smart Reminders

- Create recurring reminders (minutely, hourly, daily, weekly, monthly, yearly)
- Automatic push notifications
- Persian date calculations
- Overdue reminder tracking
- ⚠️ Note: Minutely and hourly reminders may generate many notifications

### Push Notifications

- Real-time expense reminders
- User-specific notifications
- Offline notification support
- Customizable notification messages

### Persian UI

- Complete RTL layout
- Persian number formatting
- Iranian calendar integration
- Persian language throughout

## 🔄 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The Node.js cron job will automatically run every minute to check for due reminders (works both locally and in production).

### Database Options

- **Vercel Postgres**: Easiest for Vercel deployment
- **Supabase**: Free PostgreSQL with good features
- **PlanetScale**: Serverless MySQL (requires schema changes)

## 📖 Usage

1. **Sign in** with your Google account
2. **Add expenses** using the expense form
3. **Set up reminders** for recurring expenses
4. **Enable notifications** to get reminder alerts
5. **View your expenses** in the dashboard

## 🎯 Core Components

- `ExpenseForm`: Add new expenses with Persian UI
- `ExpenseList`: Display expenses with Persian dates and formatting
- `ReminderSection`: Manage and display reminders
- `PushNotificationManager`: Handle push notification subscriptions
- `AuthButton`: Google OAuth authentication

## 🔧 API Routes

- `/api/expenses` - CRUD operations for expenses
- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/test-reminders` - Manual reminder testing (Node.js cron service)

## 📅 Persian Date Features

- Persian calendar display
- Relative time in Persian (e.g., "۲ روز پیش")
- Persian number formatting
- Month and day names in Persian

## 🌟 PWA Features

- Installable on mobile devices
- Offline support
- App-like experience
- Push notification support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for Persian-speaking users
