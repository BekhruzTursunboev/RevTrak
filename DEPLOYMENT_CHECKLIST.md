# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Database Setup (REQUIRED)
- [ ] Set up PostgreSQL database (Vercel Postgres, Supabase, Neon, or Railway)
- [ ] Get your `DATABASE_URL` connection string
- [ ] Format: `postgresql://user:password@host:port/database?sslmode=require`
- [ ] Test database connection locally if possible

### 2. Environment Variables (REQUIRED in Vercel)
Set these in Vercel Project Settings → Environment Variables:

- [ ] **DATABASE_URL** - PostgreSQL connection string
- [ ] **NEXTAUTH_URL** - Your production URL (e.g., `https://your-app.vercel.app`)
- [ ] **NEXTAUTH_SECRET** - Generate with: `openssl rand -base64 32`
- [ ] **OPENAI_API_KEY** (optional) - Only if using AI features

### 3. Database Migration
After setting DATABASE_URL in Vercel, you need to run migrations:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Run migration
npx prisma migrate deploy
```

**Option B: Using Vercel Postgres Dashboard**
1. Go to your Vercel project
2. Navigate to Storage → Postgres
3. Use the SQL Editor to run migrations manually

**Option C: Using Prisma Studio (Local)**
```bash
# Set DATABASE_URL to your production database
export DATABASE_URL="your-production-url"

# Push schema
npx prisma db push
```

### 4. Code Verification
- [x] Prisma schema uses PostgreSQL (not SQLite)
- [x] Build script includes `prisma generate`
- [x] Postinstall script includes `prisma generate`
- [x] Next.js config includes Prisma external packages
- [x] All API routes have error handling

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from checklist above
   - Make sure to set them for Production, Preview, and Development

4. **Deploy**
   - Vercel will automatically trigger a build
   - Monitor the build logs for any errors
   - If build fails, check the logs for specific errors

## 🔍 Post-Deployment Verification

- [ ] Visit your deployed URL
- [ ] Test signup functionality
- [ ] Test signin functionality
- [ ] Verify database connections work
- [ ] Check API routes are responding
- [ ] Verify environment variables are set correctly

## 🐛 Common Issues & Solutions

### Build Fails: "Prisma Client not generated"
**Solution:** The `postinstall` script should handle this. If it doesn't:
- Check that `prisma` is in `devDependencies`
- Verify `postinstall` script exists in `package.json`

### Build Fails: "Database connection error"
**Solution:** 
- Verify `DATABASE_URL` is set correctly in Vercel
- Check database allows connections from Vercel IPs
- Ensure SSL mode is set: `?sslmode=require`

### Runtime Error: "NEXTAUTH_SECRET is not set"
**Solution:**
- Add `NEXTAUTH_SECRET` to Vercel environment variables
- Generate a new secret: `openssl rand -base64 32`

### App loads but shows errors
**Solution:**
- Check browser console for errors
- Check Vercel function logs
- Verify all environment variables are set
- Ensure database is accessible and schema is pushed

### Database schema not found
**Solution:**
- Run `npx prisma db push` or `npx prisma migrate deploy`
- Verify DATABASE_URL points to correct database
- Check Prisma schema matches your database

## 📝 Quick Commands

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Create migration
npx prisma migrate dev --name init

# Deploy migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

## 🔗 Useful Links

- [Vercel Postgres Setup](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Deployment](https://next-auth.js.org/configuration/options#nextauth_url)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

