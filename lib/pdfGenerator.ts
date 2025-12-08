import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BuildingDesign } from '@/types/building';
import { calculatePrice } from './pricing';

export async function generatePDF(design: BuildingDesign): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Title
  pdf.setFontSize(20);
  pdf.text('Coupe Building Company', margin, yPos);
  yPos += 10;

  pdf.setFontSize(16);
  pdf.text('Building Quote & Design', margin, yPos);
  yPos += 15;

  // Client Information
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Client Information', margin, yPos);
  yPos += 7;

  pdf.setFont(undefined, 'normal');
  pdf.text(`Name: ${design.clientName}`, margin, yPos);
  yPos += 6;
  pdf.text(`Address: ${design.clientAddress}`, margin, yPos);
  yPos += 10;

  // Building Specifications
  pdf.setFont(undefined, 'bold');
  pdf.text('Building Specifications', margin, yPos);
  yPos += 7;

  pdf.setFont(undefined, 'normal');
  const sqft = design.width * design.length;
  const perimeter = (design.width + design.length) * 2;
  
  pdf.text(`Building Use: ${design.buildingUse.charAt(0).toUpperCase() + design.buildingUse.slice(1)}`, margin, yPos);
  yPos += 6;
  pdf.text(`Dimensions: ${design.width}' W × ${design.length}' L`, margin, yPos);
  yPos += 6;
  pdf.text(`Total Area: ${sqft} sq ft`, margin, yPos);
  yPos += 6;
  pdf.text(`Perimeter: ${perimeter} linear ft`, margin, yPos);
  yPos += 6;
  pdf.text(`Truss Spacing: ${design.trussSpacing}'`, margin, yPos);
  yPos += 6;
  pdf.text(`Clear Height: ${design.clearHeight}'`, margin, yPos);
  yPos += 6;
  pdf.text(`Floor Finish: ${design.floorFinish === 'concrete' ? 'Concrete' : 'Dirt/Gravel'}`, margin, yPos);
  yPos += 10;

  // Structural Details
  pdf.setFont(undefined, 'bold');
  pdf.text('Structural Details', margin, yPos);
  yPos += 7;

  pdf.setFont(undefined, 'normal');
  pdf.text(`Sidewall Posts: ${design.sidewallPosts}`, margin, yPos);
  yPos += 6;
  pdf.text(`Girt Type: ${design.girtType}`, margin, yPos);
  yPos += 6;
  pdf.text(`Grade Board: ${design.gradeBoard}`, margin, yPos);
  yPos += 6;
  pdf.text(`End Wall Overhang: ${design.endWallOverhang}'`, margin, yPos);
  yPos += 6;
  pdf.text(`Sidewall Overhang: ${design.sidewallOverhang}'`, margin, yPos);
  yPos += 10;

  // Colors
  pdf.setFont(undefined, 'bold');
  pdf.text('Colors', margin, yPos);
  yPos += 7;

  pdf.setFont(undefined, 'normal');
  pdf.text(`Wall: ${design.wallColor.charAt(0).toUpperCase() + design.wallColor.slice(1)}`, margin, yPos);
  yPos += 6;
  pdf.text(`Trim: ${design.trimColor.charAt(0).toUpperCase() + design.trimColor.slice(1)}`, margin, yPos);
  yPos += 6;
  pdf.text(`Roof: ${design.roofColor.charAt(0).toUpperCase() + design.roofColor.slice(1)}`, margin, yPos);
  yPos += 10;

  // Additional Services
  pdf.setFont(undefined, 'bold');
  pdf.text('Additional Services', margin, yPos);
  yPos += 7;

  pdf.setFont(undefined, 'normal');
  if (design.sitePreparation) {
    pdf.text('• Site Preparation', margin, yPos);
    yPos += 6;
  }
  if (design.thickenedEdgeSlab) {
    pdf.text('• Thickened Edge Slab', margin, yPos);
    yPos += 6;
  }
  if (design.postConstructionSlab) {
    pdf.text('• Post Construction Slab', margin, yPos);
    yPos += 6;
  }
  if (!design.sitePreparation && !design.thickenedEdgeSlab && !design.postConstructionSlab) {
    pdf.text('None', margin, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Windows & Doors
  if (design.openings.length > 0) {
    pdf.setFont(undefined, 'bold');
    pdf.text('Windows & Doors', margin, yPos);
    yPos += 7;

    pdf.setFont(undefined, 'normal');
    design.openings.forEach(opening => {
      pdf.text(`• ${opening.name} - ${opening.wall} wall - $${opening.price}`, margin, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  // Pricing
  const totalPrice = calculatePrice({
    width: design.width,
    length: design.length,
    trussSpacing: design.trussSpacing,
    floorFinish: design.floorFinish,
    thickenedEdgeSlab: design.thickenedEdgeSlab,
    postConstructionSlab: design.postConstructionSlab,
    sidewallPosts: design.sidewallPosts,
    clearHeight: design.clearHeight,
    girtType: design.girtType,
    gradeBoard: design.gradeBoard,
    endWallOverhang: design.endWallOverhang,
    sidewallOverhang: design.sidewallOverhang,
    sitePreparation: design.sitePreparation,
    openings: design.openings.map(o => ({
      id: o.id,
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
      price: o.price,
    })),
  });

  pdf.setFont(undefined, 'bold');
  pdf.setFontSize(14);
  pdf.text('Total Estimated Price', margin, yPos);
  yPos += 8;

  pdf.setFontSize(18);
  pdf.text(`$${totalPrice.toLocaleString()}`, margin, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Price per sq ft: $${(totalPrice / sqft).toFixed(2)}`, margin, yPos);
  yPos += 10;

  // Footer
  pdf.setFontSize(8);
  pdf.text('This is a preliminary quote. A sales representative will contact you to finalize details.', margin, pageHeight - 15);

  // Return PDF as blob
  return pdf.output('blob');
}

