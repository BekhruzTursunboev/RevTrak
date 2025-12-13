# 🚨 QUICK FIX: Vercel Deployment Error

## The Problem
Your build is failing with:
```
Error: NEXTAUTH_SECRET environment variable is not set
```

## ✅ Solution (2 Steps)

### Step 1: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Click your project** (RevTrak)
3. **Go to Settings** → **Environment Variables**
4. **Add these 3 variables:**

#### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://user:password@host:port/database?sslmode=require
```
*(Get this from your PostgreSQL provider)*

#### Variable 2: NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
```
*(Replace with YOUR actual Vercel URL - find it in Vercel Dashboard → Domains)*

#### Variable 3: NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: [Generate a random secret - see below]
```

**Generate NEXTAUTH_SECRET:**

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

**Or use online generator:**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated secret

**For each variable:**
- ✅ Check "Production"
- ✅ Check "Preview"  
- ✅ Check "Development"
- Click "Save"

### Step 2: Redeploy

After adding variables:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for build to complete

## ✅ That's It!

After redeploying with environment variables set, your app should work!

## 📋 Checklist

- [ ] Added DATABASE_URL to Vercel
- [ ] Added NEXTAUTH_URL to Vercel (with your actual domain)
- [ ] Added NEXTAUTH_SECRET to Vercel (generated secret)
- [ ] All variables enabled for Production, Preview, Development
- [ ] Redeployed the project

## 🐛 Still Not Working?

1. **Check build logs** in Vercel for specific errors
2. **Verify variables are set**: Settings → Environment Variables
3. **Make sure you redeployed** after adding variables
4. **Check DATABASE_URL format** is correct PostgreSQL connection string

---

**Need more help?** See `VERCEL_ENV_SETUP.md` for detailed instructions.

