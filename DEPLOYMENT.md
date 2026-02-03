# 🚀 Deployment Guide

## Quick Setup for Vercel Deployment with CI/CD

### Step 1: Set up GitHub Secrets for CI/CD

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets (optional - only if you want auto-deploy via GitHub Actions):

1. **VERCEL_TOKEN**
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Copy and add to GitHub secrets

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**
   - Run: `npx vercel link`
   - Get values from `.vercel/project.json`

### Step 2: Deploy to Vercel

**Option A: Deploy via Vercel Dashboard (Recommended for first time)**

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   NEXTAUTH_URL=your_vercel_domain
   ```
5. Click "Deploy"

**Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Step 3: Set up Production Database

**Option A: Vercel Postgres (Recommended)**

1. In Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string
4. Add to your project as `DATABASE_URL`

**Option B: External PostgreSQL**

- Railway: https://railway.app
- Neon: https://neon.tech
- Supabase: https://supabase.com

### Step 4: Run Migrations on Production

```bash
# Set up Vercel CLI for production
vercel link --prod

# Run migrations
npx prisma migrate deploy

# (Optional) Seed production database
npx prisma db seed
```

### Step 5: Verify Deployment

1. Visit your Vercel domain
2. Test registration
3. Login with demo credentials
4. Create an agent and test the arena

## GitHub Actions Status

After pushing, you'll see CI/CD workflows in the Actions tab:

- ✅ **CI Workflow**: Runs on every push to main
  - Lints code
  - Type checks
  - Runs tests
  - Builds application
  - Security scan

- 🚀 **Deploy Workflow**: Runs on every push to main (if Vercel secrets are configured)
  - Auto-deploys to Vercel production

## Environment Variables Checklist

### Development (.env)
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="any-secret-for-local-dev"
NEXTAUTH_URL="http://localhost:3000"
```

### Production (Vercel)
```env
DATABASE_URL="postgres://user:pass@host:5432/dbname"
NEXTAUTH_SECRET="generated-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://your-app.vercel.app"
```

## Troubleshooting

### Build Errors

**Error: "Cannot find module 'prisma'"**
```bash
npm install
```

**Error: "NEXTAUTH_SECRET is not set"**
- Add NEXTAUTH_SECRET in Vercel environment variables
- Generate with: `openssl rand -base64 32`

### Database Connection Errors

**Error: "Connection refused"**
- Check DATABASE_URL is correct
- Verify database allows external connections
- Check IP whitelist settings

### CI/CD Failures

**Error: "VERCEL_TOKEN not found"**
- Add VERCEL_TOKEN to GitHub Secrets
- Token must have deployment permissions

## Monitoring

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/sia12-web/Agent-Arena/actions
- **Logs**: Available in Vercel dashboard under Deployments

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update NEXTAUTH_URL to your custom domain

---

Need help? Open an issue on GitHub!
