# Alertino

## Overview

Alertino is a SaaS platform that automates apartment hunting in the Polish real estate market. The application continuously monitors multiple property listing websites (including OLX) and sends instant notifications when new apartments match user-defined criteria.

- **Problem it solves**: Manually checking multiple real estate websites is time-consuming and inefficient. Users often miss new listings because they can't monitor sites 24/7.
- **Target audience**: People searching for apartments in Poland (rent or purchase), including individuals and real estate professionals.

## Key Features

- **Custom Search Filters**: Create multiple filters with criteria including city, price range, number of rooms, area, property type (apartment, house, room, studio, loft, commercial), and listing type (rent/sale)
- **Multi-Source Web Scraping**: Automated scraping from OLX with extensible architecture for additional sources
- **Real-Time Alerts**: Instant notifications when new listings match filter criteria
- **Subscription Tiers**: Three plans (Free, Basic, Pro) with different limits on filters, daily searches, and scraping frequency
- **Stripe Integration**: Full payment processing with subscription management, webhooks, and trial periods
- **Dashboard Analytics**: Track active filters, alerts, daily search usage, and subscription status
- **Favorite Alerts**: Mark and manage favorite listings
- **Search Limit Tracking**: Daily search quota enforcement based on subscription plan
- **Cookie Consent Management**: GDPR-compliant cookie banner and preferences
- **Email Notifications**: Integration with Resend for transactional emails
- **Dark Mode Support**: Theme-aware UI with system preference detection

## Tech Stack

### Frontend

- **Framework**: Next.js 15.3.4 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4, PostCSS
- **UI Components**: Radix UI primitives (Dialog, Dropdown, Select, Tabs, etc.)
- **Forms**: React Hook Form with Zod validation
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Theme Management**: next-themes

### Backend

- **Runtime**: Node.js
- **API**: Next.js API Routes and Server Actions
- **Authentication**: Supabase Auth with SSR support
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Web Scraping**: Cheerio for HTML parsing, Axios for HTTP requests
- **Payment Processing**: Stripe (subscriptions, webhooks, checkout sessions)
- **Email Service**: Resend

### Database

- **Primary Database**: Supabase PostgreSQL
- **Key Tables**: users, filters, alerts, subscriptions, search_logs
- **Security**: Row Level Security (RLS) policies for data isolation

### Infrastructure / Cloud

- **Hosting**: Vercel (implied by Next.js configuration)
- **Database Hosting**: Supabase Cloud
- **CDN**: Vercel Edge Network

### Tooling & DevOps

- **Language**: TypeScript 5
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm
- **Build Tool**: Next.js built-in bundler
- **Environment Validation**: Zod schemas for type-safe environment variables

## Architecture & Design

### High-Level Architecture

- **Frontend**: Next.js App Router with server and client components
- **Backend**: Server Actions for mutations, API routes for webhooks
- **Database**: Supabase with RLS policies ensuring user data isolation
- **External Services**: Stripe (payments), Resend (email), OLX (scraping target)

### Design Decisions

- **Server Actions Pattern**: Data mutations handled via Server Actions for type safety and reduced boilerplate
- **Scraper Manager Pattern**: Extensible scraper architecture with priority-based execution, rate limiting, and caching
- **Middleware-Based Auth**: Session management via Next.js middleware with Supabase SSR
- **Zod Schema Validation**: Type-safe validation for forms, environment variables, and API inputs
- **Error Boundary Pattern**: Centralized error handling with custom error types (APIError, AuthenticationError, ValidationError, etc.)
- **Rate Limiting**: In-memory rate limiting for API protection

### Data Flow

1. User creates filters via dashboard
2. Filters stored in Supabase with user isolation via RLS
3. Scraper Manager executes scheduled or manual searches based on subscription plan
4. Listings matched against active filters
5. New matches stored as alerts in database
6. Users receive notifications (email/SMS based on plan)
7. Stripe webhooks sync subscription status changes to database

## Project Structure

