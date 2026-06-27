# Foodflow — Frontend Skeleton

The frontend skeleton for Foodflow (HimShakti Food Processing Unit), built with React + Vite +
Tailwind CSS + React Router. This covers Deliverable 1 from the brief: a running local dev
server, 4 routes, a `/components/ui` component library, dark/light mode, and a responsive layout.

## Stack

- React 19 + Vite
- React Router v7 (`react-router-dom`)
- Tailwind CSS v3 (class-based dark mode)
- `lucide-react` for icons
- `@fontsource/fraunces` + `@fontsource/work-sans` (self-hosted fonts, no external font CDN call)

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (defaults to `http://localhost:5173`). Verified with `npm run build`
and `npx eslint .` — both pass clean with zero errors.

## Routes

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Navbar, Hero, product Card grid (6 products), contact section, Footer |
| `/about` | About | Placeholder copy + a 3-card grid (second distinct use of Card) |
| `/dashboard` | Dashboard | Stat Card grid with a simulated loading state (Loader), and a Modal demo |
| `/login` | Login | A working form using Input + Button + Toast (client-side only, no real auth yet) |

Every page imports `Navbar` and `Footer` directly from `/src/components` — there's no shared
layout wrapper hiding that, so it's easy to confirm in code per-page.

## Folder structure

```
src/
  components/         Navbar, Hero, Card, Footer
  components/ui/       Button, Input, Modal, Toast, Loader, index.js (barrel export)
  context/             ThemeContext (dark/light + localStorage), ToastContext (toast queue)
  pages/                Home, About, Dashboard, Login
  data/products.js     Placeholder catalog data — replace with real HimShakti products
  utils/whatsapp.js    Builds the wa.me pre-filled order link
```

## Component library (`/src/components/ui`)

Import any of these from `'../components/ui'` (or the relative path from wherever you are):

```jsx
import { Button, Input, Modal, Toaster, Loader } from '../components/ui'
import { useToast } from '../context/ToastContext'
```

- **Button** — `variant` (`primary` | `secondary` | `outline`), `size` (`sm` | `md` | `lg`),
  `disabled`, `onClick`.
- **Input** — `label`, `placeholder`, `type`, `value`, `onChange`, `error` (renders a message and
  switches the field to an invalid style when set).
- **Modal** — `isOpen`, `onClose`, `title`, `children`. Renders via a portal, traps Tab focus
  inside the dialog, restores focus to the trigger on close, and closes on `Escape`.
- **Toaster** — mount once at the app root (already done in `main.jsx`). Trigger toasts from any
  component with `const { toast } = useToast()`, then `toast({ title, description, variant })`
  where `variant` is `default` | `success` | `error` | `warning`.
- **Loader** — `variant="spinner"` (with `size`) or `variant="skeleton"` (with `lines`).

## Dark/light mode

`ThemeContext` reads `localStorage['foodflow-theme']` on load (falling back to the OS preference),
toggles the `dark` class on `<html>`, and persists the choice on every change. Toggle button is in
the Navbar (sun/moon icon).

## Responsive testing — to complete on your end

I can't run a headless browser in this sandbox to capture real screenshots (no GUI, and both the
apt Chromium package and Playwright's browser download are blocked by this environment's network
allowlist — `cdn.playwright.dev` isn't reachable). I did trace through every breakpoint in the
Tailwind classes by hand (grids collapse to 1 column on mobile, the nav collapses to a hamburger
below `md`, no fixed pixel widths anywhere), but you should verify visually once it's running:

1. `npm run dev`, open it in Chrome.
2. DevTools → toggle device toolbar (Ctrl/Cmd+Shift+M) → set a custom size.
3. Capture at: **375×812** (mobile), **768×1024** (tablet), **1440×900** (desktop).
4. Check: no horizontal scrollbar at any size, nav collapses to the hamburger menu below `md`
   (768px), the product/stat grids go 1 → 2 → 3-or-4 columns as the screen widens.

If anything breaks at a given width, flag it and I'll fix it directly in the component.

## Known placeholders

- `src/data/products.js` — sample product names/prices; swap for HimShakti's real catalog.
- `src/utils/whatsapp.js` — `WHATSAPP_NUMBER` is a placeholder; replace with the real number.
- Footer/Home contact details (phone, location) are placeholders.
- Login is UI-only — not yet wired to a real auth endpoint (FastAPI backend isn't built yet).
