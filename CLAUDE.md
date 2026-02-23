# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Experimentai Feedback System - a React + TypeScript web application for collecting customer feedback through a multi-step flow. Uses Supabase for database/backend and Firebase for authentication.

## Development Commands

```bash
npm run dev      # Start Vite development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

### Tech Stack
- React 18 + TypeScript + Vite
- Supabase (PostgreSQL database)
- Firebase Authentication (Google OAuth)
- Tailwind CSS + shadcn/ui components
- lucide-react icons
- framer-motion animations

### Directory Structure
- `src/components/` - React components
- `src/components/ui/` - shadcn/ui components (do not modify directly)
- `src/entities/` - Service layer classes for database operations (User, Feedback, Questions, Box, Product)
- `src/hooks/` - Custom React hooks (useAuth)
- `src/lib/` - Third-party library configuration (supabase.ts, firebase.ts)
- `src/types/` - TypeScript type definitions (database.ts)
- `supabase/migrations/` - Database migration SQL files

### Key Patterns
- **Service Layer**: All database operations go through service classes in `src/entities/`. Components should never call Supabase directly.
- **Authentication**: `useAuth` hook (`src/hooks/useAuth.ts`) is the single source of truth for auth state.
- **Path Alias**: Use `@/*` to import from `src/*` (e.g., `@/components/ui/button`)

### Main Services
- `User` - User management and authentication
- `Feedback` - Feedback session creation and retrieval
- `QuestionsService` - Dynamic survey questions management
- `EditionService` - Product edition/box management

### Feedback Flow
1. Welcome Step
2. Product Feedback (per product in edition)
3. Experimentai Feedback (brand)
4. Delivery Feedback
5. Completion

## Development Rules

1. **Use shadcn/ui** for all standard UI components (buttons, cards, inputs, etc.)
2. **Tailwind CSS only** - No custom CSS files or inline styles (except dynamic properties)
3. **Service layer required** - All Supabase calls must go through `src/entities/` classes
4. **React hooks only** - Use useState, useEffect, useContext. No Redux/Zustand.
5. **lucide-react icons only** - No other icon libraries
6. **framer-motion** for all animations
7. **Firebase Authentication** is the sole auth method

## Environment Variables

Required in `.env`:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
