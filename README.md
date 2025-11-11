# Google Ads Change Logger

A comprehensive change tracking and reporting system for Google Ads accounts.

## Features

- Track changes across multiple Google Ads accounts
- User management with role-based access control
- Detailed reporting and analytics
- Export reports to PDF
- Dark mode support

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push your code to GitHub

2. Import your project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Configure Environment Variables in Vercel:
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variables:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

4. Deploy:
   - Vercel will automatically build and deploy your app
   - Every push to your main branch will trigger a new deployment

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Get these values from your Supabase project settings: https://supabase.com/dashboard/project/_/settings/api

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Database & Authentication)
- Recharts (Data visualization)
- jsPDF (PDF export)
