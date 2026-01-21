'use client';

import { useState } from 'react';
import { BuildingDesign } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';
import { useAppSelector } from '@/lib/store/hooks';
import { wallColors, trimColors, roofColors } from '@/data/buildingColors';
import FloorPlan from '@/components/FloorPlan';
import Footer from './Footer';

interface BuildingSummaryProps {
  design: BuildingDesign;
  onNext?: () => void;
  onBack?: () => void;
}

export default function BuildingSummary({ design, onNext, onBack }: BuildingSummaryProps) {
  const pricingConfig = useAppSelector((state) => state.pricing.config);
  const accessories = design;

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
  }, pricingConfig);

  const infoSeed = `${design.width}-${design.length}-${design.clearHeight}-${design.trussSpacing}`;
  let infoHash = 0;
  for (let i = 0; i < infoSeed.length; i++) {
    infoHash = (infoHash * 31 + infoSeed.charCodeAt(i)) | 0;
  }
  const infoIdNumber = (Math.abs(infoHash) % 900000000000) + 100000000000;
  const designId = infoIdNumber.toString();
  const designName =
    design.buildingUse === 'agricultural'
      ? 'Post Frame Design'
      : design.buildingUse === 'residential'
        ? 'Residential Design'
        : 'Building Design';

  const getWallColorLabel = () => {
    const color = wallColors.find(c => c.value === design.wallColor);
    return color?.label || design.wallColor;
  };

  const getRoofColorLabel = () => {
    const color = roofColors.find(c => c.value === design.roofColor);
    return color?.label || design.roofColor;
  };

  const getTrimColorLabel = () => {
    const color = trimColors.find(c => c.value === design.trimColor);
    return color?.label || design.trimColor;
  };

  const getGradeBoardLabel = () => {
    if (design.gradeBoard === '2x6') return '2x6 Treated Gradeboard';
    if (design.gradeBoard === '2x8') return '2x8 Treated Gradeboard';
    return design.gradeBoard;
  };

  const getGirtTypeLabel = () => {
    if (design.girtType === 'flat') return 'Flat Girts';
    if (design.girtType === 'bookshelf') return 'Bookshelf Girts';
    if (design.girtType === 'double') return 'Double Girts';
    return design.girtType || 'Flat Girts';
  };

  const getFloorFinishLabel = () => {
    if (design.floorFinish === 'dirt-gravel') return 'Dirt / Gravel';
    if (design.floorFinish === 'concrete') return 'Concrete';
    return design.floorFinish;
  };


  return (
    <div className="min-h-screen bg-cream-200">
      <div className="w-full py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Building Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Building Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-brown-900 mb-4">Building Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Width:</span>
                    <span className="text-sm font-semibold text-brown-900">{design.width} ft</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Length:</span>
                    <span className="text-sm font-semibold text-brown-900">{design.length} ft</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Truss Spacing:</span>
                    <span className="text-sm font-semibold text-brown-900">{design.trussSpacing} ft</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Floor Finish:</span>
                    <span className="text-sm font-semibold text-brown-900">{getFloorFinishLabel()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Inside Clear Height:</span>
                    <span className="text-sm font-semibold text-brown-900">{design.clearHeight} ft</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Exterior Wall Color:</span>
                    <span className="text-sm font-semibold text-brown-900">{getWallColorLabel()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Roof Color:</span>
                    <span className="text-sm font-semibold text-brown-900">{getRoofColorLabel()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Trim Color:</span>
                    <span className="text-sm font-semibold text-brown-900">{getTrimColorLabel()}</span>
                  </div>
                </div>
              </div>

              {/* Accessories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-brown-900 mb-4">Accessories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Sidewall A Eave Light:</span>
                    <span className="text-sm font-semibold text-brown-900">{accessories.eaveLightA || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Sidewall B Eave Light:</span>
                    <span className="text-sm font-semibold text-brown-900">{accessories.eaveLightB || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Wall Insulation:</span>
                    <span className="text-sm font-semibold text-brown-900">{accessories.wallInsulation || 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brown-700">Roof Insulation:</span>
                    <span className="text-sm font-semibold text-brown-900">{accessories.ceilingInsulation || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price & Floor Plan */}
            <div className="lg:col-span-3 space-y-6">
              {/* Building Price */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-brown-400 mb-2">
                  *Today&apos;s estimated price, future pricing may go up or down. Tax, labor, and delivery not included.
                </p>
                <div className="mb-4">
                  <span className="text-lg font-semibold text-brown-700 mr-1">Building Price:</span>
                  <span className="text-3xl font-bold text-brown-900 align-baseline">
                    ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-base font-semibold text-brown-900">
                  Design Id: <span className="font-normal">{designId}</span>
                </p>
                <p className="text-base font-semibold text-brown-900">
                  Design Name: <span className="font-normal">{designName}</span>
                </p>
              </div>

              {/* Floor Plan */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <FloorPlan design={design} />
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="mt-8 border-t border-brown-200 pt-8">
            <Footer
              onBack={onBack}
              onContinue={onNext}
              isContinueDisabled={!onNext}
              continueLabel="Continue to Final Quote Request"
              showContinue={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
