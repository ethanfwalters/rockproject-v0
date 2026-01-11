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
   - `app/api/specimen-lookup/route.ts` - Specimen lookup functionality
   - All routes enforce user authentication via Supabase

3. **Database**: Supabase PostgreSQL with Row Level Security (RLS)
   - Schema defined in `scripts/001_create_specimens_table.sql`
   - RLS policies ensure users only access their own specimens
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
- `001_create_specimens_table.sql` - Base table with RLS
- `002_add_coordinates_columns.sql` - Added lat/lng
- `003_add_tags_column.sql` - Added tags array

Run migrations directly in Supabase SQL Editor.

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Key Dependencies

- **Next.js 16** - App Router with React 19
- **Supabase SSR** - Authentication and database
- **TanStack Query** - Server state management
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **Leaflet** - Interactive maps
- **Zod** - Schema validation

## HTTPS Development

Development server runs with `--experimental-https` flag. SSL certificates stored in `certificates/` directory.
