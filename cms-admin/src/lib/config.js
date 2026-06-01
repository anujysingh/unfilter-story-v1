// Centralized runtime configuration for the admin SPA.
//
// These values are injected at build time by Vite. Set them in `.env`
// (local) and in the Vercel project's Environment Variables (production):
//   VITE_API_URL          -> base URL of the API backend (Render)
//   VITE_PUBLIC_SITE_URL  -> base URL of the public Astro site
//
// The localhost fallbacks keep `npm run dev` working with no .env present.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const PUBLIC_SITE_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL || 'http://localhost:4321';
