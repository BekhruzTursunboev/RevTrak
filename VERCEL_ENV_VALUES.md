# 📝 EXACT VALUES TO ENTER IN VERCEL

## When Adding Environment Variables in Vercel

When you click "Add New" in Environment Variables, you'll see 3 fields:
- **Key** (required)
- **Value** (required)  
- **Note** (optional)

---

## Variable #1: DATABASE_URL

### Key Field:
```
DATABASE_URL
```
*(Type exactly as shown - all caps, underscore)*

### Value Field:
```
postgresql://user:password@host:port/database?sslmode=require
```
*(Replace with YOUR actual database connection string)*

**How to get your DATABASE_URL:**

**If using Vercel Postgres:**
1. Go to Vercel Dashboard → Your Project
2. Click **Storage** tab
3. Click **Postgres** (or create one)
4. Click **.env.local** tab
5. Copy the `POSTGRES_URL` value
6. Paste it in the Value field

**If using Supabase:**
1. Go to Supabase Dashboard → Your Project
2. Click **Settings** → **Database**
3. Under "Connection string", copy the URI
4. Add `?sslmode=require` at the end
5. Paste it in the Value field

**If using Neon:**
1. Go to Neon Dashboard → Your Project
2. Click **Connection Details**
3. Copy the connection string
4. Paste it in the Value field

**If using Railway:**
1. Go to Railway Dashboard → Your Service
2. Click **Variables** tab
3. Copy the `DATABASE_URL` value
4. Paste it in the Value field

### Note Field (Optional):
```
PostgreSQL database connection string
```

### Environments:
✅ Check: **Production**  
✅ Check: **Preview**  
✅ Check: **Development**

---

## Variable #2: NEXTAUTH_URL

### Key Field:
```
NEXTAUTH_URL
```
*(Type exactly as shown - all caps, underscore)*

### Value Field:
```
https://your-app-name.vercel.app
```
*(Replace with YOUR actual Vercel domain)*

**How to find your Vercel URL:**

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** tab
3. Click **Domains** (left sidebar)
4. You'll see your domain listed (e.g., `revtrak.vercel.app`)
5. Copy it and add `https://` at the beginning
6. Example: `https://revtrak.vercel.app`

**OR:**

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click on any deployment
4. Look at the URL in the browser (e.g., `revtrak-abc123.vercel.app`)
5. Use that domain with `https://` prefix

### Note Field (Optional):
```
Your Vercel app URL for NextAuth
```

### Environments:
✅ Check: **Production**  
✅ Check: **Preview**  
✅ Check: **Development**

---

## Variable #3: NEXTAUTH_SECRET

### Key Field:
```
NEXTAUTH_SECRET
```
*(Type exactly as shown - all caps, underscore)*

### Value Field:
*(Generate a random secret - see methods below)*

**Method 1: PowerShell (Windows)**
1. Open PowerShell
2. Type this command:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```
3. Press Enter
4. Copy the output (it will be a long string of random characters)
5. Paste it in the Value field

**Method 2: Online Generator**
1. Go to: https://generate-secret.vercel.app/32
2. Click "Generate"
3. Copy the generated secret
4. Paste it in the Value field

**Method 3: If you have OpenSSL**
```bash
openssl rand -base64 32
```
Copy the output and paste it in the Value field.

**Example of what it looks like:**
```
aB3xY9mN2pQ7rT5vW8zX1cD4fG6hJ0kL3sA5dF7gH9jK1lM4nB6pC8qR2tU5vW7xY0zA3bC5dE7fG9h
```
*(This is just an example - generate your own!)*

### Note Field (Optional):
```
Secret key for NextAuth session encryption
```

### Environments:
✅ Check: **Production**  
✅ Check: **Preview**  
✅ Check: **Development**

---

## 📋 Quick Summary

| Variable | Key | Value Example |
|----------|-----|---------------|
| **DATABASE_URL** | `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` |
| **NEXTAUTH_URL** | `NEXTAUTH_URL` | `https://revtrak.vercel.app` |
| **NEXTAUTH_SECRET** | `NEXTAUTH_SECRET` | `aB3xY9mN2pQ7rT5vW8zX1cD4fG6hJ0kL3sA5dF7gH9jK1lM4nB6pC8qR2tU5vW7xY0zA3bC5dE7fG9h` |

---

## ✅ After Adding All 3 Variables

1. Make sure all 3 are listed in Environment Variables
2. Each should have ✅ for Production, Preview, and Development
3. Go to **Deployments** tab
4. Click **⋯** (three dots) on latest deployment
5. Click **Redeploy**
6. Wait for build to complete

---

## ⚠️ Important Notes

1. **Key names are CASE-SENSITIVE** - must be exactly:
   - `DATABASE_URL` (not `database_url` or `Database_Url`)
   - `NEXTAUTH_URL` (not `nextauth_url`)
   - `NEXTAUTH_SECRET` (not `nextauth_secret`)

2. **Value must be exact** - no extra spaces before or after

3. **Note field is optional** - you can leave it empty

4. **Environments** - Check all 3 boxes (Production, Preview, Development)

5. **After adding variables, you MUST redeploy** for them to take effect

---

**That's it! Follow these exact values and your deployment will work! 🎉**

