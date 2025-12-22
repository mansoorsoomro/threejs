'use client';

import { useState } from 'react';
import { BuildingDesign, Opening } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';
import Building3D from '@/components/Building3D';

interface LeansAndOpeningsProps {
  design: BuildingDesign;
  onSubmit: (data: BuildingDesign) => void;
  onNext?: () => void;
}

// Opening types with images (from public/assets)
const openingTypes = [
  {
    id: 'framed-opening',
    name: 'Framed Opening',
    type: 'door' as const,
    imageSrc: '/assets/overhead_opening.png',
    defaultWidth: 8,
    defaultHeight: 8,
    price: 0,
  },
  {
    id: 'sliding-door',
    name: 'Sliding Door',
    type: 'door' as const,
    imageSrc: '/assets/sliding_door.png',
    defaultWidth: 12,
    defaultHeight: 10,
    price: 800,
  },
  {
    id: 'overhead-door',
    name: 'Overhead Door',
    type: 'door' as const,
    imageSrc: '/assets/overhead_door.png',
    defaultWidth: 12,
    defaultHeight: 12,
    price: 1200,
  },
  {
    id: 'dutch-door',
    name: 'Dutch Door',
    type: 'door' as const,
    imageSrc: '/assets/dutch_door.png',
    defaultWidth: 3,
    defaultHeight: 7,
    price: 600,
  },
  {
    id: 'window',
    name: 'Window',
    type: 'window' as const,
    imageSrc: '/assets/window.png',
    defaultWidth: 3,
    defaultHeight: 2,
    price: 200,
  },
  {
    id: 'service-door',
    name: 'Service Door',
    type: 'door' as const,
    imageSrc: '/assets/service_door.png',
    defaultWidth: 3,
    defaultHeight: 7,
    price: 450,
  },
  {
    id: 'double-door',
    name: 'Double Door',
    type: 'door' as const,
    imageSrc: '/assets/double_door.png',
    defaultWidth: 6,
    defaultHeight: 7,
    price: 900,
  },
  {
    id: 'patio-door',
    name: 'Patio Door',
    type: 'door' as const,
    imageSrc: '/assets/patio_door.png',
    defaultWidth: 6,
    defaultHeight: 7,
    price: 750,
  },
];

const walls = [
  { id: 'sidewallA', label: 'Sidewall A', value: 'front' as const },
  { id: 'endwallC', label: 'Endwall C', value: 'left' as const },
  { id: 'endwallD', label: 'Endwall D', value: 'right' as const },
  { id: 'sidewallB', label: 'Sidewall B', value: 'back' as const },
];

