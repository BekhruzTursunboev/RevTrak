# RevTrak - Revenue & Project Tracking

Simple revenue and project tracking application.

## Features

- 📊 Dashboard with revenue analytics
- 💰 Transaction tracking (income/expenses)
- ✅ Task management
- 👥 Client management
- 📈 Charts and reports
- 📄 Export to CSV/PDF

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up database:**
   - Create a PostgreSQL database
   - Set `DATABASE_URL` environment variable
   - Run: `npx prisma db push`

3. **Run development server:**
   ```bash
   npm run dev
   ```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set `DATABASE_URL` environment variable in Vercel
4. Deploy

The app works without authentication - all features are accessible immediately.

