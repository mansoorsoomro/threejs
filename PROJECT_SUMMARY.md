# Coupe Building Designer - Project Summary

## Overview
A comprehensive building design application with real-time 3D visualization, floor plan generation, and instant pricing calculations.

## Features Implemented

### 1. Building Design Form
- ✅ Client Name & Address
- ✅ Building Use (Residential, Storage, Agricultural, Barndominium)
- ✅ Building Width (20'-60', even numbers only)
- ✅ Building Length (20'-200', even numbers only)
- ✅ Truss Spacing (4', 6', 8')
- ✅ Floor Finish (Dirt/Gravel, Concrete)
- ✅ Additional Services:
  - Site Preparation
  - Thickened Edge Slab
  - Post Construction Slab
- ✅ Sidewall Posts (4x6, 6x6, Columns)
- ✅ Inside Clear Height (8', 10', 12', 14', 16', 18', 20')
- ✅ Girt Type (2x4, 2x6)
- ✅ Grade Board Type (2x6, 2x8)
- ✅ Wall Colors (Menards options)
- ✅ Trim Colors (Menards options)
- ✅ Roof Colors (Menards options)
- ✅ End Wall Overhang (0', 1', 2')
- ✅ Sidewall Overhang (0', 1', 2')
- ✅ Window and Door Opening Selection
- ✅ Window and Door Placement (with position controls)

### 2. Visualizations
- ✅ **Floor Plan**: Interactive SVG-based floor plan showing building dimensions and openings
- ✅ **3D Rendering**: Three.js-powered 3D visualization with:
  - Interactive camera controls (click and drag to rotate, scroll to zoom)
  - Real-time color updates
  - Building structure visualization
- ✅ **Building Information Sheet**: Comprehensive summary with instant pricing

### 3. Pricing System
- ✅ Real-time price calculations as options change
- ✅ Configurable pricing for:
  - Base price per sq ft
  - Truss spacing multipliers
  - Floor finish options
  - Additional services (sqft, linft, unit prices)
  - Structural components
  - Height multipliers
  - Overhangs
- ✅ Admin panel for internal pricing management
- ✅ Pricing stored in localStorage (can be migrated to database)

### 4. PDF Generation
- ✅ Complete building information
- ✅ All specifications
- ✅ Pricing breakdown
- ✅ Professional formatting

### 5. Email Submission
- ✅ PDF attachment
- ✅ Email to sales@coupebuildingco.com
- ✅ Client information included
- ✅ Configurable SMTP settings

### 6. Admin Panel
- ✅ Accessible at `/admin`
- ✅ Edit all pricing parameters
- ✅ Save/Reset functionality
- ✅ Real-time updates

## Project Structure

```
threejs/
├── app/
│   ├── api/
│   │   └── submit-quote/
│   │       └── route.ts          # API endpoint for quote submission
│   ├── admin/
│   │   └── page.tsx              # Admin pricing panel
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main design page
├── components/
│   ├── BuildingForm.tsx          # Main form component
│   ├── Building3D.tsx            # 3D rendering component
│   ├── BuildingInfoSheet.tsx     # Information and pricing display
│   ├── FloorPlan.tsx             # Floor plan visualization
│   └── OpeningPlacement.tsx      # Window/door placement tool
├── data/
│   ├── menardsColors.ts          # Color options (update with actual Menards colors)
│   └── windowsDoors.ts            # Window and door options
├── lib/
│   ├── pdfGenerator.ts           # PDF generation utility
│   └── pricing.ts                # Pricing calculation logic
├── types/
│   └── building.ts               # TypeScript type definitions
└── package.json                  # Dependencies
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Email (Optional)**
   - Create `.env.local` file
   - Add SMTP credentials (see ENV_SETUP.md)
   - If not configured, quotes will be logged to console

3. **Update Menards Colors**
   - Edit `data/menardsColors.ts`
   - Replace placeholder colors with actual Menards color codes from their website
   - Update hex values to match Menards color palette

4. **Update Window/Door Options**
   - Edit `data/windowsDoors.ts`
   - Add actual Menards window and door options
   - Update pricing to match current Menards prices

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - Main app: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## Important Notes

### Menards Integration
- The color options in `data/menardsColors.ts` are placeholders
- **Action Required**: Update with actual Menards color codes from their reference website
- Window and door options in `data/windowsDoors.ts` should also be updated with actual Menards products

### Pricing
- Default pricing is set in `lib/pricing.ts`
- Admin can modify pricing via `/admin` panel
- Pricing is stored in browser localStorage (consider database for production)

### Email Configuration
- Email functionality requires SMTP credentials
- Without credentials, quotes are logged to console for testing
- See `ENV_SETUP.md` for configuration details

### Production Considerations
1. **Database**: Consider migrating pricing storage to a database
2. **Authentication**: Add authentication for admin panel
3. **File Storage**: Consider storing PDFs in cloud storage (S3, etc.)
4. **Email Service**: Consider using a service like SendGrid or AWS SES
5. **Image Capture**: Enhance PDF to include actual floor plan and 3D rendering screenshots
6. **Validation**: Add server-side validation for form submissions

## Next Steps

1. Update Menards color and product data
2. Configure email settings
3. Test all functionality
4. Customize styling/branding
5. Deploy to production

## Technologies Used

- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **Three.js**: 3D rendering
- **React Hook Form**: Form management
- **jsPDF**: PDF generation
- **Nodemailer**: Email sending
- **Tailwind CSS**: Styling

