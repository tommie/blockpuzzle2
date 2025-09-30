# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Block Puzzle 2 is a fully implemented 1010!-style block puzzle game built as a modern Vue 3 + TypeScript + Vite web application. This is a bug-fixed reimplementation of an existing block puzzle game, featuring persistent game state, smooth animations with PIXI.js graphics, and comprehensive audio support.

## Development Commands

### Development

- `yarn dev` - Start development server with hot reload at http://localhost:5173/
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

### Modern Vue 3 Stack with Game Engine

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety throughout
- **Vite** for fast development and building
- **Pinia** for state management (stores in `/src/stores/`)
- **PIXI.js** for high-performance 2D graphics rendering
- **Bootstrap 5** for UI styling and components

### Core Game Architecture

#### State Management (`/src/stores/`)

- **`game.ts`** - Core game logic, piece placement, line clearing, and persistent state
- **`settings.ts`** - User preferences (animations, sound effects)
- **`highscore.ts`** - Local high score tracking

#### Game Engine (`/src/components/GameBoard.vue`)

- PIXI.js-based rendering system for smooth 60fps gameplay
- Drag-and-drop piece placement with visual feedback
- Animation system for piece scaling, line clearing, and score popups
- Touch and mouse input handling

#### Game Logic (`/src/stores/game.ts`)

- 19 predefined piece patterns (from 1x1 to 5x1 and 3x3)
- 10x10 grid with row/column clearing mechanics
- Persistent game state using localStorage
- Game over detection when no valid moves remain

#### Audio System (`/src/audio.ts`)

- Sound effects for piece placement, line clearing, and game over
- User-configurable audio settings
- Preloaded audio assets in `/src/assets/audio/`

### Key Components Architecture

- **`App.vue`** - Root component orchestrating game layout and score watching
- **`GameBoard.vue`** - PIXI.js-powered game rendering and interaction (800+ lines)
- **`GameControls.vue`** - Settings and game control buttons
- **`ScoreDisplay.vue`** - Current score and high score display
- **`GameOverModal.vue`** - Modal for game over state with restart options
- **`ScorePopup.vue`** - Animated score feedback for player actions

### Technical Configuration

- **Path Aliases**: `@` maps to `src/` directory
- **Vue DevTools**: Enabled for development debugging
- **TypeScript**: Strict configuration with Vue 3 support
- **ESLint**: Custom rules including unused variable patterns (`^_`)
- **Testing**: jsdom environment for DOM-dependent component testing

### Game Features

- Persistent game state across browser sessions
- Smooth PIXI.js animations with configurable duration settings
- Audio feedback with MP3 assets for game events
- Responsive design supporting landscape and portrait orientations
- Local high score tracking
- Settings persistence for user preferences

## Working with This Codebase

### Game Development Patterns

- Game state is centralized in Pinia stores with auto-save to localStorage
- PIXI.js graphics are encapsulated within Vue components using composition API
- Animation system uses custom easing functions in `/src/animation.ts`
- Audio management follows settings-aware patterns in `/src/audio.ts`

### Vue 3 + TypeScript Patterns

- Components use `<script setup lang="ts">` syntax
- Pinia stores use `defineStore()` with Composition API
- All files are TypeScript modules (`.ts`/`.vue`)
- PIXI.js integration uses shallowRef for performance with large graphics objects

### Development Workflow

1. Run `yarn dev` for development with hot reload
2. Use `yarn type-check` during development for type validation
3. Run `yarn test:unit` for testing
4. Use `yarn lint` before committing changes

### Game Logic Modification Guidelines

- **Piece Definitions**: Modify `PIECES` array in `src/stores/game.ts` for new piece shapes
- **Game Rules**: Core placement and clearing logic in `useGameStore()`
- **Visual Effects**: PIXI.js rendering and animations in `GameBoard.vue`
- **Audio Integration**: Sound effect management in `src/audio.ts`
- **Persistent Data**: Game state and settings automatically save to localStorage
- **Scoring System**: Configurable point values in game store actions

### Performance Considerations

- PIXI.js objects should use `shallowRef` to avoid Vue reactivity overhead
- Large graphics objects are managed outside Vue's reactivity system
- Animation system batches updates for smooth 60fps performance
