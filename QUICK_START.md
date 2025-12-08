# Quick Start Guide

## Installation

1. Navigate to the project directory:
   ```bash
   cd /Users/maria/Desktop/New/threejs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up email configuration:
   - Copy `.env.example` to `.env.local` (if it exists)
   - Or create `.env.local` with SMTP settings (see ENV_SETUP.md)
   - If skipped, quotes will be logged to console instead of emailed

## Running the Application

Start the development server:
```bash
npm run dev
```

Open your browser:
- **Main Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## Using the Application

### For Clients (Main Page)

1. Fill out the building design form with all specifications
2. Add windows and doors using the placement tool
3. View real-time updates:
   - Floor plan visualization
   - 3D rendering (drag to rotate, scroll to zoom)
   - Building information sheet with instant pricing
4. Click "Submit Quote" when ready
5. A PDF will be generated and emailed to sales@coupebuildingco.com

### For Admins (Admin Panel)

1. Navigate to http://localhost:3000/admin
2. Adjust pricing for any component:
   - Base prices
   - Multipliers
   - Per-unit prices
   - Per-linear-foot prices
   - Per-square-foot prices
3. Click "Save Pricing" to update
4. Changes take effect immediately for new quotes

## Important Notes

- **Menards Colors**: Update `data/menardsColors.ts` with actual Menards color codes
- **Window/Door Options**: Update `data/windowsDoors.ts` with actual Menards products
- **Email**: Configure SMTP in `.env.local` for email functionality
- **Pricing**: Default pricing is in `lib/pricing.ts`, editable via admin panel

## Troubleshooting

### Email not sending?
- Check `.env.local` has correct SMTP credentials
- Without credentials, quotes are logged to console (check terminal)

### 3D rendering not showing?
- Ensure browser supports WebGL
- Check browser console for errors

### Pricing not updating?
- Refresh the page after admin changes
- Check browser localStorage is enabled

## Next Steps

1. Update Menards color/product data
2. Customize styling to match brand
3. Test all features
4. Deploy to production

