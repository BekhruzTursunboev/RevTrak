# Quick Setup Guide

## Prerequisites
- Node.js 18 or higher
- npm, yarn, or pnpm

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory with:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```
   
   To generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

3. **Initialize database:**
   
   **For PowerShell (Windows):**
   ```powershell
   npx prisma generate
   npx prisma db push
   ```
   
   **For Bash/CMD:**
   ```bash
   npx prisma generate && npx prisma db push
   ```
   
   Or run them separately:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to http://localhost:3000

## First Use

1. Click "Sign up" to create a new account
2. Enter your company name, name, email, and password
3. Sign in with your credentials
4. Start adding transactions and tasks!

## Troubleshooting

- **Database errors**: Run `npx prisma db push` again
- **Port already in use**: Change the port in package.json or use `PORT=3001 npm run dev`
- **Type errors**: Run `npm run build` to check for TypeScript errors