export default function LeansAndOpenings({ design, onSubmit, onNext }: LeansAndOpeningsProps) {
  const [selectedOpeningType, setSelectedOpeningType] = useState<string | null>(null);
  const [selectedWall, setSelectedWall] = useState<'front' | 'back' | 'left' | 'right'>('back');
  const [viewMode, setViewMode] = useState<'top' | '3d'>('top');
  const [showInfo, setShowInfo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const currentDesign = design;

  const handleAddOpening = (openingType: typeof openingTypes[0]) => {
    const newOpening: Opening = {
      id: `${openingType.id}-${Date.now()}`,
      type: openingType.type,
      x: 50, // Default center position
      y: 50,
      width: openingType.defaultWidth,
      height: openingType.defaultHeight,
      name: openingType.name,
      price: openingType.price,
      wall: selectedWall,
    };
    const currentOpenings = design.openings || [];
    onSubmit({ ...design, openings: [...currentOpenings, newOpening] });
  };

  const handleRemoveOpening = (id: string) => {
    const currentOpenings = design.openings || [];
    onSubmit({ ...design, openings: currentOpenings.filter(o => o.id !== id) });
  };

  const handlePositionChange = (id: string, x: number, y: number) => {
    const currentOpenings = design.openings || [];
    onSubmit({
      ...design,
      openings: currentOpenings.map(o =>
        o.id === id ? { ...o, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : o
      ),
    });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const totalPrice = calculatePrice({
    width: currentDesign.width,
    length: currentDesign.length,
    trussSpacing: currentDesign.trussSpacing,
    floorFinish: currentDesign.floorFinish,
    thickenedEdgeSlab: currentDesign.thickenedEdgeSlab,
    postConstructionSlab: currentDesign.postConstructionSlab,
    sidewallPosts: currentDesign.sidewallPosts,
    clearHeight: currentDesign.clearHeight,
    girtType: currentDesign.girtType,
    gradeBoard: currentDesign.gradeBoard,
    endWallOverhang: currentDesign.endWallOverhang,
    sidewallOverhang: currentDesign.sidewallOverhang,
    sitePreparation: currentDesign.sitePreparation,
    openings: (currentDesign.openings || []).map(o => ({
      id: o.id,
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
      price: o.price,
    })),
  });

  const infoSeed = `${currentDesign.width}-${currentDesign.length}-${currentDesign.clearHeight}-${currentDesign.trussSpacing}`;
  let infoHash = 0;
  for (let i = 0; i < infoSeed.length; i++) {
    infoHash = (infoHash * 31 + infoSeed.charCodeAt(i)) | 0;
  }
  const infoIdNumber = (Math.abs(infoHash) % 900000000000) + 100000000000;
  const designId = infoIdNumber.toString();
  const designName =
    currentDesign.buildingUse === 'agricultural'
      ? 'Post Frame Design'
      : currentDesign.buildingUse === 'residential'
        ? 'Residential Design'
        : 'Building Design';

  // Get wall dimensions for viewport
  const getWallDimensions = () => {
    if (selectedWall === 'front' || selectedWall === 'back') {
      return { width: design.width, height: design.length };
    } else {
      return { width: design.length, height: design.width };
    }
  };

  const wallDims = getWallDimensions();
  const wallOpenings = (design.openings || []).filter(o => o.wall === selectedWall);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full py-8">
        <div className="grid grid-cols-12 gap-[10px]">
          {/* Left Column - Opening Types */}
          <div className="bg-white rounded-lg shadow-md p-6 col-span-12 lg:col-span-4 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Choose An Opening Or Lean</h2>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
              >
                Info
              </button>
            </div>

            {showInfo && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
                <p className="font-semibold mb-2">How to add openings:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Select a wall using the tabs above the viewport</li>
                  <li>Click on an opening type below</li>
                  <li>Click on the wall in the viewport to place it</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pr-2">
              {openingTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedOpeningType(type.id);
                  }}
                  className={`p-3 border-2 rounded-lg transition-all ${selectedOpeningType === type.id
                    ? 'border-green-600 bg-green-50 ring-2 ring-green-300'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                >
                  <div className="mb-2 flex items-center justify-center">
                    <img
                      src={type.imageSrc}
                      alt={type.name}
                      className="w-20 h-16 object-contain"
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-900 text-center leading-tight">{type.name}</div>
                  {selectedOpeningType === type.id && (
                    <div className="text-xs text-green-600 font-semibold mt-1 text-center">Click on wall to place</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Building Details & Viewport */}
          <div className="bg-white rounded-lg shadow-md p-6 col-span-12 lg:col-span-8 flex flex-col">
            {/* Price Summary */}
            {totalPrice > 0 && (
              <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">
                  *Today&apos;s estimated price, future pricing may go up or down. Tax, labor, and delivery not included.
                </p>
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-lg font-semibold text-gray-700 mr-1">Building Price:</span>
                    <span className="text-3xl font-bold text-gray-900 align-baseline">
                      ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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
              </div>
            )}

            {/* View Tabs */}
            <div className="mb-4">
              <div className="flex space-x-2 border-b">
                <button
                  onClick={() => setViewMode('top')}
                  className={`px-4 py-2 font-semibold rounded-t transition-colors ${viewMode === 'top'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Top View
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-4 py-2 font-semibold rounded-t transition-colors ${viewMode === '3d'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  3D View
                </button>
              </div>
            </div>

            {/* Main Viewport */}
            <div className="flex-1 border-2 border-gray-300 rounded-lg relative overflow-hidden bg-gray-100">
              {viewMode === 'top' ? (
                <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
                  {/* Sidewall Navigation */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {walls.map(wall => (
                      <button
                        key={wall.id}
                        onClick={() => setSelectedWall(wall.value)}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${selectedWall === wall.value
                          ? 'bg-red-600 text-white border-b-2 border-red-800'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {wall.label}
                      </button>
                    ))}
                  </div>

                  {/* Wall Viewport */}
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-crosshair"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                      transformOrigin: 'center center',
                    }}
                    onClick={(e) => {
                      if (selectedOpeningType) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = ((e.clientX - rect.left - panX) / zoomLevel - (wallDims.width * 20) / 2) / (wallDims.width * 20) * 100 + 50;
                        const y = ((e.clientY - rect.top - panY) / zoomLevel - (wallDims.height * 20) / 2) / (wallDims.height * 20) * 100 + 50;
                        const openingType = openingTypes.find(t => t.id === selectedOpeningType);
                        if (openingType) {
                          const newOpening: Opening = {
                            id: `${openingType.id}-${Date.now()}`,
                            type: openingType.type,
                            x: Math.max(0, Math.min(100, x)),
                            y: Math.max(0, Math.min(100, y)),
                            width: openingType.defaultWidth,
                            height: openingType.defaultHeight,
                            name: openingType.name,
                            price: openingType.price,
                            wall: selectedWall,
                          };
                          const currentOpenings = design.openings || [];
                          onSubmit({ ...design, openings: [...currentOpenings, newOpening] });
                          setSelectedOpeningType(null);
                        }
                      }
                    }}
                  >
                    <div className="relative" style={{ width: `${wallDims.width * 20}px`, height: `${wallDims.height * 20}px` }}>
                      {/* Wall representation */}
                      <div className="absolute inset-0 bg-gradient-to-b from-gray-600 to-gray-400 rounded border-2 border-gray-800">
                        {/* Top section (darker) */}
                        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gray-700 rounded-t"></div>
                        {/* Bottom section (lighter) */}
                        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gray-400 rounded-b"></div>
                      </div>

                      {/* Openings on this wall */}
                      {wallOpenings.map(opening => {
                        const x = (opening.x / 100) * wallDims.width * 20;
                        const y = (opening.y / 100) * wallDims.height * 20;
                        const width = opening.width * 20;
                        const height = opening.height * 20;

                        return (
                          <div
                            key={opening.id}
                            className="absolute border-2 border-blue-600 bg-blue-200 bg-opacity-50 rounded cursor-move"
                            style={{
                              left: `${x - width / 2}px`,
                              top: `${y - height / 2}px`,
                              width: `${width}px`,
                              height: `${height}px`,
                            }}
                            title={opening.name}
                          >
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-900">
                              {opening.name.split(' ')[0]}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOpening(opening.id);
                              }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dimension label */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded border border-gray-300 text-sm font-semibold">
                    {wallDims.width}&apos; 0&quot;
                  </div>

                  {/* Viewport Controls */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-10">
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded flex items-center gap-1"
                    >
                      <span>ℹ️</span> Information
                    </button>
                    <button
                      onClick={handleZoomIn}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    >
                      <span>🔍+</span> Zoom In
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    >
                      <span>🔍-</span> Zoom Out
                    </button>
                    <button
                      onClick={handleResetView}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                    >
                      <span>↻</span> Reset View
                    </button>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => {
                      const currentIndex = walls.findIndex(w => w.value === selectedWall);
                      const prevIndex = (currentIndex - 1 + walls.length) % walls.length;
                      setSelectedWall(walls[prevIndex].value);
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
                  >
                    <span className="text-2xl">‹</span>
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = walls.findIndex(w => w.value === selectedWall);
                      const nextIndex = (currentIndex + 1) % walls.length;
                      setSelectedWall(walls[nextIndex].value);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
                  >
                    <span className="text-2xl">›</span>
                  </button>
                </div>
              ) : (
                <div className="w-full h-full" style={{ minHeight: '400px' }}>
                  <Building3D design={currentDesign} />
                </div>
              )}
            </div>

            {/* Bottom actions (Next button) */}
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
                  Next: Summary
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
