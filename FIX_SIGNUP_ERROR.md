# 🔧 Fix: Internal Server Error on Signup

## The Problem

When you try to sign up, you get:
```
Internal server error
```

This happens because **your database is not set up yet**.

---

## ✅ SOLUTION: Set Up Your Database

### Step 1: Check Your Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Make sure you have **DATABASE_URL** set
3. If it's missing, add it (see `VERCEL_ENV_VALUES.md` for exact values)

---

### Step 2: Initialize Your Database Schema

Your database exists, but the **tables don't exist yet**. You need to create them.

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Link your project**:
   ```bash
   vercel link
   ```
   - Select your project
   - It will ask about settings - just press Enter for defaults

3. **Push database schema**:
   ```bash
   npx prisma db push
   ```
   - This will create all the tables in your database

#### Option B: Using Prisma Studio (Local)

1. **Set your production DATABASE_URL**:
   - Copy your DATABASE_URL from Vercel
   - Create a `.env` file (or update existing one) with:
     ```
     DATABASE_URL="your-production-database-url-here"
     ```

2. **Push the schema**:
   ```bash
   npx prisma db push
   ```

3. **Verify it worked**:
   ```bash
   npx prisma studio
   ```
   - This opens a browser window
   - You should see tables: Company, User, Transaction, Task, etc.

#### Option C: Using Database Provider Dashboard

**If using Vercel Postgres:**
1. Go to Vercel Dashboard → Your Project → **Storage** → **Postgres**
2. Click **.env.local** tab
3. Copy the connection details
4. Use a database client (like DBeaver, pgAdmin, or TablePlus)
5. Connect to your database
6. Run the SQL from Prisma migrations

**If using Supabase:**
1. Go to Supabase Dashboard → Your Project → **SQL Editor**
2. You can run Prisma migrations manually, or use Supabase's migration tool

**If using Neon:**
1. Go to Neon Dashboard → Your Project
2. Use the SQL Editor to run migrations

---

### Step 3: Verify Database Connection

After pushing the schema, test it:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → **Deployments**
   - Click on latest deployment → **Functions** tab
   - Look for any database errors

2. **Try Signup Again**:
   - Go to your app
   - Try to sign up
   - If it still fails, check the error message (it should be more specific now)

---

## 🐛 Common Issues

### Issue 1: "Can't reach database server"

**Solution:**
- Check your DATABASE_URL is correct
- Make sure your database allows connections from Vercel
- Verify SSL mode is set: `?sslmode=require`

### Issue 2: "Table does not exist"

**Solution:**
- You haven't run `npx prisma db push` yet
- Follow Step 2 above to initialize the schema

### Issue 3: "Environment variable not found"

**Solution:**
- DATABASE_URL is not set in Vercel
- Go to Vercel → Settings → Environment Variables
- Add DATABASE_URL with your database connection string

### Issue 4: "Connection timeout"

**Solution:**
- Your database might be paused (if using free tier)
- Wake it up from your database provider dashboard
- Check database is accessible

---

## 📋 Quick Checklist

- [ ] DATABASE_URL is set in Vercel Environment Variables
- [ ] Database is created and accessible
- [ ] Ran `npx prisma db push` to create tables
- [ ] Verified tables exist (using Prisma Studio or database dashboard)
- [ ] Tried signup again

---

## 🔍 How to Check the Actual Error

The signup route now shows more detailed errors. To see them:

1. **In Browser**:
   - Open browser Developer Tools (F12)
   - Go to **Console** tab
   - Try to sign up
   - Look for error messages

2. **In Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → **Deployments**
   - Click on latest deployment
   - Go to **Functions** tab
   - Look for error logs

3. **In Network Tab**:
   - Open browser Developer Tools (F12)
   - Go to **Network** tab
   - Try to sign up
   - Click on the `/api/auth/signup` request
   - Check the **Response** tab for error details

---

## ✅ After Fixing

Once you've:
1. Set DATABASE_URL
2. Run `npx prisma db push`
3. Verified tables exist

Try signing up again. It should work!

---

## 📞 Still Not Working?

1. **Check Vercel Logs** for the exact error
2. **Verify DATABASE_URL** is correct format
3. **Test database connection** using Prisma Studio
4. **Check database provider** - make sure database is running/active

---

**The most common issue is that the database schema hasn't been initialized. Run `npx prisma db push` and it should work! 🎉**

