# ClientsHub Client Portal

A modern client portal for managing workflows, analytics, and automation with ClientsHub's powerful platform.

## Development

### Local Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_NAME=ClientsHub Client Portal
   VITE_APP_VERSION=1.0.0
   ```
4. Start development server: `npm run dev`

### Environment Variables

The application requires the following environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_APP_NAME` - Application name (optional, defaults to "ClientsHub Client Portal")
- `VITE_APP_VERSION` - Application version (optional, defaults to "1.0.0")

**Development**: Add these to `.env.local` file in the project root
**Production**: Set these as environment variables in your hosting platform (e.g., Cloudflare Pages)

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` folder, ready for deployment.

## Production Deployment

### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set the build command: `npm run build`
3. Set the build output directory: `dist`
4. Configure environment variables in Cloudflare Pages dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_NAME` (optional)
   - `VITE_APP_VERSION` (optional)

### Other Hosting Platforms

For other platforms (Netlify, Vercel, etc.), ensure you:
1. Set the environment variables in your platform's dashboard
2. Configure SPA routing (see existing `_redirects`, `.htaccess`, `web.config` files)
3. Test authentication flow after deployment

### Deployment Checklist

- [ ] Set environment variables in hosting platform
- [ ] Ensure all static files are properly served
- [ ] Test authentication flow in production
- [ ] Verify database connections work
- [ ] Check that all routes are properly handled (SPA routing)

## Features

- **Client Portal**: Secure client dashboard with workflow management
- **Admin Panel**: Administrative interface for managing clients and workflows
- **Analytics**: Real-time performance tracking and reporting
- **Workflow Management**: Create, monitor, and manage automated workflows
- **Authentication**: Secure login with Supabase Auth
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Routing**: React Router
- **Icons**: Lucide React
- **Deployment**: Static hosting (Cloudflare Pages, Netlify, Vercel, etc.)