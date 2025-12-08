# Dashboard

A Next.js 14 dashboard application for managing sellers, products, product history, scan logs, and seller metrics.

## Features

- **Sellers Management**: View and manage seller information
- **Products**: Browse and search products with enriched data
- **Product History**: Track changes to products over time
- **Scan Logs**: Monitor scanning activity and statistics
- **Seller Metrics**: View aggregated performance metrics

Each section supports:
- Table and Card view toggle
- Client-side search across all fields
- Pagination with configurable items per page (1-100, default: 10)
- Minimalist design with square corners and no shadows

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database with the schema from `gpt/prisma/schema.prisma`
- Access to the `DATABASE_URL` environment variable

### Installation

1. Navigate to the dashboard directory:
   ```bash
   cd apps/dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Update `.env.local` with your `DATABASE_URL`:
     ```
     DATABASE_URL="postgres://user:password@host:5432/database?sslmode=require"
     ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically redirect to `/sellers` on first load.

## Project Structure

```
dashboard/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Home page (redirects to /sellers)
│   ├── sellers/            # Sellers page
│   ├── products/           # Products page
│   ├── product-history/    # Product History page
│   ├── scan-logs/          # Scan Logs page
│   └── metrics/            # Seller Metrics page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components (sidebar, header)
│   ├── sellers/            # Seller-specific components
│   ├── products/           # Product-specific components
│   ├── product-history/    # Product history components
│   ├── scan-logs/          # Scan log components
│   └── metrics/            # Metrics components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and Prisma client
│   ├── prisma.ts           # Prisma client setup
│   ├── queries.ts          # Database query helpers
│   └── utils.ts            # Utility functions
└── prisma/                 # Prisma schema
    └── schema.prisma       # Database schema
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)

## Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **PostgreSQL** - Database

## Design Principles

- **Minimalist**: No box shadows, square corners
- **Light theme only**: Clean, simple interface
- **Server Components**: Data fetching happens server-side for better performance
- **Client-side filtering**: Fast, responsive search and pagination
- **Accessible**: Proper semantic HTML and ARIA labels

## Notes

- The Prisma schema is shared with the `gpt` directory but maintained separately in `dashboard/prisma/schema.prisma`
- Ensure both applications use the same `DATABASE_URL` to access the same database
- Pagination defaults to 10 items per page but can be adjusted from 1-100
- All search is performed client-side for instant results

