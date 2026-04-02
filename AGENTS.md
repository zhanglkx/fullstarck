# AGENTS.md - Coding Agent Guidelines

This document provides essential information for AI coding agents working in this fullstack monorepo.

## Project Overview

This is a pnpm workspace-based monorepo containing:
- **apps/api**: NestJS 11 backend (TypeScript, runs on port 3000)
- **apps/web**: Next.js 16 frontend (App Router, React 19, Tailwind CSS 4, runs on port 3001)
- **apps/mobile**: Expo 54 mobile app (React Native, React 19)
- **packages/shared**: Shared TypeScript utilities and types

**Package Manager**: pnpm 10.33.0 (use `pnpm` commands, not npm or yarn)
**Node.js**: >= 20.0.0

## Build/Lint/Test Commands

### Root Level Commands (run from project root)
```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start all apps in dev mode
pnpm dev:api              # Start only API
pnpm dev:web              # Start only Web
pnpm dev:mobile           # Start only Mobile
pnpm build                # Build all apps
pnpm build:api            # Build API
pnpm build:web            # Build Web
pnpm lint                 # Lint all apps
pnpm test                 # Run tests for all apps
pnpm clean                # Clean all build artifacts
```

### API (NestJS) Commands
```bash
pnpm --filter api dev              # Start in dev mode with watch
pnpm --filter api build            # Build for production
pnpm --filter api lint             # Run ESLint with auto-fix
pnpm --filter api format           # Format with Prettier
pnpm --filter api test             # Run all unit tests
pnpm --filter api test:watch       # Run tests in watch mode
pnpm --filter api test:cov         # Run tests with coverage
pnpm --filter api test:e2e         # Run e2e tests
```

**Run a single test file:**
```bash
pnpm --filter api test -- src/app.controller.spec.ts
```

**Run a single test by name pattern:**
```bash
pnpm --filter api test -- --testNamePattern="should return Hello World"
```

### Web (Next.js) Commands
```bash
pnpm --filter web dev              # Start Next.js dev server
pnpm --filter web build            # Build for production
pnpm --filter web start            # Start production server
pnpm --filter web lint             # Run ESLint
```

### Mobile (Expo) Commands
```bash
pnpm --filter mobile start         # Start Expo dev server
pnpm --filter mobile ios           # Run on iOS simulator
pnpm --filter mobile android       # Run on Android emulator
```

### Shared Package Commands
```bash
pnpm --filter @fullstack/shared build    # Build shared package
pnpm --filter @fullstack/shared dev      # Build in watch mode
```

## Code Style Guidelines

### Import Organization

**API (NestJS):**
- Use single quotes for imports
- Group imports: external packages first, then internal modules
- Example:
  ```typescript
  import { Controller, Get } from '@nestjs/common';
  import { AppService } from './app.service';
  ```

**Web (Next.js):**
- Use double quotes for imports (Next.js convention)
- Use path aliases with `@/` for local imports
- Example:
  ```typescript
  import Image from "next/image";
  import { Button } from "@/components/Button";
  ```

**Mobile (Expo):**
- Use single quotes for imports
- Group React/React Native imports first, then external packages, then local modules
- Example:
  ```typescript
  import { StatusBar } from 'expo-status-bar';
  import { StyleSheet, Text, View } from 'react-native';
  import { useState, useEffect } from 'react';
  ```

### Formatting

**Prettier Configuration (API):**
- Single quotes: `true`
- Trailing commas: `'all'`
- End of line: `'auto'`

**ESLint:**
- API: TypeScript ESLint + Prettier integration
  - `@typescript-eslint/no-explicit-any`: OFF
  - `@typescript-eslint/no-floating-promises`: WARN
  - `@typescript-eslint/no-unsafe-argument`: WARN
  
- Web: Next.js ESLint config with TypeScript support
  - Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

**Always run linting after changes:**
```bash
pnpm --filter api lint      # Auto-fixes issues
pnpm --filter web lint      # Runs ESLint
```

### TypeScript Configuration

**Strict mode enabled** across all projects with:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `strictNullChecks: true`

**API-specific:**
- Target: ES2023
- Module: NodeNext
- Decorators: `experimentalDecorators: true`, `emitDecoratorMetadata: true`

