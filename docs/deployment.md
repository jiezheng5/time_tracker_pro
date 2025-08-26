# Time Tracking App - Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the Time Tracking MVP application. The app is built with Next.js 14 and can be deployed to various platforms.

## Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- Git (for version control)

## Local Development

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd time_track_app2

# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000`

## ✅ Latest Deployment Status (Phase 4 Complete)

### Chart Visualization Improvements - DEPLOYED ✅
**Deployment Date**: Current
**Status**: ✅ **PRODUCTION READY** - Left sidebar width now fully adjustable

#### Key Features Deployed:
- **Resizable Left Panel**: Users can adjust sidebar width from 350px to 800px
- **Contextual Layout**: Different panel sizes for Categories (320px) vs Stats (450px)
- **Persistent Preferences**: Width settings saved per tab in localStorage
- **Enhanced Charts**: All charts respond to panel width changes
- **Improved UX**: Better resize handle visibility and interaction

#### Technical Implementation:
- **Architecture**: Clean single ResizablePanel wrapper (no nesting conflicts)
- **Storage**: Separate localStorage keys for Categories vs Stats tabs
- **Responsiveness**: Charts automatically adapt to panel width changes
- **Performance**: Optimized re-rendering with proper dependency arrays

## Automated Deployment Scripts

### Quick Deployment Commands
```bash
# Local production deployment
npm run deploy:local

# Docker deployment
npm run deploy:docker

# AWS deployment
npm run deploy:aws
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Production Deployment

### 1. Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Automatic Deployment
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

#### Environment Configuration
No environment variables required for MVP (uses localStorage).

### 2. Netlify

#### Using Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the application
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=.next
```

#### Build Settings
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18.x

### 3. Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Commands
```bash
# Build image
docker build -t time-tracker .

# Run container
docker run -p 3000:3000 time-tracker
```

### 5. Static Export (GitHub Pages, etc.)

For static hosting platforms:

```bash
# Add to next.config.js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

# Build static export
npm run build
```

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### Caching Strategy
- Static assets: 1 year cache
- HTML pages: No cache (for updates)
- API routes: Not applicable (client-side only)

## Monitoring & Analytics

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

### Performance Monitoring
- Vercel Analytics (if using Vercel)
- Google PageSpeed Insights
- Web Vitals monitoring

## Security Considerations

### Client-Side Security
- Data stored in localStorage (client-side only)
- No server-side data exposure
- XSS protection via React's built-in sanitization

### HTTPS
Ensure deployment platform provides HTTPS:
- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- Custom domains: Configure SSL certificates

## Backup & Data Management

### Local Storage Limitations
- Data is browser-specific
- No automatic backup
- Users should export data regularly

### Future Considerations
- Implement cloud storage integration
- Add data import/export features
- Consider progressive web app (PWA) features

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Run type checking
npm run type-check

# Fix common issues
npm run lint --fix
```

#### Deployment Failures
1. Check Node.js version compatibility
2. Verify all dependencies are in package.json
3. Ensure build command succeeds locally
4. Check platform-specific logs

### Performance Issues
- Enable Next.js compression
- Optimize images and assets
- Use CDN for static assets
- Monitor Core Web Vitals

## Scaling Considerations

### Current Architecture
- Client-side only application
- No server-side dependencies
- Scales with CDN distribution

### Future Scaling
- Add database for multi-user support
- Implement user authentication
- Add real-time collaboration features
- Consider microservices architecture

## Maintenance

### Regular Updates
- Update dependencies monthly
- Monitor security vulnerabilities
- Test on latest browser versions
- Review and update documentation

### Monitoring Checklist
- [ ] Application loads correctly
- [ ] All features work as expected
- [ ] Performance metrics within targets
- [ ] No console errors
- [ ] Mobile responsiveness maintained

## Support & Documentation

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [React Documentation](https://react.dev)

### Getting Help
- Check GitHub issues
- Review deployment platform documentation
- Contact development team

---

*Last updated: 2025-01-25*
*Version: 1.0.0*
