# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terralis is a Next.js 16 application for tracking rock, mineral, and fossil collections. Users can create accounts, add specimens with detailed metadata (minerals, locality, dimensions, images), and view their collection on an interactive map. The platform includes an admin dashboard for managing minerals, localities, users, and specimen data.

## Development Commands

```bash
# Development server with HTTPS
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint

# Run tests
npx vitest
```

## Architecture

### Feature-Based Structure

The codebase uses a feature-based architecture where each feature is organized into layers:

```
features/
  <feature-name>/
    application/     # Business logic, API clients, hooks
      client/        # Client-side data fetching
      hooks/         # Feature-specific React hooks
    domain/          # Types (Zod schemas), utility functions
    presentation/    # UI components (React/TSX)
```

### Features

- **`admin/`** - Admin dashboard: user management, mineral approval, specimen editing, bulk import, stats
- **`collection/`** - User's specimen collection: map view, stats overview
- **`homepage/`** - Landing page and authenticated homepage
- **`landingPage/`** - Public landing page
- **`localityDetail/`** - Locality detail view with breadcrumbs, child localities, editing
- **`mineralDetail/`** - Mineral detail page
- **`navbar/`** - Navigation bar
- **`profilePage/`** - User profile
- **`shared/`** - Shared UI components (Radix UI based) and shared CRUD clients (localities, minerals)
- **`specimenAdd/`** - Multi-step specimen creation flow (minerals, locality, dimensions, image, review)
- **`specimenDetail/`** - Specimen detail view
- **`specimenEdit/`** - Specimen editing form

### Data Flow

1. **Client-side data fetching**: Features use TanStack Query (React Query) for data management
   - Query client configured in `lib/query-provider.tsx` with 1-minute stale time
   - Data fetched via functions in `features/*/application/client/`

2. **API Layer**: Next.js App Router API routes (`app/api/`)
   - `app/api/specimens/route.ts` - Full CRUD for specimens (GET, POST, PUT, DELETE)
   - `app/api/specimens/upload-url/route.ts` - S3 presigned URL generation for image uploads
   - `app/api/specimens/delete-image/route.ts` - Image deletion from S3
   - `app/api/minerals/route.ts` - Mineral CRUD (GET, POST)
   - `app/api/minerals/[id]/route.ts` - Individual mineral operations (GET, PUT, DELETE)
   - `app/api/submitted-minerals/route.ts` - User-submitted minerals pending approval
   - `app/api/localities/route.ts` - Locality CRUD (GET, POST)
   - `app/api/localities/[id]/route.ts` - Individual locality operations (GET, PUT, DELETE)
   - `app/api/admin/` - Admin-only routes (stats, user management, mineral review, import)
   - All routes enforce user authentication via Supabase

3. **Database**: Supabase PostgreSQL with Row Level Security (RLS)
   - **`specimens`** - User-owned specimen collections (RLS protected)
   - **`minerals`** - Reference mineral database with approval workflow
   - **`localities`** - Geographic locations with parent/child hierarchy
   - **`admin_users`** - Admin and super admin tracking
   - Database transforms between snake_case (DB) and camelCase (API)

### App Routes

```
/                          # Home (redirects based on auth)
/auth/login                # Login page
/auth/sign-up              # Registration page
/auth/sign-up-success      # Post-registration confirmation
/collection                # User's specimen collection (protected)
/profile                   # User profile (protected)
/mineral/[id]              # Mineral detail page (protected)
/localities/[id]           # Locality detail page
/admin                     # Admin dashboard
/admin/minerals            # Admin mineral management
/admin/specimens           # Admin specimen list
/admin/specimens/add       # Admin specimen creation
/admin/specimens/[id]/edit # Admin specimen editing
/admin/users               # Admin user management (super admin)
/admin/app-users           # App user statistics
/admin/import              # Bulk mineral import
```

### Authentication

- Supabase Auth with SSR support
- **Server-side**: Use `createClient()` from `lib/supabase/server.ts` (async, handles cookies)
- **Client-side**: Use `createClient()` from `lib/supabase/client.ts` (sync, browser client)
- **Admin auth**: `checkAdminAuth()` and `checkSuperAdminAuth()` from `lib/admin-auth.ts`
- **Route protection**: Middleware in `proxy.ts` protects `/collection`, `/profile`, `/mineral` routes
- Two-tier admin system: `admin` and `super_admin` roles via `admin_users` table

### Type System

All types should be using a Zod schema. Define the schema first, then extract the type:

```typescript
const ExampleTypeSchema = z.object({
   id: z.number(),
   name: z.string(),
})

type ExampleType = z.infer<typeof ExampleTypeSchema>
```

Core types defined in `types/`:
- **`types/specimen.ts`** - `Specimen`, `CreateSpecimenInput`, `UpdateSpecimenInput`
- **`types/mineral.ts`** - `Mineral`, `CreateMineralInput` (with variety support and approval status)
- **`types/locality.ts`** - `Locality`, `LocalityWithAncestors`, `LocalityTree`, `LocalityDetail`
- **`types/leaflet.d.ts`** - Leaflet type definitions

