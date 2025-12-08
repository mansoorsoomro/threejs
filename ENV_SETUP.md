# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_MENARDS_API_BASE_URL=https://external-midwest.menards.com/postframe-web
```

## Setup Instructions

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` if needed (default values should work for Menards API)

3. Restart your development server after creating/updating `.env.local`:
   ```bash
   npm run dev
   ```

## Notes

- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `.env.example` file serves as a template for other developers