**Web-specific:**
- Target: ES2017
- JSX: `react-jsx`
- Path aliases: `@/*` maps to `./src/*`

**Mobile-specific:**
- Target: ESNext
- JSX: `react-jsx`

### Naming Conventions

**Files:**
- Components (Web/Mobile): PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- Utilities/Services: camelCase (e.g., `formatDate.ts`, `api.service.ts`)
- Test files: `*.spec.ts` for unit tests, `*.e2e-spec.ts` for e2e tests

**Classes/Components:**
- PascalCase: `AppController`, `UserProfile`, `HealthResponse`
- Use descriptive names that reflect purpose

**Variables/Functions:**
- camelCase: `getHello()`, `checkAPIHealth`, `healthData`
- Boolean variables: use `is`, `has`, `should` prefixes (e.g., `isLoading`, `hasError`)

**Constants:**
- SCREAMING_SNAKE_CASE: `API_BASE_URL`
- Define in `packages/shared` for shared constants

**Interfaces/Types:**
- PascalCase with descriptive names
- Use `interface` for object shapes, `type` for unions/intersections
- Example:
  ```typescript
  export interface ApiResponse<T = unknown> {
    data: T;
    message: string;
    success: boolean;
  }
  ```

### Error Handling

**API (NestJS):**
- Use NestJS exception filters for consistent error responses
- Return meaningful HTTP status codes
- Example pattern from existing code:
  ```typescript
  try {
    // Operation
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  }
  ```

**Web/Mobile (React):**
- Use try-catch in async operations
- Store error state with `useState<string | null>(null)`
- Display user-friendly error messages
- Always handle loading states
- Example:
  ```typescript
  try {
    setLoading(true);
    // Fetch or async operation
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
  ```

### File Organization

**API Structure:**
```
apps/api/
├── src/
│   ├── main.ts              # Bootstrap file
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Controller
│   ├── app.service.ts       # Service
│   └── *.spec.ts            # Unit tests
└── test/
    └── *.e2e-spec.ts        # E2E tests
```

**Web Structure:**
```
apps/web/
├── src/
│   └── app/
│       ├── layout.tsx       # Root layout
│       ├── page.tsx         # Home page
│       └── api-test/
│           └── page.tsx     # Nested route page
```

**Mobile Structure:**
```
apps/mobile/
├── index.ts                 # Entry point
├── App.tsx                  # Main app component
└── app.json                 # Expo config
```

### Testing Patterns

**Unit Tests (API):**
```typescript
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```

**E2E Tests (API):**
```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## Next.js Important Notes

**This codebase uses Next.js 16 with breaking changes.** Before writing Next.js code:
1. Read relevant guides in `node_modules/next/dist/docs/`
2. Heed deprecation notices
3. Use App Router (not Pages Router)
4. Server Components are the default
5. Use `'use client'` directive for client components

## Shared Package Usage

Import shared utilities and types across all apps:
```typescript
import { API_BASE_URL, formatDate, ApiResponse } from '@fullstack/shared';
```

## Development Workflow

1. **Before starting**: Run `pnpm install` to ensure all dependencies are installed
2. **During development**: Use `pnpm dev` to start all apps or specific app commands
3. **After making changes**: 
   - Run `pnpm lint` to check for linting issues
   - Run `pnpm test` to ensure tests pass
   - Run `pnpm build` to verify build succeeds
4. **For API changes**: Run `pnpm --filter api test` to verify backend changes
5. **For Web changes**: Run `pnpm --filter web lint` and `pnpm --filter web build`
6. **For shared package changes**: Run `pnpm --filter @fullstack/shared build` first

## Important Reminders

- **Never commit secrets or environment files** (use `.env.example` as template)
- **Always run linting after code changes** - use `pnpm lint` or app-specific lint commands
- **Use TypeScript strict types** - avoid `any` when possible (though it's allowed in API)
- **Follow existing patterns** - check neighboring files for conventions
- **Use pnpm, not npm or yarn** - this is a pnpm workspace
- **Test coverage**: Aim for good test coverage on API endpoints and services
- **Mobile testing**: Test on both iOS and Android when possible
