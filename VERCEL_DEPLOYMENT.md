# Vercel Deployment Guide

## Important: Database Configuration

⚠️ **SQLite does NOT work on Vercel's serverless platform.** You need to use a cloud database.

### Recommended: Switch to PostgreSQL

1. **Update Prisma Schema** (`prisma/schema.prisma`):
   Change the datasource from:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   To:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set up a PostgreSQL database**:
   - Use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (recommended)
   - Or use [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app)

3. **Get your DATABASE_URL**:
   - Format: `postgresql://user:password@host:port/database?sslmode=require`
   - Add it to Vercel Environment Variables

4. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```
   Or push the schema:
   ```bash
   npx prisma db push
   ```

## Environment Variables Required in Vercel

Set these in your Vercel project settings:

1. **DATABASE_URL**: Your PostgreSQL connection string
   - Example: `postgresql://user:password@host:port/database?sslmode=require`

2. **NEXTAUTH_URL**: Your production URL
   - Example: `https://your-app.vercel.app`

3. **NEXTAUTH_SECRET**: A random secret key
   - Generate with: `openssl rand -base64 32`
   - Or use: `https://generate-secret.vercel.app/32`

4. **OPENAI_API_KEY** (optional): If using AI features

## Deployment Steps

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above

4. **Deploy**:
   - Vercel will automatically run `npm run build`
   - The build script includes `prisma generate` to ensure Prisma Client is generated

## Build Process

The build script (`npm run build`) now includes:
- `prisma generate` - Generates Prisma Client
- `next build` - Builds the Next.js app

Additionally, `postinstall` script ensures Prisma generates after `npm install`.

## Troubleshooting

### "Prisma Client not generated" error
- Ensure `DATABASE_URL` is set in Vercel
- Check build logs to confirm `prisma generate` ran
- The `postinstall` script should handle this automatically

### Database connection errors
- Verify `DATABASE_URL` is correct
- Ensure your database allows connections from Vercel IPs
- Check SSL mode is set correctly (`?sslmode=require`)

### Build fails
- Check that all environment variables are set
- Verify Prisma schema is valid
- Ensure database is accessible

