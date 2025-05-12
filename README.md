# Abbaquar-Sandream Centre Website

This is a static React website for the Abbaquar-Sandream Centre, built with:

- React 18
- Vite
- TypeScript
- TailwindCSS
- Shadcn/UI Components

## Features

- Responsive design
- Static pages for content
- Contact form
- Image gallery
- Activities and programs showcase

## Project Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components for each route
- `src/data`: Static JSON data files
- `src/lib`: Utility functions and helpers
- `src/hooks`: Custom React hooks
- `src/styles`: Global styles and Tailwind configuration
- `public`: Static assets

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```
# Google Maps API Key (if used for map component)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# PayFast integration (if using donations)
VITE_PAYFAST_MERCHANT_ID=your_merchant_id
VITE_PAYFAST_MERCHANT_KEY=your_merchant_key
VITE_PAYFAST_SANDBOX=true
```

## Backend Implementation with Supabase

This project uses Supabase as the backend for:
- Gallery images management
- Activities content management
- Events management
- Admin authentication

## Implementation Checklist

- [x] Set up Supabase client
- [x] Create types for database schema
- [x] Configure authentication
- [x] Implement gallery service
- [x] Implement activities service
- [x] Implement events service
- [x] Connect frontend components to Supabase
- [x] Create admin protected routes
- [x] Create admin dashboard UI
- [x] Create gallery management UI
- [x] Create activities management UI
- [x] Create events management UI

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file based on `.env.example`
4. Set up your Supabase project (see `SUPABASE_SETUP.md` for details)
5. Start development server: `npm run dev`

## Supabase Setup

See `SUPABASE_SETUP.md` for detailed instructions on setting up your Supabase project.

## Key Features

- Image optimization automatically handled by Supabase
- WEBP conversion for images
- Simple password-based admin authentication
- CRUD operations for all content
- Optimized for Vercel deployment

## Deployment

This project is configured for deployment on Vercel.

1. Connect your GitHub repository to Vercel
2. Add your environment variables in Vercel project settings
3. Deploy!
