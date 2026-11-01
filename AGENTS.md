# Project Architecture

- Maintain one shared React + TypeScript + Vite codebase.
- Canvas 2D remains the gameplay renderer.
- `src/` contains shared gameplay, components, UI, animations, and game systems.
- `android/` contains Android native project files.
- Capacitor packages the shared web build for Android.
- Preserve the existing Windows desktop integration and workflow.
- Preserve the existing browser/PWA workflow.

# Development Rules

- Inspect existing implementations before modifying them.
- Prefer minimal, targeted changes.
- Reuse existing utilities and components.
- Do not duplicate platform implementations.
- Keep platform-specific APIs isolated.
- Check platform availability before calling native APIs.
- Provide safe browser and Windows fallbacks.
- Never modify generated `dist/` or `dist-offline/` files manually.
- Never weaken Supabase security or expose secrets.
- Never change gameplay balance unless explicitly requested.

# Build Workflow

Browser:

```sh
npm run build
```

Android:

```sh
npm run build
npx cap sync android
```

This repository also provides `npm run sync:android`, which runs the Capacitor-mode Vite build before syncing. Prefer that existing workflow so Android receives the relative asset paths it needs.

Windows:

Use the existing verified Windows desktop build/package workflow. Do not invent a replacement workflow.

After relevant changes, test the affected platforms.