API routes transform between DB schema (snake_case) and frontend types (camelCase).

### Image Upload (AWS S3)

- Uses AWS S3 for specimen image storage
- **Presigned URL pattern**: Client requests upload URL from API -> uploads directly to S3 -> saves URL to database
- S3 utilities in `lib/s3/upload.ts` and `lib/s3/config.ts`
- Constants (file size limit, allowed types) in `lib/s3/constants.ts`
- Max file size: **2.5MB** (configurable in `lib/s3/constants.ts`)
- Allowed formats: JPEG, PNG, WebP
- Automatic cleanup: Old images deleted from S3 when specimen updated/deleted
- Image upload component: `features/shared/presentation/image-upload.tsx`
- Upload hook: `features/shared/hooks/useImageUpload.ts`

### Minerals System

- Minerals table with name, chemical formula, variety support
- Varieties link to a parent mineral via `variety_of` column
- Approval workflow: minerals can be `approved`, `pending`, or `rejected`
- Users can submit new minerals; admins review and approve/reject
- Admin bulk import for adding minerals in batches
- Mineral picker: `features/shared/presentation/mineral-multi-select.tsx`

### Localities System

- Hierarchical location system with parent/child relationships
- Kinds: country, state, district, mine, etc.
- Optional latitude/longitude coordinates
- Locality picker: `features/shared/presentation/locality-picker.tsx`
- Breadcrumb navigation for locality hierarchy
- API supports tree queries and ancestor lookups

### Admin Dashboard

- **Stats**: Total users, specimens, minerals, localities, recent activity
- **Minerals management**: Approve/reject submitted minerals, edit mineral data
- **Specimen management**: View, create, edit, delete specimens
- **User management**: View app users and stats; manage admin users (super admin only)
- **Bulk import**: Import minerals from data files
- Admin types defined in `features/admin/domain/types.ts`

### Mapping

- Uses Leaflet via react-leaflet for interactive maps
- Type definitions in `types/leaflet.d.ts`
- Map component: `features/collection/presentation/collection-map.tsx`
- Locality map: `features/localityDetail/presentation/locality-map.tsx`

## Path Aliases

TypeScript configured with `@/*` pointing to project root:
```typescript
import { Specimen } from "@/types/specimen"
import { createClient } from "@/lib/supabase/client"
```

## Library Directory (`lib/`)

- `lib/supabase/server.ts` - Server-side Supabase client (async, cookie-based)
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/admin.ts` - Admin Supabase utilities
- `lib/supabase/proxy.ts` - Auth middleware and route protection
- `lib/admin-auth.ts` - Admin/super-admin permission checking
- `lib/query-provider.tsx` - TanStack Query provider (1-minute stale time)
- `lib/utils.ts` - Utility functions (`cn` for class merging)
- `lib/s3/config.ts` - S3 client configuration
- `lib/s3/upload.ts` - S3 upload/delete utilities
- `lib/s3/constants.ts` - S3 constants (file size, allowed types)

## Database Schema Management

SQL migration scripts in `scripts/` (21 scripts, `001` through `021`):

Key migrations:
- `001` - Create specimens table with RLS
- `005` - Create admin_users table with super admin flag
- `006` - Create minerals table
- `007` - Create localities table with parent/child hierarchy
- `010` - Drop old specimen_reference table
- `011-012` - Seed countries and minerals
- `013` - Add specimen visibility (`is_public` flag)
- `014-018` - Mineral chemical formulas and variety support
- `019` - Add `variety_of` column for parent mineral references
- `020` - Fix localities unique constraint
- `021` - Add mineral approval workflow columns (status, submitted_by, admin_notes, reviewed_by)

Run migrations directly in Supabase SQL Editor.

## Environment Variables

Required in `.env.local`:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**AWS S3 (for image uploads):**
- `AWS_S3_REGION` - S3 bucket region (e.g., us-east-2)
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `NEXT_PUBLIC_AWS_S3_BASE_URL` - Public S3 base URL

## Key Dependencies

- **Next.js 16** - App Router with React 19
- **Supabase SSR** - Authentication and database
- **TanStack Query** - Server state management
- **AWS SDK** - S3 image storage (presigned URLs)
- **Tailwind CSS 4** - Styling (with CSS variables)
- **Radix UI** - Accessible component primitives
- **Leaflet / react-leaflet** - Interactive maps
- **Zod** - Schema validation
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Vitest** - Testing framework (with @testing-library/react)

## Testing

- **Framework**: Vitest with jsdom environment
- **Config**: `vitest.config.ts` and `vitest.setup.tsx`
- **Coverage**: v8 provider
- **Test pattern**: `**/*.test.{ts,tsx}` and `**/__tests__/**/*.{ts,tsx}`

## HTTPS Development

Development server runs with `--experimental-https` flag. SSL certificates stored in `certificates/` directory.
