# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terralis is a Next.js 16 application for tracking rock, mineral, and fossil collections. Users can create accounts, add specimens with detailed metadata (type, location, coordinates, hardness, etc.), and view their collection on an interactive map.

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
```

## Architecture

### Feature-Based Structure

The codebase uses a feature-based architecture where each feature is organized into layers:

```
features/
  <feature-name>/
    application/     # Business logic, API clients, hooks
      client/        # Client-side data fetching
    presentation/    # UI components (React/TSX)
```

Examples:
- `features/landingPage/application/client/specimenCrud.ts` - Specimen CRUD operations
- `features/collection/presentation/collection-map.tsx` - Map view component
- `features/shared/presentation/` - Shared UI components (button, input, card, etc.)

### Data Flow

1. **Client-side data fetching**: Features use TanStack Query (React Query) for data management
   - Query client configured in `lib/query-provider.tsx` with 1-minute stale time
   - Data fetched via functions in `features/*/application/client/`

2. **API Layer**: Next.js App Router API routes (`app/api/`)
   - `app/api/specimens/route.ts` - Full CRUD for specimens (GET, POST, PUT, DELETE)
   - `app/api/specimens/upload-url/route.ts` - AWS S3 presigned URL generation for image uploads
   - `app/api/specimens/delete-image/route.ts` - Image deletion from S3
   - `app/api/specimen-lookup/route.ts` - Specimen reference data lookup
   - All routes enforce user authentication via Supabase

3. **Database**: Supabase PostgreSQL with Row Level Security (RLS)
   - **User specimens table** (`specimens`): User-owned specimen collections with RLS
   - **Reference data table** (`specimen_reference`): Public reference database of known minerals, rocks, and fossils (no RLS, read-only)
   - Schema migrations in `scripts/` directory
   - Database transforms between snake_case (DB) and camelCase (API)

### Authentication

- Supabase Auth with SSR support
- **Server-side**: Use `createClient()` from `lib/supabase/server.ts` (async, handles cookies)
- **Client-side**: Use `createClient()` from `lib/supabase/client.ts` (sync, browser client)
- Auth routes: `app/auth/login/`, `app/auth/sign-up/`, `app/auth/sign-up-success/`

### Type System

Core type: `Specimen` defined in `types/specimen.ts`

```typescript
type: "rock" | "mineral" | "fossil"
details: { hardness, composition, color, luster, weight, dimensions }
coordinates: { lat, lng }
tags: string[]
```

API routes transform between DB schema (snake_case) and frontend type (camelCase).

### Image Upload (AWS S3)

- Uses AWS S3 for specimen image storage
- **Presigned URL pattern**: Client requests upload URL from API → uploads directly to S3 → saves URL to database
- S3 utilities in `lib/s3/upload.ts` and `lib/s3/config.ts`
- Constants (file size limit, allowed types) in `lib/s3/constants.ts`
- Max file size: **2.5MB** (configurable in `lib/s3/constants.ts`)
- Allowed formats: JPEG, PNG, WebP
- Automatic cleanup: Old images deleted from S3 when specimen updated/deleted
- Image upload component: `features/shared/presentation/image-upload.tsx`

### Specimen Reference Database

- Public database of known specimens (minerals, rocks, fossils) with properties
- Table: `specimen_reference` (see `scripts/004_create_specimen_reference_table.sql`)
- API: `app/api/specimen-lookup/route.ts`
- Auto-fills specimen details during creation based on name
- Fallback to in-memory database if Supabase query fails
- To add new specimens: Insert into `specimen_reference` table via Supabase SQL Editor

### Mapping

- Uses Leaflet via react-leaflet for interactive maps
- Type definitions in `types/leaflet.d.ts`
- Map component: `features/collection/presentation/collection-map.tsx`

## Path Aliases

TypeScript configured with `@/*` pointing to project root:
```typescript
import { Specimen } from "@/types/specimen"
import { createClient } from "@/lib/supabase/client"
```

## Database Schema Management

SQL migration scripts in `scripts/`:
- `001_create_specimens_table.sql` - User specimens table with RLS
- `002_add_coordinates_columns.sql` - Added lat/lng to specimens
- `003_add_tags_column.sql` - Added tags array to specimens
- `004_create_specimen_reference_table.sql` - Reference data for known specimens

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
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **Leaflet** - Interactive maps
- **Zod** - Schema validation

## HTTPS Development

Development server runs with `--experimental-https` flag. SSL certificates stored in `certificates/` directory.
