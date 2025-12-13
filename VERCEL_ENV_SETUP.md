# 🚨 CRITICAL: Set Environment Variables in Vercel

## The Error You're Seeing

```
Error: NEXTAUTH_SECRET environment variable is not set
```

This happens because **environment variables are not set in your Vercel project**.

## ✅ Quick Fix (5 Minutes)

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com
2. Sign in to your account
3. Click on your **RevTrak** project

### Step 2: Open Environment Variables
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)

### Step 3: Add Required Variables

Add these **3 REQUIRED** environment variables:

#### 1. DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: Your PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database?sslmode=require`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**How to get it:**
- If using **Vercel Postgres**: Go to Storage → Postgres → Copy connection string
- If using **Supabase**: Project Settings → Database → Connection string
- If using **Neon**: Dashboard → Copy connection string
- If using **Railway**: Service → Variables → Copy DATABASE_URL

#### 2. NEXTAUTH_URL
- **Key**: `NEXTAUTH_URL`
- **Value**: Your Vercel app URL
  - Example: `https://revtrak.vercel.app` (use YOUR actual URL)
  - Find it in: Vercel Dashboard → Your Project → Domains
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### 3. NEXTAUTH_SECRET
- **Key**: `NEXTAUTH_SECRET`
- **Value**: Generate a random secret (see below)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Generate the secret:**

**Option A: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**Option B: Using Online Generator**
- Go to: https://generate-secret.vercel.app/32
- Copy the generated secret

**Option C: Using OpenSSL (if installed)**
```bash
openssl rand -base64 32
```

### Step 4: Save and Redeploy

1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click the **3 dots** (⋯) on the latest deployment
4. Click **Redeploy**
5. Or push a new commit to trigger redeploy

## 📋 Complete Environment Variables List

| Variable | Required | Example Value |
|----------|----------|---------------|
| `DATABASE_URL` | ✅ YES | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NEXTAUTH_URL` | ✅ YES | `https://revtrak.vercel.app` |
| `NEXTAUTH_SECRET` | ✅ YES | `your-generated-secret-here` |
| `OPENAI_API_KEY` | ❌ Optional | `sk-...` (only if using AI features) |

## 🔍 How to Verify Variables Are Set

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. You should see all 3 variables listed
3. Make sure they're enabled for **Production**, **Preview**, and **Development**

## ⚠️ Important Notes

1. **Never commit secrets to GitHub** - They're already in `.gitignore`
2. **Use different secrets for different environments** (optional but recommended)
3. **After adding variables, you MUST redeploy** for them to take effect
4. **NEXTAUTH_URL must match your actual Vercel domain**

## 🐛 Still Getting Errors?

### Error: "NEXTAUTH_SECRET is not set"
- ✅ Verify it's added in Vercel Environment Variables
- ✅ Make sure it's enabled for the environment you're deploying
- ✅ Redeploy after adding variables

### Error: "Database connection failed"
- ✅ Verify DATABASE_URL is correct
- ✅ Check database allows connections from Vercel
- ✅ Ensure SSL mode is set: `?sslmode=require`

### Error: "Build failed"
- ✅ Check all 3 required variables are set
- ✅ Verify variable names are exact (case-sensitive)
- ✅ Check Vercel build logs for specific errors

## 📞 Need Help?

1. Check Vercel build logs for the exact error
2. Verify all environment variables are set correctly
3. Make sure you redeployed after adding variables
4. Check that your database is accessible

---

**After setting these variables and redeploying, your app should work! 🎉**

