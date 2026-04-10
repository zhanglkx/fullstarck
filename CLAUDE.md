# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **pnpm workspace monorepo** containing a full-stack application:

- `apps/api` - NestJS 11 backend (port 3000)
- `apps/web` - Next.js 16 frontend (port 3001)
- `apps/mobile` - Expo 54 mobile app (React Native)
- `packages/shared` - Shared TypeScript utilities and types

**Package Manager**: pnpm 10.33.0 (ALWAYS use `pnpm`, never npm or yarn)
**Node.js**: >= 20.0.0

## Essential Commands

### Development

```bash
# Install all dependencies
pnpm install

# Start all apps
pnpm dev

# Start specific apps
pnpm dev:api        # API only
pnpm dev:web        # Web only
pnpm dev:mobile     # Mobile only

# Build
pnpm build          # All apps
pnpm build:api      # API only
pnpm build:web      # Web only

# Lint & Test
pnpm lint           # Lint all apps and packages
pnpm lint:root      # Lint root-level files
pnpm test           # Test all apps

# Format (Prettier)
pnpm format         # Format all files
pnpm format:check   # Check formatting without changes
```

### Working with Specific Apps

Use `pnpm --filter <app-name>` to run commands in a specific workspace:

```bash
# API commands
pnpm --filter api dev
pnpm --filter api test              # All tests
pnpm --filter api test -- path/to/test.spec.ts    # Single test file
pnpm --filter api test -- --testNamePattern="test name"
pnpm --filter api test:watch        # Watch mode
pnpm --filter api test:cov          # Coverage
pnpm --filter api test:e2e          # E2E tests
pnpm --filter api lint              # Auto-fixes
pnpm --filter api format            # Prettier

# Web commands
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start             # Production server
pnpm --filter web lint

# Mobile commands
pnpm --filter mobile start
pnpm --filter mobile ios
pnpm --filter mobile android
pnpm --filter mobile lint       # ESLint with auto-fix

# Shared package
pnpm --filter @fullstack/shared build
pnpm --filter @fullstack/shared dev    # Watch mode
pnpm --filter @fullstack/shared lint   # ESLint with auto-fix
```

## Architecture Patterns

### Shared Package Usage

The `@fullstack/shared` package contains shared utilities, types, and constants. Import across all apps:

```typescript
import { API_BASE_URL, formatDate, ApiResponse } from '@fullstack/shared';
```

The shared package exports:

