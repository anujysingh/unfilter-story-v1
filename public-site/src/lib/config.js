// Centralized runtime configuration for the public site.
//
// PUBLIC_API_URL is injected at build time by Astro/Vite. It is exposed to the
// browser (the `PUBLIC_` prefix makes that explicit) and is used both in
// server-rendered frontmatter and in client-side scripts.
//   PUBLIC_API_URL -> base URL of the API backend (Render)
//
// The localhost fallback keeps `npm run dev` working with no .env present.
export const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
