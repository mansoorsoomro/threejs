'use client';

import { BuildingDesign } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';

interface BuildingInfoSheetProps {
  design: BuildingDesign;
}

export default function BuildingInfoSheet({ design }: BuildingInfoSheetProps) {
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
    openings: (design.openings || []).map(o => ({
      id: o.id,
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
      price: o.price,
    })),
  });

  const sqft = design.width * design.length;
  const perimeter = (design.width + design.length) * 2;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold mb-4">Building Information Sheet</h3>
      
      <div className="space-y-4">
        {/* Client Info */}
        <div className="border-b pb-4">
          <h4 className="font-semibold text-lg mb-2">Client Information</h4>
          <p><strong>Name:</strong> {design.clientName}</p>
          <p><strong>Address:</strong> {design.clientAddress}</p>
        </div>

        {/* Building Specifications */}
        <div className="border-b pb-4">
          <h4 className="font-semibold text-lg mb-2">Building Specifications</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Building Use:</strong> {design.buildingUse.charAt(0).toUpperCase() + design.buildingUse.slice(1)}</p>
              <p><strong>Dimensions:</strong> {design.width}' W × {design.length}' L</p>
              <p><strong>Total Area:</strong> {sqft} sq ft</p>
              <p><strong>Perimeter:</strong> {perimeter} linear ft</p>
            </div>
            <div>
              <p><strong>Truss Spacing:</strong> {design.trussSpacing}'</p>
              <p><strong>Clear Height:</strong> {design.clearHeight}'</p>
              <p><strong>Floor Finish:</strong> {design.floorFinish === 'concrete' ? 'Concrete' : 'Dirt/Gravel'}</p>
            </div>
          </div>
        </div>

        {/* Structural Details */}
        <div className="border-b pb-4">
          <h4 className="font-semibold text-lg mb-2">Structural Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Sidewall Posts:</strong> {design.sidewallPosts}</p>
              <p><strong>Girt Type:</strong> {design.girtType}</p>
              <p><strong>Grade Board:</strong> {design.gradeBoard}</p>
            </div>
            <div>
              <p><strong>End Wall Overhang:</strong> {design.endWallOverhang}'</p>
              <p><strong>Sidewall Overhang:</strong> {design.sidewallOverhang}'</p>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="border-b pb-4">
          <h4 className="font-semibold text-lg mb-2">Colors</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p><strong>Wall:</strong> {design.wallColor.charAt(0).toUpperCase() + design.wallColor.slice(1)}</p>
            </div>
            <div>
              <p><strong>Trim:</strong> {design.trimColor.charAt(0).toUpperCase() + design.trimColor.slice(1)}</p>
            </div>
            <div>
              <p><strong>Roof:</strong> {design.roofColor.charAt(0).toUpperCase() + design.roofColor.slice(1)}</p>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="border-b pb-4">
          <h4 className="font-semibold text-lg mb-2">Additional Services</h4>
          <ul className="list-disc list-inside">
            {design.sitePreparation && <li>Site Preparation</li>}
            {design.thickenedEdgeSlab && <li>Thickened Edge Slab</li>}
            {design.postConstructionSlab && <li>Post Construction Slab</li>}
            {!design.sitePreparation && !design.thickenedEdgeSlab && !design.postConstructionSlab && (
              <li className="text-gray-500">None</li>
            )}
          </ul>
        </div>

        {/* Openings */}
        {design.openings && design.openings.length > 0 && (
          <div className="border-b pb-4">
            <h4 className="font-semibold text-lg mb-2">Windows & Doors</h4>
            <ul className="list-disc list-inside">
              {design.openings.map(opening => (
                <li key={opening.id}>
                  {opening.name} - {opening.wall} wall - ${opening.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-xl mb-2">Total Estimated Price</h4>
          <p className="text-3xl font-bold text-blue-600">${totalPrice.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Price per sq ft: ${(totalPrice / sqft).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

