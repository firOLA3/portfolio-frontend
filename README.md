# OS11 Portfolio

## Deploy to Vercel

1. Import this repository into Vercel and set **Root Directory** to `os11`.
2. Use the Vite defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
3. Add this environment variable in the Vercel project's **Settings → Environment Variables**:
   - `VITE_API_BASE_URL` = `https://portfolio-backend-t1f3.onrender.com`
4. Deploy (or redeploy) the project.
5. In Render, set the backend's `CLIENT_URL` environment variable to the Vercel production origin, for example `https://your-project.vercel.app`, then redeploy/restart the backend. Use the origin only, without a path or trailing slash.

The frontend Content Security Policy allowlists the Render API origin in `index.html`; update its `connect-src` directive if the backend URL changes.

The Vercel rewrite in `vercel.json` sends app routes back to `index.html`, so React Router routes work on direct visits and page refreshes.

`VITE_API_BASE_URL` is included in the public frontend bundle. Use it only for the public API origin; never put secrets in `VITE_*` variables.

## Local development

Run `npm install` and then `npm run dev`. The Vite development server proxies `/api` requests to `http://localhost:5000`; set `VITE_API_BASE_URL` locally only if you want to call a different backend.

## Other commands

- `npm run build` - Build the production site into `dist`.
- `npm run lint` - Run ESLint.
- `npm run preview` - Preview the production build locally.
