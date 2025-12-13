# Database Setup - Required for Saving Data

## The Problem

If transactions (or tasks/clients) are not saving, it's because **the database is not set up**.

## Quick Fix

### Step 1: Set DATABASE_URL in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
3. Enable for: Production, Preview, Development
4. Click **Save**

### Step 2: Initialize Database

After setting DATABASE_URL, you need to create the tables:

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel link
npx prisma db push
```

**Option B: Using Prisma Studio (Local)**
1. Set DATABASE_URL in your `.env` file (use production database URL)
2. Run: `npx prisma db push`

**Option C: Using Database Dashboard**
- Use your database provider's SQL editor
- Run the SQL from Prisma migrations

### Step 3: Test

After setting up the database:
1. Try creating a transaction
2. It should save successfully
3. You should see it in the list

## Error Messages

The app now shows clear error messages:
- "Database connection failed" = DATABASE_URL not set or incorrect
- "Please check your DATABASE_URL" = Database not accessible
- "Run 'npx prisma db push'" = Database tables don't exist yet

## That's It!

Once the database is set up, everything will work perfectly!