```
alertino/
├── app/                    # Next.js App Router pages and routes
│   ├── (auth)/            # Authentication routes (login, confirm)
│   ├── (protected)/       # Protected routes (dashboard, billing, account-settings)
│   ├── (public)/          # Public pages (pricing, terms, privacy, help)
│   ├── api/               # API routes (Stripe webhooks)
│   └── utils/             # Supabase client utilities
├── components/            # React components
│   ├── account-settings/  # Account management UI
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components (filters, alerts, stats)
│   ├── landing/           # Landing page sections
│   ├── pricing/           # Pricing page components
│   └── ui/                # Reusable UI components (shadcn/ui)
├── lib/                   # Core business logic
│   ├── actions/           # Server Actions (auth, billing, filters, alerts)
│   ├── config/            # Configuration files (env, filter features)
│   ├── errors/            # Error handling utilities
│   ├── scraper/           # Web scraping logic (manager, providers, utils)
│   ├── stripe/            # Stripe integration (checkout, webhooks, subscriptions)
│   └── utils/             # Utility functions
├── schemas/               # Zod validation schemas
├── supabase/              # Supabase configuration and migrations
│   └── migrations/        # Database migration files
├── types/                 # TypeScript type definitions
└── hooks/                 # React hooks
```

## Setup & Local Development

### Prerequisites

- Node.js 20+
- npm or compatible package manager
- Supabase account and project
- Stripe account
- Resend account

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd alertino
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID=your_basic_monthly_price_id
NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID=your_basic_yearly_price_id
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=your_pro_monthly_price_id
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=your_pro_yearly_price_id

# Email
RESEND_API_KEY=your_resend_api_key

# Environment
NODE_ENV=development
```

4. Set up Supabase database:
   - Run migrations from `supabase/migrations/` in your Supabase project
   - Ensure Row Level Security policies are enabled

5. Configure Stripe:
   - Create products and prices in Stripe dashboard
   - Set up webhook endpoint pointing to `/api/stripe/webhook`
   - Configure webhook events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

### Running the Project Locally

1. Start the development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Build for production:

```bash
npm run build
npm start
```

## Deployment

### Deployment Approach

- **Platform**: Vercel (recommended for Next.js applications)
- **Database**: Supabase Cloud (managed PostgreSQL)
- **CDN**: Vercel Edge Network for static assets and API routes

### Deployment Steps

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up Supabase project and run migrations
4. Configure Stripe webhook URL to point to production domain
5. Deploy via Vercel CLI or Git integration

### Hosting / Cloud Services

- **Application Hosting**: Vercel
- **Database**: Supabase Cloud
- **Payment Processing**: Stripe
- **Email Service**: Resend

## Security & Best Practices

### Authentication / Authorization

- **Authentication**: Supabase Auth with email/password
- **Session Management**: Server-side session handling via Supabase SSR
- **Route Protection**: Middleware-based authentication checks for protected routes
- **Authorization**: Row Level Security (RLS) policies in Supabase ensure users can only access their own data

### Data Validation and Error Handling

- **Input Validation**: Zod schemas for all form inputs and API payloads
- **Environment Validation**: Type-safe environment variable validation on application startup
- **Error Handling**: Centralized error handling with custom error classes (APIError, ValidationError, AuthenticationError, etc.)
- **Error Boundaries**: React error boundaries for graceful error recovery in UI
- **Rate Limiting**: In-memory rate limiting for API protection

### Security-Related Practices

- **Security Headers**: HTTP security headers configured in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- **SQL Injection Prevention**: Parameterized queries via Supabase client
- **XSS Prevention**: React's built-in XSS protection, sanitized user inputs
- **CSRF Protection**: SameSite cookie attributes and Stripe webhook signature verification
- **Data Isolation**: Row Level Security policies ensure users cannot access other users' data
- **Cookie Management**: Secure cookie handling with GDPR-compliant consent management
- **API Security**: Webhook signature verification for Stripe events
- **Type Safety**: TypeScript strict mode enabled for compile-time error prevention
