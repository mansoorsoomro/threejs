'use client';

import { BuildingDesign } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';
import { wallColors, trimColors, roofColors } from '@/data/menardsColors';
import FloorPlan from '@/components/FloorPlan';

interface BuildingSummaryProps {
  design: BuildingDesign;
  onNext?: () => void;
}

interface Accessories {
  eaveLightA?: string;
  eaveLightB?: string;
  wallInsulation?: string;
  interiorWallLiner?: string;
  ceilingInsulation?: string;
  ceilingLiner?: string;
  ridgeVentilation?: string;
  gableVents?: string;
  ridgeOptions?: string;
  gutters?: string;
  endCaps?: string;
  snowGuards?: string;
  skylights?: string;
  cupolas?: string;
  roofCondensation?: string;
  outsideClosure?: string;
  wallCondensation?: string;
  gableAccent?: string;
}

export default function BuildingSummary({ design, onNext }: BuildingSummaryProps) {
  // use design prop instead of localStorage
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
  });

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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Building Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Building Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Building Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Width:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.width} ft</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Length:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.length} ft</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Truss Spacing:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.trussSpacing} ft</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Floor Finish:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{getFloorFinishLabel()}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Inside Clear Height:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.clearHeight} ft</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Exterior Wall Panel:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Pro-Rib</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Exterior Wall Color:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{getWallColorLabel()}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Roof Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Pro-Rib</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Roof Color:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{getRoofColorLabel()}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Trim Color:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{getTrimColorLabel()}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Sidewall Posts:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.sidewallPosts}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Gradeboard Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{getGradeBoardLabel()}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Girt Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{getGirtTypeLabel()}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Endwall Overhangs:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.endWallOverhang} ft</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Sidewall Overhangs:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.sidewallOverhang} ft</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Post Embedment Depth:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">4 ft</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Footing Pad Size:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">14 in x 4 in (Pre-cast)</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Mini Print:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Email Only</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Wall Fastener Location:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">In the Flat</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Roof Fastener Location:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">On the Rib</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Building Use:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 capitalize">{design.buildingUse}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Pitch:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{design.roofPitch || '4/12'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Framing Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Post Framing</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accessories */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Sidewall A Eave Light:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.eaveLightA || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Sidewall B Eave Light:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.eaveLightB || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Wall Insulation Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.wallInsulation || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Wall Liner Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.interiorWallLiner || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Ceiling Insulation Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.ceilingInsulation || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Ceiling Liner Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.ceilingLiner || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Ridge Vent Quantity:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.ridgeVentilation || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Gable Vent Type:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.gableVents || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Ridge Options:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.ridgeOptions || 'Universal Ridge Cap'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Gutters:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.gutters || 'No'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">End Cap:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.endCaps || 'No'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Snow Guard:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.snowGuards || 'No'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Skylight Size:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.skylights || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Cupola Size:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.cupolas || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Roof Condensation Control:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.roofCondensation || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Outside Closure Strip:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.outsideClosure || 'Standard'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Wall Condensation Control:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.wallCondensation || 'None'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Gable Accent:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{accessories.gableAccent ? 'Yes' : 'No'}</span>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price & Floor Plan */}
            <div className="lg:col-span-3 space-y-6">
              {/* Building Price */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-500 mb-2">
                  *Today&apos;s estimated price, future pricing may go up or down. Tax, labor, and delivery not included.
                </p>
                <div className="mb-4">
                  <span className="text-lg font-semibold text-gray-700 mr-1">Building Price:</span>
                  <span className="text-3xl font-bold text-gray-900 align-baseline">
                    ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-base font-semibold text-gray-900">
                    Design Id: <span className="font-normal">{designId}</span>
                  </p>
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  Design Name: <span className="font-normal">{designName}</span>
                </p>
              </div>

              {/* Floor Plan */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <FloorPlan design={design} />
              </div>
            </div>
          </div>

          {/* Next Button */}
          {onNext && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (onNext) {
                    onNext();
                  }
                }}
                className="px-6 py-2 rounded-md font-semibold text-white transition-colors bg-green-600 hover:bg-green-700"
              >
                Next: Delivery
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