- `API_BASE_URL` - Base URL for API (defaults to http://localhost:3000)
- `ApiResponse<T>` - Standard API response interface
- `formatDate()` - Date formatting utility
- `sleep()` - Promise-based delay utility

### API (NestJS) Patterns

**CORS Configuration**: API has CORS enabled for `localhost:3001` and `localhost:3000` (see `apps/api/src/main.ts`).

**Path Aliases**: `@/*` maps to `src/*` for cleaner imports.

**Validation**: Global validation pipe configured with `whitelist`, `forbidNonWhitelisted`, and `transform` enabled.

**Module Structure**: Standard NestJS pattern with controllers, services, and modules. Each feature should follow:

```
src/
├── feature/
│   ├── feature.controller.ts
│   ├── feature.service.ts
│   ├── feature.module.ts
│   ├── feature.controller.spec.ts
│   ├── dto/
│   │   ├── create-feature.dto.ts
│   │   └── update-feature.dto.ts
│   └── entities/
│       └── feature.entity.ts
```

**Module Generator**: Use the custom generator to scaffold new CRUD modules:

```bash
pnpm generate:api <module-name>   # or pnpm g:api <module-name>
# Example: pnpm g:api user
```

This automatically creates REST API controller, service, module, DTOs, and entity files.

**Testing**: Jest with `@nestjs/testing`. Use `Test.createTestingModule()` for unit tests. E2E tests go in `test/` directory with `*.e2e-spec.ts` naming.

### Web (Next.js) Patterns

**CRITICAL**: This project uses **Next.js 16** with breaking changes. Before writing Next.js code, check `node_modules/next/dist/docs/` for updated patterns.

- Uses **App Router** (not Pages Router)
- **Server Components** are default
- Client components need `'use client'` directive
- Path aliases: `@/*` maps to `./src/*`
- Runs on port 3001 by default with `--inspect` flag (Node.js debugging enabled)

**UI Library**: Uses **Ant Design 6** with custom theme configuration via `AntdProvider` in `src/components/AntdProvider.tsx`. The provider wraps the app in `layout.tsx`.

**Styling**: Supports both **SCSS/Sass** (`.scss` files) and Ant Design's component styling. Import global styles in `layout.tsx`.

**Import convention**: Use double quotes (Next.js convention):

```typescript
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Button as AntButton } from 'antd'; // Ant Design components
```

### Mobile (Expo) Patterns

- Expo 54 with React Native 0.84.1 and React 19
- Entry point: `index.ts` → `App.tsx`
- Use single quotes for imports
- Test on both iOS and Android when possible

## Code Style

### Unified Configuration Strategy

All projects share common base configurations:

**TypeScript**: API and Web inherit from `tsconfig.base.json` for consistency. Mobile uses Expo's base config, Shared extends root config.

**ESLint**: All projects use:

- `projectService: true` + `tsconfigRootDir: import.meta.dirname` for proper Monorepo type checking
- API uses `recommendedTypeChecked` for strictest checking
- Mobile uses `recommendedTypeChecked` with relaxed rules for React Native compatibility
- Shared uses `recommended` config
- Consistent `no-unused-vars` rules: `warn` level with `^_` ignore pattern

**Prettier**: Single root `.prettierrc` with Web-specific override (double quotes). No duplicate configs in subprojects.

### Configuration File Locations

```
├── .prettierrc                      # Root Prettier config (all projects)
├── tsconfig.base.json               # Shared TypeScript base config
├── eslint.config.mjs                # Root ESLint (for root-level files only)
├── apps/
│   ├── api/
│   │   ├── eslint.config.mjs        # API ESLint + Prettier integration
│   │   └── tsconfig.json            # Extends tsconfig.base.json
│   ├── web/
│   │   ├── eslint.config.mjs        # Next.js ESLint
│   │   └── tsconfig.json            # Extends tsconfig.base.json
│   └── mobile/
│       ├── eslint.config.mjs        # React + React Hooks ESLint
│       └── tsconfig.json            # Extends expo/tsconfig.base
└── packages/
    └── shared/
        ├── eslint.config.mjs        # Shared package ESLint
        └── tsconfig.json            # Extends tsconfig.base.json
```

### Import Conventions by App

**API**: Single quotes, external packages first

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
```

**Web**: Double quotes, use path aliases

```typescript
import Image from 'next/image';
import { Button } from '@/components/Button';
```

**Mobile**: Single quotes, React/RN first

```typescript
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
```

### TypeScript Configuration

All apps use **strict mode** with:

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `strictNullChecks: true`

API uses decorators: `experimentalDecorators: true`, `emitDecoratorMetadata: true`

### Naming Conventions

- **Files**: Components use PascalCase (`Button.tsx`), utilities use camelCase (`api.service.ts`)
- **Tests**: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)
- **Classes/Components**: PascalCase
- **Variables/Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE (in `packages/shared`)
- **Booleans**: Prefix with `is`, `has`, `should` (e.g., `isLoading`)

### ESLint Configuration

**API**: TypeScript ESLint + Prettier

- `@typescript-eslint/no-explicit-any`: OFF
- `@typescript-eslint/no-floating-promises`: WARN
- `@typescript-eslint/no-unsafe-argument`: WARN
- Auto-fixes with `pnpm --filter api lint`

**Web**: Next.js ESLint config with `eslint-config-next/core-web-vitals`

**Mobile**: React + React Hooks ESLint

- `react-hooks/rules-of-hooks`: ERROR
- `react-hooks/exhaustive-deps`: WARN
- Auto-fixes with `pnpm --filter mobile lint`

**Shared Package**: TypeScript ESLint with recommended rules

All ESLint configs use the new flat config format (eslint.config.mjs).

### Prettier Configuration

- Single quotes (except Next.js web app uses double quotes)
- Trailing commas: all
- Print width: 100
- Tab width: 2 (spaces)
- Auto-formats on save in VSCode
- Run `pnpm format` to format all files manually

## Error Handling Pattern

API and client apps use consistent error handling:

```typescript
try {
  setLoading(true);
  // Async operation
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
} finally {
  setLoading(false);
}
```

## Important Notes

### Next.js 16 Breaking Changes

Before writing Next.js code, read relevant guides in `node_modules/next/dist/docs/`. The App Router and React 19 Server Components patterns differ significantly from previous versions.

### CORS Configuration

The API enables CORS for localhost:3001 (web) and localhost:3000 (self). Update `apps/api/src/main.ts` if adding new origins.

### Workspace Protocol

Dependencies between monorepo packages use `workspace:*`:

```json
{
  "dependencies": {
    "@fullstack/shared": "workspace:*"
  }
}
```

### Shared Package Rebuilds

After modifying `packages/shared`, rebuild it before testing in apps:

```bash
pnpm --filter @fullstack/shared build
```

For active development, run in watch mode:

```bash
pnpm --filter @fullstack/shared dev
```

## Environment Variables

Environment variables are configured in `.env` files:

- **Root `.env`**: API and global configuration (API_PORT, API_BASE_URL)
- **`apps/web/.env`**: Next.js specific variables (must be prefixed with `NEXT_PUBLIC_` for client access)

Key variables:

- `API_PORT`: Backend port (default: 3000)
- `NEXT_PUBLIC_API_URL`: API URL for frontend/mobile (default: http://localhost:3000)
- `EXPO_PUBLIC_API_URL`: API URL for mobile app (Expo convention)

Copy `.env.example` files to `.env` and customize as needed.

## Development Workflow

1. **Install dependencies**: `pnpm install`
2. **Setup environment**: Copy `.env.example` to `.env` at root and in `apps/web/` if needed
3. **Start development**: `pnpm dev` (all apps) or `pnpm dev:<app>` (specific app)
4. **After changes**:
   - Run `pnpm format` to format code with Prettier
   - Run `pnpm lint` to check and auto-fix ESLint issues
   - Run `pnpm test` as needed
5. **Before commits**: Ensure formatting and linting pass, and tests succeed

## Documentation

Detailed documentation in Chinese is available in `docs/`:

- `docs/monorepo/index.md` - Architecture overview
- `docs/monorepo/subpackage-create.md` - Creating new packages
- `docs/monorepo/subpackage-use.md` - Using packages
- `docs/monorepo/dependency-management.md` - Version management
- `docs/reference/commands.md` - Command reference
