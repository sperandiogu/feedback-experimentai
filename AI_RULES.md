# AI Development Rules for Experimentaí Feedback App

This document provides guidelines for the AI assistant to follow when developing and modifying this application. The goal is to maintain code quality, consistency, and simplicity.

## Tech Stack Overview

This is a modern web application built with the following technologies:

-   **Framework**: React (using Vite for a fast development experience).
-   **Language**: TypeScript for type safety and improved developer experience.
-   **Backend & Database**: Supabase is used for the PostgreSQL database and backend APIs.
-   **Authentication**: Firebase Authentication (specifically Google Provider) is used for user sign-in.
-   **Styling**: Tailwind CSS is used for all styling. We do not use plain CSS, CSS-in-JS, or other styling libraries.
-   **UI Components**: The project uses pre-built, accessible components from **shadcn/ui**, located in `src/components/ui`.
-   **Icons**: All icons are provided by the `lucide-react` library.
-   **Animations**: UI animations and transitions are handled by `framer-motion`.

## Library Usage and Architectural Rules

To ensure the codebase remains clean and maintainable, please adhere to the following rules:

### 1. Component Development

-   **Use shadcn/ui First**: For common UI elements like buttons, cards, inputs, etc., always use the existing components from `src/components/ui`.
-   **Create New Components**: For any custom, reusable UI logic, create a new component file inside `src/components`. Do not add new components to existing files.
-   **Styling**: **Only use Tailwind CSS classes for styling.** Do not write custom CSS files or use inline `style` objects unless absolutely necessary for dynamic properties that cannot be handled by Tailwind.

### 2. Data and State Management

-   **Database Interaction**: All database operations **must** go through the Supabase client defined in `src/lib/supabase.ts`.
-   **Service Layer**: Abstract database logic into service classes within the `src/entities` directory (e.g., `EditionService`, `Feedback`, `User`). Components should call these services instead of directly calling Supabase functions.
-   **State Management**: For now, use React's built-in hooks (`useState`, `useEffect`, `useContext`). Do not introduce state management libraries like Redux or Zustand unless the application's complexity grows significantly.

### 3. Authentication

-   **Authentication Provider**: Firebase Authentication is the sole method for user authentication.
-   **Auth Hook**: Use the `useAuth` hook (`src/hooks/useAuth.ts`) as the single source of truth for the user's authentication state. All components that need user information should consume this hook.

### 4. Icons and Animations

-   **Icons**: Exclusively use icons from the `lucide-react` library. Do not install other icon libraries.
-   **Animations**: Use the `framer-motion` library for all UI animations to ensure consistency.

### 5. Code Structure

-   `src/components`: Reusable React components.
-   `src/components/ui`: Pre-built shadcn/ui components. Do not modify these directly.
-   `src/entities`: Service classes and logic for interacting with database tables (e.g., User, Edition).
-   `src/hooks`: Custom React hooks (e.g., `useAuth`).
-   `src/lib`: Initialization and configuration for third-party libraries (e.g., Supabase, Firebase).
-   `src/types`: TypeScript type definitions, especially for database structures.

By following these rules, we can ensure the application remains simple, elegant, and easy to maintain.