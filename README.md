# Coupe Building Designer

A comprehensive building design application with real-time 3D visualization, floor plan generation, and instant pricing.

## Features

- Interactive building design form with all specifications
- Real-time floor plan visualization
- 3D rendering using Three.js
- Instant pricing calculations
- Admin panel for pricing management
- PDF generation with floor plan, renderings, and building info
- Email submission to sales@coupebuildingco.com

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory
- `/components` - React components
- `/lib` - Utility functions and pricing logic
- `/public` - Static assets
- `/data` - Pricing data and Menards color options

