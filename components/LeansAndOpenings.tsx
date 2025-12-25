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
  { id: 'sidewallB', label: 'Sidewall B', value: 'back' as const },
  { id: 'endwallC', label: 'Endwall C', value: 'left' as const },
  { id: 'endwallD', label: 'Endwall D', value: 'right' as const },
];

export default function LeansAndOpenings({ design, onSubmit, onNext }: LeansAndOpeningsProps) {
  const [selectedOpeningId, setSelectedOpeningId] = useState<string | null>(null);
  const [selectedOpeningType, setSelectedOpeningType] = useState<string | null>(null);
  const [selectedWall, setSelectedWall] = useState<'front' | 'back' | 'left' | 'right'>('back');
  const [viewMode, setViewMode] = useState<'top' | '3d'>('top');
  const [showInfo, setShowInfo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const currentDesign = design;

  // Get wall dimensions for viewport
  const getWallDimensions = (wall: string) => {
    const height = parseFloat(currentDesign.clearHeight) || 12;
    if (wall === 'front' || wall === 'back') {
      // Sidewalls (A/B) typically correspond to the building Length
      return { width: design.length, height };
    } else {
      // Endwalls (C/D) typically correspond to the building Width
      return { width: design.width, height };
    }
  };

  // Helper to add opening immediately
  const handleImmediateAddOpening = (openingType: typeof openingTypes[0]) => {
    const newId = `${openingType.id}-${Date.now()}`;
    const wallDims = getWallDimensions(selectedWall);

    // Calculate defaults
    let defaultY = 50; // Center default (for windows)

    // If it's a door, place it at the bottom (floor level)
    if (openingType.type === 'door') {
      // y is center position in %. 
      // We want bottom of opening to be at 100% of wall.
      // Bottom = y + (height/2 converted to %)
      // 100 = y + (openingHeight/2 / wallHeight * 100)
      // y = 100 - (openingHeight/2 / wallHeight * 100)
      const halfHeightPercent = (openingType.defaultHeight / 2 / wallDims.height) * 100;
      defaultY = 100 - halfHeightPercent;
    }

    const newOpening: Opening = {
      id: newId,
      type: openingType.type,
      x: 50, // Center X
      y: Math.max(0, Math.min(100, defaultY)),
      width: openingType.defaultWidth,
      height: openingType.defaultHeight,
      name: openingType.name,
      price: openingType.price,
      wall: selectedWall,
    };
    const currentOpenings = design.openings || [];
    onSubmit({ ...design, openings: [...currentOpenings, newOpening] });
    setSelectedOpeningId(newId);
    setSelectedOpeningType(openingType.id);
    setViewMode('top'); // Auto-switch to 2D view logic
  };

  const handleUpdateOpening = (id: string, updates: Partial<Opening>) => {
    const currentOpenings = design.openings || [];
    const openingIndex = currentOpenings.findIndex(o => o.id === id);
    if (openingIndex === -1) return;

    const oldOpening = currentOpenings[openingIndex];
    // Merge updates to check potentially new dimensions
    const newOpening = { ...oldOpening, ...updates };

    // Get wall dimensions for this opening's wall
    const wallDims = getWallDimensions(newOpening.wall);

    // 1. Clamp dimensions to wall size
    const constrainedWidth = Math.min(newOpening.width, wallDims.width);
    const constrainedHeight = Math.min(newOpening.height, wallDims.height);

    // 2. Calculate constraints (percentage based)
    // X axis (Center position)
    const halfWidthPercent = (constrainedWidth / 2 / wallDims.width) * 100;
    const minX = halfWidthPercent;
    const maxX = 100 - halfWidthPercent;

    // Y axis (Center position, 0 is top)
    const halfHeightPercent = (constrainedHeight / 2 / wallDims.height) * 100;
    const minY = halfHeightPercent;
    const maxY = 100 - halfHeightPercent;

    // 3. Apply constraints if x or y or dimensions are changing
    // We re-calculate and clamp based on the "intended" new values
    let constrainedX = newOpening.x;
    let constrainedY = newOpening.y;

    // Check if X is likely changing or if dimensions changed which necessitates a check
    // We just clamp regardless to be safe
    // If minX > maxX (shouldn't happen due to width clamp), handle gracefully
    if (minX > maxX) {
      constrainedX = 50;
    } else {
      constrainedX = Math.max(minX, Math.min(maxX, constrainedX));
    }

    if (minY > maxY) {
      constrainedY = 50;
    } else {
      constrainedY = Math.max(minY, Math.min(maxY, constrainedY));
    }

    // Prepare final object
    const finalOpening = {
      ...newOpening,
      width: constrainedWidth,
      height: constrainedHeight,
      x: constrainedX,
      y: constrainedY
    };

    const newOpenings = [...currentOpenings];
    newOpenings[openingIndex] = finalOpening;

    onSubmit({
      ...design,
      openings: newOpenings,
    });
  };

  const handleRemoveOpening = (id: string) => {
    const currentOpenings = design.openings || [];
    onSubmit({ ...design, openings: currentOpenings.filter(o => o.id !== id) });
    if (selectedOpeningId === id) setSelectedOpeningId(null);
  };

  const handleCopyOpening = (opening: Opening) => {
    const newId = `${opening.type}-${Date.now()}`;
    const newOpening = { ...opening, id: newId, x: opening.x + 5, y: opening.y + 5 }; // Offset slightly
    const currentOpenings = design.openings || [];
    onSubmit({ ...design, openings: [...currentOpenings, newOpening] });
    setSelectedOpeningId(newId);
  };

  const handleCenterOpening = (id: string) => {
    handleUpdateOpening(id, { x: 50 });
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

  const wallDims = getWallDimensions(selectedWall);
  const wallOpenings = (design.openings || []).filter(o => o.wall === selectedWall);

  // Find currently selected opening object
  const selectedOpening = (design.openings || []).find(o => o.id === selectedOpeningId);

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
                  <li>Click on an opening type below to add it to the center of the wall</li>
                  <li>Use the controls to position and resize the selected opening</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pr-2">
              {openingTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleImmediateAddOpening(type)}
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

            {/* Edit Panel - Only visible when an opening is selected */}
            {selectedOpening && (
              <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span>✏️</span> Edit Selected {selectedOpening.name}
                  </h3>
                  <button
                    onClick={() => setSelectedOpeningId(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (W x H)</label>
                    <select
                      value={`${selectedOpening.width}x${selectedOpening.height}`}
                      onChange={(e) => {
                        const [w, h] = e.target.value.split('x').map(Number);
                        handleUpdateOpening(selectedOpening.id, { width: w, height: h });
                      }}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 py-2"
                    >
                      <option value={`${selectedOpening.width}x${selectedOpening.height}`}>{selectedOpening.width}&apos; x {selectedOpening.height}&apos;</option>
                      <option value="3x3">3&apos; x 3&apos;</option>
                      <option value="4x4">4&apos; x 4&apos;</option>
                      <option value="6x7">6&apos; x 7&apos;</option>
                      <option value="8x7">8&apos; x 7&apos;</option>
                      <option value="9x7">9&apos; x 7&apos;</option>
                      <option value="10x8">10&apos; x 8&apos;</option>
                      <option value="10x10">10&apos; x 10&apos;</option>
                      <option value="12x12">12&apos; x 12&apos;</option>
                      <option value="16x14">16&apos; x 14&apos;</option>
                    </select>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position From Left</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={Math.round((selectedOpening.x / 100) * wallDims.width)}
                          onChange={(e) => {
                            const feet = parseInt(e.target.value) || 0;
                            const newX = (feet / wallDims.width) * 100;
                            handleUpdateOpening(selectedOpening.id, { x: Math.max(0, Math.min(100, newX)) });
                          }}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 py-2 pl-3 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">ft</span>
                      </div>
                      <div className="relative w-24">
                        <input
                          type="number"
                          value={0}
                          disabled
                          className="w-full bg-gray-100 border-gray-300 rounded-md py-2 px-2 text-gray-500 pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">in</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex gap-2 mt-2">
                    <button
                      onClick={() => handleCopyOpening(selectedOpening)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleCenterOpening(selectedOpening.id)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors"
                    >
                      Center
                    </button>
                    <button
                      onClick={() => handleRemoveOpening(selectedOpening.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode Tabs (2D vs 3D) */}
            <div className="mb-0 flex gap-1 z-10 w-fit rounded-t-lg overflow-hidden border-t border-l border-r border-gray-300 bg-gray-100 border-b-0">
              <button
                onClick={() => setViewMode('top')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${viewMode === 'top'
                  ? 'bg-white text-gray-900 border-b-2 border-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-b border-gray-300'}`}
              >
                2D Sidewall View
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${viewMode === '3d'
                  ? 'bg-white text-gray-900 border-b-2 border-green-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-b border-gray-300'}`}
              >
                3D Preview
              </button>
            </div>

            {/* Combined Viewport Area */}
            <div className="flex-1 flex flex-col gap-4 border-2 border-gray-300 rounded-b-lg rounded-tr-lg p-0 bg-white overflow-hidden mt-[-1px]">

              {/* 2D View (Elevation) */}
              {viewMode === 'top' && (
                <div className="relative w-full h-[500px] bg-gray-100 group animate-in fade-in">

                  {/* Sidewall Navigation */}
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {walls.map(wall => (
                      <button
                        key={wall.id}
                        onClick={() => setSelectedWall(wall.value)}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-colors shadow-sm ${selectedWall === wall.value
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
                    className="absolute inset-0 flex items-center justify-center cursor-crosshair overflow-hidden"
                    style={{
                      transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                      transformOrigin: 'center center',
                    }}
                    onMouseDown={(e) => {
                      if (e.target === e.currentTarget) {
                        // Background click logic if needed
                      }
                    }}
                  >
                    <div className="relative shadow-2xl" style={{ width: `${wallDims.width * 20}px`, height: `${wallDims.height * 20}px` }}>
                      {/* Wall representation - Conditional Styles */}
                      {/* Sidewall (A/B) - Two Tone */}
                      {(selectedWall === 'front' || selectedWall === 'back') && (
                        <div className="absolute inset-0 border-2 border-black box-border z-0"
                          style={{
                            background: 'linear-gradient(to bottom, #595959 30%, #e5e7eb 30%)'
                          }}
                        >
                          {/* Siding Texture Hint */}
                          <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)' }}
                          ></div>
                          <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-gray-400 opacity-50"></div>
                        </div>
                      )}

                      {/* Endwall (C/D) - Gabled */}
                      {(selectedWall === 'left' || selectedWall === 'right') && (() => {
                        // Calculate Gable Height
                        const pitchParts = (currentDesign.roofPitch || '4/12').split('/');
                        const rise = parseFloat(pitchParts[0]) || 4;
                        const run = parseFloat(pitchParts[1]) || 12;
                        const roofRatio = rise / run;
                        const extraHeightFt = (wallDims.width / 2) * roofRatio;
                        const extraHeightPx = extraHeightFt * 20;

                        return (
                          <>
                            {/* Gable Triangle on Top */}
                            <div
                              className="absolute left-0 right-0 z-0"
                              style={{
                                bottom: '100%',
                                height: `${extraHeightPx}px`,
                                // Create triangle using clip-path or transparent borders
                                // Clip path is easier for texturing
                                width: '100%',
                                backgroundColor: '#e5e7eb',
                                clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
                                borderBottom: '2px solid #000'
                              }}
                            >
                              <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)' }}
                              ></div>
                              {/* Roof Border (manual svg line maybe?) - Clip path clips border too. */}
                              {/* Let's just use the shape for fill and add a border container if needed? */}
                              {/* For simple 2D view, just the shape is fine. */}
                            </div>

                            {/* Main Wall Body */}
                            <div className="absolute inset-0 bg-gray-200 border-2 border-black border-t-0 box-border z-0" style={{ backgroundColor: '#e5e7eb' }}>
                              <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px)' }}
                              ></div>
                            </div>
                          </>
                        );
                      })()}


                      {/* Openings on this wall */}
                      {wallOpenings.map(opening => {
                        const x = (opening.x / 100) * wallDims.width * 20;
                        const y = (opening.y / 100) * wallDims.height * 20;
                        const width = opening.width * 20;
                        const height = opening.height * 20;
                        const isSelected = selectedOpeningId === opening.id;

                        // Fix Y position for DOORS to be at bottom:
                        const isWindow = opening.type.includes('window') || opening.type.includes('framed');
                        // If door, we want bottom to be at wall bottom.
                        // Container is 20px per ft.
                        // normal Top = y - height/2 (centered)
                        // But for doors we just want bottom = 100%.
                        // style top = wallDims.height*20 - height.

                        const styleTop = isWindow
                          ? `${y - height / 2}px`
                          : `${(wallDims.height * 20) - height}px`;

                        return (
                          <div
                            key={opening.id}
                            className={`absolute cursor-pointer transition-all duration-75`}
                            style={{
                              left: `${x - width / 2}px`,
                              top: styleTop,
                              width: `${width}px`,
                              height: `${height}px`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOpeningId(of => (of === opening.id ? null : opening.id));
                            }}
                          >
                            {/* Realistic Opening Look based on Type */}
                            <div className={`w-full h-full border-[2px] box-border relative shadow-inner overflow-hidden ${isSelected ? 'border-green-500 ring-2 ring-green-300' : 'border-gray-500 hover:border-gray-400'} ${opening.id.includes('framed-opening') ? 'bg-transparent' : 'bg-white'}`}>

                              {/* Common Glass/Fill for Windows */}
                              {opening.id.includes('window') && (
                                <div className="absolute inset-0 bg-blue-200/50 backdrop-blur-sm">
                                  {/* Window Mullions (Plus shape) */}
                                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-600"></div>
                                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-600"></div>
                                </div>
                              )}

                              {/* Overhead Door - Horizontal Slats */}
                              {opening.id.includes('overhead-door') && (
                                <div className="absolute inset-0 bg-white flex flex-col justify-between py-[2px]">
                                  {/* Create multiple slat lines */}
                                  {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-full h-[1px] bg-gray-300"></div>
                                  ))}
                                </div>
                              )}

                              {/* Sliding Door - Vertical Slats & Split */}
                              {opening.id.includes('sliding-door') && (
                                <div className="absolute inset-0 bg-white">
                                  {/* Vertical Slats Pattern */}
                                  <div className="absolute inset-0 opacity-20"
                                    style={{ backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 1px, transparent 1px, transparent 8px)' }}>
                                  </div>
                                  {/* Center Vertical Split */}
                                  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-500 -translate-x-1/2"></div>
                                </div>
                              )}

                              {/* Framed Opening - just 'X' or Open */}
                              {opening.id.includes('framed-opening') && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  {/* X mark to denote opening */}
                                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-400 opacity-50 p-1">
                                    <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
                                    <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="2" />
                                  </svg>
                                </div>
                              )}

                              {/* Man/Walk Doors (Service, Dutch, etc) */}
                              {(opening.id.includes('service-door') || opening.id.includes('dutch') || opening.id.includes('double')) && (
                                <div className="absolute inset-0 bg-white">
                                  {/* Door Handle */}
                                  <div className={`absolute top-1/2 right-[10%] w-[15%] h-[15%] rounded-full bg-gray-400 ${opening.id.includes('double') ? 'hidden' : ''}`}></div>
                                  {/* Double Door Split */}
                                  {opening.id.includes('double') && (
                                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-800"></div>
                                  )}
                                  {/* Dutch Window split (top half glass) */}
                                  {opening.id.includes('dutch') && (
                                    <div className="absolute top-0 w-full h-1/2 bg-blue-100/30 border-b border-gray-400"></div>
                                  )}
                                </div>
                              )}

                            </div>

                            {/* Selection indicator / Label */}
                            <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold px-1 rounded ${isSelected ? 'bg-green-600 text-white' : 'bg-white/80 text-gray-900 border border-gray-300'}`}>
                              {opening.name}
                            </div>

                            {/* Quick Remove (only if selected) */}
                            {isSelected && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveOpening(opening.id);
                                }}
                                className="absolute -top-3 -right-3 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 shadow-md z-50"
                                title="Remove"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dimension label */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded shadow-sm border border-gray-300 text-sm font-semibold z-10">
                    {wallDims.width}&apos; Width x {wallDims.height}&apos; Height
                  </div>

                  {/* Viewport Controls */}
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-10 transition-opacity hover:opacity-100 opacity-80">
                    <button
                      onClick={handleZoomIn}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                      title="Zoom In"
                    >
                      <span>➕</span>
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                      title="Zoom Out"
                    >
                      <span>➖</span>
                    </button>
                    <button
                      onClick={handleResetView}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                      title="Reset View"
                    >
                      <span>↺</span>
                    </button>
                    <div className="w-[1px] h-full bg-gray-300 mx-1"></div>
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1"
                    >
                      <span>ℹ️</span> Info
                    </button>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => {
                      const currentIndex = walls.findIndex(w => w.value === selectedWall);
                      const prevIndex = (currentIndex - 1 + walls.length) % walls.length;
                      setSelectedWall(walls[prevIndex].value);
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white z-10 transition-all hover:scale-110"
                  >
                    <span className="text-2xl font-bold text-gray-700">‹</span>
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = walls.findIndex(w => w.value === selectedWall);
                      const nextIndex = (currentIndex + 1) % walls.length;
                      setSelectedWall(walls[nextIndex].value);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg hover:bg-white z-10 transition-all hover:scale-110"
                  >
                    <span className="text-2xl font-bold text-gray-700">›</span>
                  </button>
                </div>
              )}

              {/* 3D View */}
              {viewMode === '3d' && (
                <div className="relative w-full h-[500px] bg-gray-900 group animate-in fade-in">
                  <div className="w-full h-full">
                    <Building3D design={currentDesign} />
                  </div>
                  {/* Overlay info/controls for 3d could go here */}
                  <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur px-3 py-1 rounded text-white text-xs">
                    Interact to Rotate / Scroll to Zoom
                  </div>
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
                  className="px-6 py-2 rounded-md font-semibold text-white transition-colors bg-green-600 hover:bg-green-700 shadow-md"
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
