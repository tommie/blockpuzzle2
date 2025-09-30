# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Block Puzzle 2, a modern Vue 3 + TypeScript + Vite web application. This appears to be a rewrite or new version of a block puzzle game (1010! style) using modern web frameworks.

## Development Commands

### Development
- `yarn dev` - Start development server with hot reload
- `yarn preview` - Preview production build locally

### Build & Type Checking
- `yarn build` - Full production build (includes type-checking)
- `yarn build-only` - Build without type-checking
- `yarn type-check` - Type-check with vue-tsc

### Testing & Code Quality
- `yarn test:unit` - Run unit tests with Vitest
- `yarn lint` - Lint and auto-fix with ESLint
- `yarn format` - Format code with Prettier

### Package Management
- `yarn` - Install dependencies
- Node.js: ^20.19.0 || >=22.12.0

## Architecture Overview

### Modern Vue 3 Stack
- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety throughout
- **Vite** for fast development and building
- **Pinia** for state management (stores in `/src/stores/`)
- **Vitest** for unit testing with jsdom environment

### Project Structure
- **`src/main.ts`** - Application entry point, sets up Vue app with Pinia
- **`src/App.vue`** - Root Vue component (currently minimal)
- **`src/stores/`** - Pinia stores for state management
- **`src/assets/`** - CSS and static assets
- **`vite.config.ts`** - Vite configuration with Vue plugin and path aliases
- **`vitest.config.ts`** - Test configuration extending Vite config

### Key Configuration
- **Path Aliases**: `@` maps to `src/` directory
- **Development Tools**: Vue DevTools plugin enabled for development
- **Testing Environment**: jsdom for browser-like testing environment
- **TypeScript**: Strict configuration with Vue 3 support

### State Management Pattern
- Uses Pinia stores with Composition API pattern
- Stores expose all state (no readonly states due to SSR hydration requirements per global instructions)
- Internal state can use `_internal` prefix for implementation details

## Working with This Codebase

### Vue 3 + TypeScript Patterns
- Components use `<script setup lang="ts">` syntax
- Pinia stores use `defineStore()` with Composition API
- All files are TypeScript modules (`.ts`/`.vue`)

### Development Workflow
1. Run `yarn dev` for development with hot reload
2. Use `yarn type-check` during development for type validation
3. Run `yarn test:unit` for testing
4. Use `yarn lint` before committing changes

### File Modification Guidelines
- **Vue Components**: Create `.vue` files in `src/`
- **Business Logic**: Create Pinia stores in `src/stores/`
- **Styling**: Use `src/assets/` for global styles, scoped styles in components
- **Types**: TypeScript types can be defined inline or in separate `.ts` files
- **Testing**: Unit tests alongside source files or in dedicated test directories

The project currently appears to be in early setup stage with minimal implementation beyond the Vue 3 + TypeScript + Pinia boilerplate.