'use client';

import { useState } from 'react';
import Building3D from '@/components/Building3D';
import { BuildingDesign } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';
import { wallColors, trimColors, roofColors } from '@/data/menardsColors';

// Helper function to get color image path
const getColorImagePath = (colorValue: string, colorLabel: string): string => {
  const colorImageMap: Record<string, string> = {
    // Designer Colors
    'dover-gray': '/web/img/colors/doverGray.png',
    'knights-armor': '/web/img/colors/knightsArmor.png',
    'smoky-sable': '/web/img/colors/smokeySable.png',
    'sandy-clay': '/web/img/colors/sandyClay.png',
    // Standard Colors
    'white': '/web/img/colors/white.jpg',
    'tan': '/web/img/colors/tan.jpg',
    'brite-white': '/web/img/colors/briteWhite.jpg',
    'pinewood': '/web/img/colors/pinewood.jpg',
    'ash-gray': '/web/img/colors/ashGray.jpg',
    'light-stone': '/web/img/colors/liteStone.jpg',
    'ocean-blue': '/web/img/colors/oceanBlue.jpg',
    'midnight-blue': '/web/img/colors/midnightBlue.jpg',
    'emerald-green': '/web/img/colors/emeraldGreen.jpg',
    'beige': '/web/img/colors/beige.jpg',
    'bronze': '/web/img/colors/bronze.jpg',
    'burnished-slate': '/web/img/colors/burnishedSlate.jpg',
    'light-gray': '/web/img/colors/lightGray.jpg',
    'charcoal-gray': '/web/img/colors/charcoalGray.jpg',
    'midnight-gray': '/web/img/colors/midnightGray.jpg',
    'charcoal-black': '/web/img/colors/charcoalBlack.jpg',
    'midnight-black': '/web/img/colors/midnightBlack.jpg',
    'brite-red': '/web/img/colors/briteRed.jpg',
    'red': '/web/img/colors/red.jpg',
    'colonial-red': '/web/img/colors/colonialRed.jpg',
    'burgundy': '/web/img/colors/burgundy.jpg',
    'brown': '/web/img/colors/brown.jpg',
    'galvanized': '/web/img/colors/galvanized.jpg',
    // Woodgrain
    'rough-sawn-natural-cedar': '/web/img/tiles/CDTile.jpg',
    'rough-sawn-gray-cedar': '/web/img/tiles/GCTile.jpg',
    // Fallbacks for existing colors
    'gray': '/web/img/colors/ashGray.jpg',
    'charcoal': '/web/img/colors/charcoalGray.jpg',
    'barn-red': '/web/img/colors/briteRed.jpg',
    'forest-green': '/web/img/colors/emeraldGreen.jpg',
    'slate-blue': '/web/img/colors/oceanBlue.jpg',
    'woodgrain-natural': '/web/img/tiles/CDTile.jpg',
    'woodgrain-weathered': '/web/img/tiles/GCTile.jpg',
  };

  // Try exact match first
  if (colorImageMap[colorValue]) {
    return colorImageMap[colorValue];
  }

  // Try label-based match
  const labelKey = colorLabel.toLowerCase().replace(/\s+/g, '-');
  if (colorImageMap[labelKey]) {
    return colorImageMap[labelKey];
  }

  // Default fallback - use hex color as background
  return '';
};

interface BuildingInfoProps {
  design: BuildingDesign;
  onSubmit: (data: BuildingDesign) => void;
  onNext?: () => void;
}

export default function BuildingInfo({ design, onSubmit, onNext }: BuildingInfoProps) {
  const [infoTab, setInfoTab] = useState<'information' | '3d'>('information');
  const [currentDesign, setCurrentDesign] = useState<BuildingDesign>(design);

  // Which left-side option box is "active" (for yellow highlight like BuildingSize)
  const [activeSection, setActiveSection] = useState<
    | 'floor'
    | 'sidewallPosts'
    | 'postFoundation'
    | 'postEmbedment'
    | 'gradeboard'
    | 'girtType'
    | 'girtSize'
    | 'steelWall'
    | 'steelRoof'
    | 'trimColor'
    | 'overhangs'
    | 'fascia'
    | 'fastenerPlacement'
    | 'plans'
  >('floor');

  // UI-only floor thickness when concrete is selected
  const [floorThickness, setFloorThickness] = useState<string>('4 in');

  // Local-only UI options (not used in pricing yet) to match Menards-style planner
  const [postFoundation, setPostFoundation] = useState<string>('Post Embedded');
  const [postEmbedmentDepth, setPostEmbedmentDepth] = useState<string>(design.postEmbedmentDepth || '4 ft');
  const [footingSize, setFootingSize] = useState<string>(design.footingSize || '20 in x 6 in (Pre-cast)');
  const [girtSize, setGirtSize] = useState<string>('2x4');
  const [wallPanelType, setWallPanelType] = useState<string>('Pro-Rib');
  const [roofPanelType, setRoofPanelType] = useState<string>('Pro-Rib');
  const [wallFastenerLocation, setWallFastenerLocation] = useState<string>('In the Flat');
  const [roofFastenerLocation, setRoofFastenerLocation] = useState<string>('On the Rib');
  const [plansOption, setPlansOption] = useState<string>('Email Only');
  const [showWallColorModal, setShowWallColorModal] = useState<boolean>(false);
  const [showRoofColorModal, setShowRoofColorModal] = useState<boolean>(false);
  const [showTrimColorModal, setShowTrimColorModal] = useState<boolean>(false);
  const [showSoffitColorModal, setShowSoffitColorModal] = useState<boolean>(false);
  const [selectedColorForModal, setSelectedColorForModal] = useState<string>('');
  const [soffitColor, setSoffitColor] = useState<string>('white');
  const [fasciaSize, setFasciaSize] = useState<string>('4 in Fascia');

  const handleDesignChange = (partial: Partial<BuildingDesign>) => {
    setCurrentDesign(prev => {
      const updated: BuildingDesign = { ...prev, ...partial };
      onSubmit(updated);
      return updated;
    });
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      {/* 3D Preview + Controls Area */}
      <div className="flex-1 flex min-h-0">

        {/* Left Controls - Color/Style Selections - Scrollable */}
        <div className="w-[340px] flex flex-col bg-gray-50 border-r border-gray-200 overflow-hidden shrink-0 relative">
          <div className="p-4 border-b border-gray-200 bg-white shadow-sm shrink-0">
            <h2 className="text-lg font-bold text-gray-800">Building Options</h2>
            <p className="text-xs text-gray-500">Customize appearance</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Floor Type */}

            <div
              className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'floor'
                ? 'bg-yellow-100 border-2 border-yellow-300'
                : 'bg-transparent border-0 hover:bg-gray-50'
                }`}
              onClick={() => setActiveSection('floor')}
            >
              <div className={`px-4 py-4 ${activeSection === 'floor' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Floor</p>
                  <p className="text-xs text-gray-800 mb-3">Floor type</p>
                  <select
                    value={currentDesign.floorFinish}
                    onChange={e =>
                      handleDesignChange({
                        floorFinish: e.target.value as BuildingDesign['floorFinish'],
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${currentDesign.floorFinish ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                      }`}
                  >
                    <option value="dirt-gravel">Dirt / Gravel</option>
                    <option value="concrete">Concrete</option>
                  </select>
                </div>

                {/* Floor thickness only when concrete selected */}
                {currentDesign.floorFinish === 'concrete' && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-900 mb-1">Choose the floor thickness</p>
                    <select
                      value={floorThickness}
                      onChange={e => setFloorThickness(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-md text-sm border-blue-500 bg-blue-50"
                    >
                      <option value="4 in">4 in</option>
                      <option value="5 in">5 in</option>
                      <option value="6 in">6 in</option>
                    </select>
                    <p className="mt-2 text-xs italic text-gray-800">
                      *Floor thickness is used to determine the length of wall steel. The cost of the concrete floor is
                      not included.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidewall Posts */}
            <div
              className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'sidewallPosts'
                ? 'bg-yellow-100 border-2 border-yellow-300'
                : 'bg-transparent border-0 hover:bg-gray-50'
                }`}
              onClick={() => setActiveSection('sidewallPosts')}
            >
              <div className={`px-4 py-4 ${activeSection === 'sidewallPosts' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Sidewall Posts</p>
                  <p className="text-xs text-gray-700 mb-3">Select post option</p>
                  <select
                    value={currentDesign.sidewallPosts}
                    onChange={e =>
                      handleDesignChange({
                        sidewallPosts: e.target.value as BuildingDesign['sidewallPosts'],
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${currentDesign.sidewallPosts ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                      }`}
                  >
                    <option value="4x6">4x6</option>
                    <option value="6x6">6x6</option>
                    <option value="columns">Columns</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Post Foundation */}
            <div
              className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'postFoundation'
                ? 'bg-yellow-100 border-2 border-yellow-300'
                : 'bg-transparent border-0 hover:bg-gray-50'
                }`}
              onClick={() => setActiveSection('postFoundation')}
            >
              <div className={`px-4 py-4 ${activeSection === 'postFoundation' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Post Foundation</p>
                  <p className="text-xs text-gray-700 mb-3">Select the construction method</p>
                  <select
                    value={postFoundation}
                    onChange={e => {
                      const val = e.target.value as 'Post Embedded' | 'Secured to Concrete';
                      setPostFoundation(val); // Keep local state for UI conditional logic
                      handleDesignChange({ postFoundation: val }); // Update design for 3D
                      // Reset activeSection if switching to Secured to Concrete
                      if (val === 'Secured to Concrete' && activeSection === 'postEmbedment') {
                        setActiveSection('postFoundation');
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${postFoundation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                      }`}
                  >
                    <option value="Post Embedded">Post Embedded</option>
                    <option value="Secured to Concrete">Secured to Concrete</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Post Embedment - Only show when Post Embedded is selected */}
            {postFoundation === 'Post Embedded' && (
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'postEmbedment'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('postEmbedment')}
              >
                <div className={`px-4 py-2 ${activeSection === 'postEmbedment' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Post Embedment</p>
                  <p className="text-xs text-gray-700">Select the post embedment depth</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'postEmbedment' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Select embedment depth</span>
                    <select
                      value={postEmbedmentDepth}
                      onChange={e => {
                        const val = e.target.value as '4 ft' | '6 ft';
                        setPostEmbedmentDepth(val);
                        handleDesignChange({ postEmbedmentDepth: val });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${postEmbedmentDepth ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="4 ft">4 ft</option>
                      <option value="6 ft">6 ft</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Select footing size</span>
                    <select
                      value={footingSize}
                      onChange={e => {
                        const val = e.target.value;
                        setFootingSize(val);
                        handleDesignChange({ footingSize: val });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${footingSize ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <optgroup label="Pre-Cast">
                        <option value="14 in x 4 in (Pre-cast)">14 in x 4 in (Pre-cast)</option>
                        <option value="20 in x 6 in (Pre-cast)">20 in x 6 in (Pre-cast)</option>
                        <option value="24 in x 8 in (Pre-cast)">24 in x 8 in (Pre-cast)</option>
                      </optgroup>
                      <optgroup label="Poured Concrete">
                        <option value="14 in x 4 in (Poured)">14 in x 4 in (Poured)</option>
                        <option value="20 in x 6 in (Poured)">20 in x 6 in (Poured)</option>
                        <option value="24 in x 8 in (Poured)">24 in x 8 in (Poured)</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Gradeboard */}
            <div
              className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'gradeboard'
                ? 'bg-yellow-100 border-2 border-yellow-300'
                : 'bg-transparent border-0 hover:bg-gray-50'
                }`}
              onClick={() => setActiveSection('gradeboard')}
            >
              <div className={`px-4 py-4 ${activeSection === 'gradeboard' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Gradeboard</p>
                  <p className="text-xs text-gray-700 mb-3">Select the gradeboard type</p>
                  <select
                    value={currentDesign.gradeBoard}
                    onChange={e =>
                      handleDesignChange({
                        gradeBoard: e.target.value as BuildingDesign['gradeBoard'],
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${currentDesign.gradeBoard ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                      }`}
                  >
                    <option value="2x6">2x6 Treated Gradeboard</option>
                    <option value="2x8">2x8 Treated Gradeboard</option>
                    <option value="2x10">2x10 Treated Gradeboard</option>
                    <option value="2x6-centermatch">2x6 Treated Centermatch</option>
                    <option value="2x6-fusion-centermatch">2x6 Fusion Centermatch</option>
                  </select>
                </div>
              </div>

              {(currentDesign.gradeBoard === '2x6-centermatch' || currentDesign.gradeBoard === '2x6-fusion-centermatch') && (
                <div className="mt-4 space-y-3 pt-3 border-t border-yellow-300/50">
                  {[
                    { label: 'Sidewall A rows of centermatch', key: 'sidewallA' },
                    { label: 'Sidewall B rows of centermatch', key: 'sidewallB' },
                    { label: 'Endwall C rows of centermatch', key: 'endwallC' },
                    { label: 'Endwall D rows of centermatch', key: 'endwallD' },
                  ].map((field) => (
                    <div key={field.key}>
                      <span className="text-xs text-gray-700 block mb-2">{field.label}</span>
                      <select
                        value={currentDesign.centermatchRows?.[field.key as keyof typeof currentDesign.centermatchRows] ?? 2}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const currentRows = currentDesign.centermatchRows || {
                            sidewallA: 2,
                            sidewallB: 2,
                            endwallC: 2,
                            endwallD: 2
                          };
                          handleDesignChange({
                            centermatchRows: {
                              ...currentRows,
                              [field.key]: val
                            }
                          });
                        }}
                        className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 bg-white"
                      >
                        {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                          <option key={num} value={num}>
                            {num} rows = {num * 5}"
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Girt Type */}
            <div
              className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'girtType'
                ? 'bg-yellow-100 border-2 border-yellow-300'
                : 'bg-transparent border-0 hover:bg-gray-50'
                }`}
              onClick={() => setActiveSection('girtType')}
            >
              <div className={`px-4 py-4 ${activeSection === 'girtType' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Girt Type</p>
                  <p className="text-xs text-gray-700 mb-3">Select the girt type</p>
                  <select
                    value={currentDesign.girtType}
                    onChange={e =>
                      handleDesignChange({
                        girtType: e.target.value as BuildingDesign['girtType'],
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${currentDesign.girtType ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                      }`}
                  >
                    <option value="flat">Flat Girts (Standard)</option>
                    <option value="bookshelf">Bookshelf Girts</option>
                    <option value="double">Double Girts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Girt Size */}
            <div
              className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'girtSize'
                ? 'bg-yellow-100 border-2 border-yellow-300'
                : 'bg-transparent border-0 hover:bg-gray-50'
                }`}
              onClick={() => setActiveSection('girtSize')}
            >
              <div className={`px-4 py-4 ${activeSection === 'girtSize' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Girt Size</p>
                  <p className="text-xs text-gray-700 mb-3">Select the exterior girt size</p>
                  <select
                    value={girtSize}
                    onChange={e => {
                      const val = e.target.value as '2x4' | '2x6';
                      setGirtSize(val);
                      handleDesignChange({ girtSize: val });
                    }}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${girtSize ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                      }`}
                  >
                    <option value="2x4">2x4</option>
                    <option value="2x6">2x6</option>
                  </select>
                </div>
              </div>

              {/* Wall Color */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'steelWall'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('steelWall')}
              >
                <div className={`px-4 py-2 ${activeSection === 'steelWall' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Steel Wall Panels</p>
                  <p className="text-xs text-gray-700">Steel panel type &amp; wall color</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'steelWall' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Steel Panel Type</span>
                    <select
                      value={wallPanelType}
                      onChange={e => setWallPanelType(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${wallPanelType ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="Pro-Rib">Pro-Rib</option>
                      <option value="Premium Pro-Rib">Premium Pro-Rib</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Choose wall color</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedColorForModal(currentDesign.wallColor || '');
                          setShowWallColorModal(true);
                        }}
                        className={`flex-1 px-3 py-2 border rounded-md text-sm text-left ${currentDesign.wallColor ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                          }`}
                      >
                        {wallColors.find(c => c.value === currentDesign.wallColor)?.label || 'Select color'}
                      </button>
                      <div
                        className="w-10 h-10 border border-gray-300 rounded"
                        style={{
                          backgroundColor: wallColors.find(c => c.value === currentDesign.wallColor)?.hex || '#808080'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Roof Color */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'steelRoof'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('steelRoof')}
              >
                <div className={`px-4 py-2 ${activeSection === 'steelRoof' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Steel Roof Panels</p>
                  <p className="text-xs text-gray-700">Steel panel type &amp; roof color</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'steelRoof' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Steel Panel Type</span>
                    <select
                      value={roofPanelType}
                      onChange={e => setRoofPanelType(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${roofPanelType ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="Pro-Rib">Pro-Rib</option>
                      <option value="Premium Pro-Rib">Premium Pro-Rib</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Choose roof color</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedColorForModal(currentDesign.roofColor || '');
                          setShowRoofColorModal(true);
                        }}
                        className={`flex-1 px-3 py-2 border rounded-md text-sm text-left ${currentDesign.roofColor ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                          }`}
                      >
                        {roofColors.find(c => c.value === currentDesign.roofColor)?.label || 'Select color'}
                      </button>
                      <div
                        className="w-10 h-10 border border-gray-300 rounded"
                        style={{
                          backgroundColor: roofColors.find(c => c.value === currentDesign.roofColor)?.hex || '#808080'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trim Color */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'trimColor'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('trimColor')}
              >
                <div className={`px-4 py-4 ${activeSection === 'trimColor' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Trim Color</p>
                    <p className="text-xs text-gray-700 mb-3">Choose trim color</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedColorForModal(currentDesign.trimColor || '');
                          setShowTrimColorModal(true);
                        }}
                        className={`flex-1 px-3 py-2 border rounded-md text-sm text-left ${currentDesign.trimColor ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                          }`}
                      >
                        {trimColors.find(c => c.value === currentDesign.trimColor)?.label || 'Select color'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedColorForModal(currentDesign.trimColor || '');
                          setShowTrimColorModal(true);
                        }}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                        style={{
                          backgroundColor: trimColors.find(c => c.value === currentDesign.trimColor)?.hex || '#808080'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overhangs */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'overhangs'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('overhangs')}
              >
                <div className={`px-4 py-2 ${activeSection === 'overhangs' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Overhangs</p>
                  <p className="text-xs text-gray-700">Endwall and sidewall overhang length</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'overhangs' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Endwall overhang length</span>
                    <select
                      value={currentDesign.endWallOverhang}
                      onChange={e =>
                        handleDesignChange({
                          endWallOverhang: e.target.value as BuildingDesign['endWallOverhang'],
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-md text-sm ${currentDesign.endWallOverhang ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="0">0ft</option>
                      <option value="1">1ft</option>
                      <option value="2">2ft</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Sidewall overhang length</span>
                    <select
                      value={currentDesign.sidewallOverhang}
                      onChange={e =>
                        handleDesignChange({
                          sidewallOverhang: e.target.value as BuildingDesign['sidewallOverhang'],
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-md text-sm ${currentDesign.sidewallOverhang ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="0">0ft</option>
                      <option value="1">1ft</option>
                      <option value="2">2ft</option>
                    </select>
                  </div>
                  {/* Soffit Color - Show when either overhang is > 0 */}
                  {(currentDesign.endWallOverhang !== '0' || currentDesign.sidewallOverhang !== '0') && (
                    <div>
                      <span className="text-xs text-gray-700 block mb-2">Choose soffit color</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedColorForModal(soffitColor || '');
                            setShowSoffitColorModal(true);
                          }}
                          className={`flex-1 px-3 py-2 border rounded-md text-sm text-left ${soffitColor ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          {trimColors.find(c => c.value === soffitColor)?.label || 'Select color'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedColorForModal(soffitColor || '');
                            setShowSoffitColorModal(true);
                          }}
                          className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          style={{
                            backgroundColor: trimColors.find(c => c.value === soffitColor)?.hex || '#808080'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fascia */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'fascia'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('fascia')}
              >
                <div className={`px-4 py-2 ${activeSection === 'fascia' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Fascia</p>
                  <p className="text-xs text-gray-700">Select the fascia size</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'fascia' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Select the fascia size</span>
                    <select
                      value={fasciaSize}
                      onChange={e => setFasciaSize(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${fasciaSize ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="4 in Fascia">4 in Fascia</option>
                      <option value="6 in Fascia">6 in Fascia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fastener Placement */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'fastenerPlacement'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('fastenerPlacement')}
              >
                <div className={`px-4 py-2 ${activeSection === 'fastenerPlacement' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Fastener Placement</p>
                  <p className="text-xs text-gray-700">Choose wall &amp; roof fastener location</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'fastenerPlacement' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Wall fastener location</span>
                    <select
                      value={wallFastenerLocation}
                      onChange={e => setWallFastenerLocation(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${wallFastenerLocation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="In the Flat">In the Flat</option>
                      <option value="On the Rib">On the Rib</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Roof fastener location</span>
                    <select
                      value={roofFastenerLocation}
                      onChange={e => setRoofFastenerLocation(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${roofFastenerLocation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="In the Flat">In the Flat</option>
                      <option value="On the Rib">On the Rib</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Plans */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'plans'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('plans')}
              >
                <div className={`px-4 py-4 ${activeSection === 'plans' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Plans</p>
                    <p className="text-xs text-gray-700 mb-3">Choose a Mini-Print option</p>
                    <select
                      value={plansOption}
                      onChange={e => setPlansOption(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${plansOption ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="Email Only">Email Only</option>
                      <option value="Hardcopy & e-mail">Hardcopy and E-mail</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>
              </div >
            </div >
          </div >
        </div >

        {/* Right Column - Price + Tabs (Information / 3D) */}
        < div className="flex-1 flex flex-col bg-white rounded-lg shadow-md p-4 overflow-hidden" >
          <div className="mb-3 flex-shrink-0">
            <div className="flex space-x-2 border-b">
              <button
                onClick={() => setInfoTab('information')}
                className={`px-3 py-1.5 font-semibold rounded-t transition-colors text-sm ${infoTab === 'information'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Information
              </button>
              <button
                onClick={() => setInfoTab('3d')}
                className={`px-3 py-1.5 font-semibold rounded-t transition-colors text-sm ${infoTab === '3d'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                3D Scene
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {infoTab === 'information' && (
              <>
                {/* Price Summary Box */}
                {totalPrice > 0 && (
                  <div className="mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2">
                      *Today&apos;s estimated price, future pricing may go up or down. Tax, labor, and delivery not included.
                    </p>
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="text-sm font-semibold text-gray-700 mr-1">Building Price:</span>
                        <span className="text-xl font-bold text-gray-900 align-baseline">
                          ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        Design Id: <span className="font-normal">{designId}</span>
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        Design Name: <span className="font-normal">{designName}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Helper Banner */}
                {totalPrice === 0 && (
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-gray-700">
                      Please fill in Width, Truss Spacing, Length, and Height to get a price.
                    </p>
                  </div>
                )}
                {/* Conditional Content Based on Active Section */}
                {activeSection === 'floor' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Floor</h3>
                    <div className="mb-4">
                      <img
                        src="/assets/floor.jpg"
                        alt="Floor type illustration"
                        className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                      />
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>
                          If you plan to pour concrete for a floor right away or in the future, it is important to select
                          this option correctly. Selecting a concrete floor option will adjust the height of your
                          sidewalls and steel.
                        </p>
                        <p>
                          If you plan on securing the poles/columns to a concrete slab, please select a concrete thickness
                          and then change the &quot;Post Foundation&quot; selection to &quot;secured to slab&quot;.
                        </p>
                        <p className="italic">
                          Note: Concrete is not being estimated for your building and not provided with your materials
                          list.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'sidewallPosts' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Sidewall Posts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Treated Posts Panel */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/post.jpg"
                          alt="Treated Posts"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Treated Posts</h4>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                          <li>4x6 &amp; 6x6</li>
                          <li>Lifetime warranty against rotting &amp; decay</li>
                          <li>Requires notching for truss to pole connection</li>
                        </ul>
                      </div>

                      {/* Laminated Columns Panel */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/column.jpg"
                          alt="Laminated Columns"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Laminated Columns</h4>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                          <li>Straighter &amp; stronger than solid sawn wood posts</li>
                          <li>Columns come pre-notched for superior truss to column connection</li>
                          <li>Lower portion treated for in-ground use</li>
                          <li>Treated portion has lifetime warranty against rotting &amp; decay</li>
                          <li>Steel reinforcement plates at all spliced locations</li>
                          <li>Rivet clinched nails provide superior holding power</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        Select the size of the posts used for the sidewalls of your building. Larger posts provide more
                        structural support and are recommended for wider buildings or areas with high wind or snow loads.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'postFoundation' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Post Foundation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Post Embedded Panel */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/post-foundation-embedded.jpg"
                          alt="Post Embedded"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Post Embedded</h4>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                          <li>Embedding the poles or columns in the ground creates a stronger building.</li>
                          <li>Poles/Columns will be defaulted to 4&apos; in the ground.</li>
                        </ul>
                      </div>

                      {/* Secured To Concrete Panel */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/post-foundation-concrete.jpg"
                          alt="Secured To Concrete"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Secured To Concrete</h4>
                        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                          <li>Great option for areas where post embedment can be an issue.</li>
                          <li>Anchors provided are for a dry set application.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'postEmbedment' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Post Embedment</h3>

                    {/* All three images in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Footing Pad Size Guidelines */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">FOOTING PAD SIZE GUIDELINES</h4>
                        <img
                          src="/assets/post_foundationV2.jpg"
                          alt="Post Embedment - Footing Pad Size Guidelines"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <div className="space-y-2 text-xs text-gray-700">
                          <p>
                            Please consult your local building officials for code requirements. Diameter and thickness may vary
                            due to soil conditions.
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Deeper post embedment may be required in certain geographical locations due to increased average frost depths.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Precast Footing Pad */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Precast Footing Pad</h4>
                        <img
                          src="/assets/precast-footing-pad.png"
                          alt="Precast Footing Pad"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>Will stabilize your building without mixing and pouring concrete</li>
                          <li>Speeds up the building process by not waiting for concrete to cure</li>
                        </ul>
                      </div>

                      {/* Poured Footing Pad */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Poured Footing Pad</h4>
                        <img
                          src="/assets/poured-footing-pad.png"
                          alt="Poured Footing Pad"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>Used when guest would rather pour the footings as opposed to dealing with larger precast footing pads</li>
                          <li>More economical for larger footing pads</li>
                          <li>Take your bags of concrete home today and have your holes and footings ready for when your building arrives</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'gradeboard' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Gradeboard</h3>

                    {/* All four images in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Treated Gradeboard */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/treated_gradeboard.png"
                          alt="Treated Gradeboard"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Treated Gradeboard</h4>
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>Available in multiple depth options to accommodate different concrete depths</li>
                        </ul>
                      </div>

                      {/* Treated Centermatch */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/treated_centermatch.png"
                          alt="Treated Centermatch"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Treated Centermatch</h4>
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>Allows you to build the building first and add a concrete floor at a later date</li>
                          <li>Can be stacked for a taller gradeboard option which allows for vertical grade elevation on post frame buildings</li>
                        </ul>
                      </div>

                      {/* Fusion Gradeboard */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/fusion_gradeboard.png"
                          alt="Fusion Gradeboard"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Fusion Gradeboard</h4>
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>A great alternative to treated lumber that won&apos;t rot, warp or splinter</li>
                          <li>Encapsulated surface technology for the best fade, scratch and stain resistance available for UltraDeck® products</li>
                          <li>Gradeboard features built-in bottom trim which makes installing steel panels faster and easier and eliminates the need for steel bottom trim</li>
                        </ul>
                      </div>

                      {/* Fusion Centermatch */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/fusion_centermatch.png"
                          alt="Fusion Centermatch"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Fusion Centermatch</h4>
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>Encapsulated surface technology for the best fade, scratch and stain resistance available for UltraDeck® products</li>
                          <li>Can be stacked for a taller gradeboard option which allows for vertical grade elevation on post frame buildings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'girtType' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Girt Type</h3>

                    {/* All three images in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Flat Girts */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/flat_girts.jpg"
                          alt="Flat Girts"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Flat Girts</h4>
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>2x4 or 2x6 wall girts that are applied to the outside of the post/column</li>
                        </ul>
                      </div>

                      {/* Bookshelf Girts */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/bookshelf_girts.jpg"
                          alt="Bookshelf Girts"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Bookshelf Girts</h4>
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>2x6 wall girts that are laid horizontally between the post/column to put batt insulation between the girts</li>
                          <li>2x4 flat wall girts are applied to the outside of the post/column to easily mount steel panels to</li>
                        </ul>
                      </div>

                      {/* Double Girts */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/double_girts.jpg"
                          alt="Double Girts"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Double Girts</h4>
                        <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
                          <li>2x4 or 2x6 flat wall girts on the outside of the post/column with 2x4 interior girts on the inside of the post/column</li>
                          <li>This girt option is applied when using roll insulation on the walls</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'girtSize' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Girt Size</h3>
                    <div className="mb-4">
                      <img
                        src="/assets/girt_size.jpg"
                        alt="Girt Size illustration"
                        className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                      />
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="font-semibold mb-4">Steel Panel Options</p>
                        <p>
                          Girts are either 2x4 or 2x6 framing members that are attached horizontally to the posts. Girts laterally support posts and are used to attach wall steel to.
                        </p>
                        <div className="mt-4 space-y-2">
                          <p className="font-semibold">2x4 Girts</p>
                          <ul className="list-disc list-inside ml-4">
                            <li>More economical</li>
                          </ul>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="font-semibold">2x6 Girts</p>
                          <ul className="list-disc list-inside ml-4">
                            <li>Provides more nailing/screwing surface than 2x4 girts</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'steelWall' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Steel Wall Panels</h3>

                    {/* Three images in one row with text below */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {/* Steel Panel Options */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/steel_panelV2.jpg"
                          alt="Steel Panel Options"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Steel Panel Options</h4>
                        <div className="space-y-3 text-sm text-gray-700">
                          <div>
                            <p className="font-semibold mb-2">Standard Pro-Rib:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>29 Gauge Panel (Actual .0142&quot; minimum thickness before painting, .0165&quot; nominal thickness after painting).</li>
                              <li>Exposed fastener panel system.</li>
                              <li>Class 4 hail resistance and Class A fire rated.</li>
                              <li>Limited 40-year paint warranty.</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Premium Pro-Rib:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>28 Gauge Panel (Actual .0157&quot; minimum thickness before painting, .018&quot; nominal thickness after painting).</li>
                              <li>Exposed fastener panel system.</li>
                              <li>Class 4 hail resistance and Class A fire rated.</li>
                              <li>Limited lifetime paint warranty.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Designer Steel Series */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/designer-steel-panel-colors.jpg"
                          alt="Designer Steel Panel Colors"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Designer Steel Series</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            The Designer Steel series features enhanced paint technology that eliminates the shine and glare of typical panels to create a rich, soft appearance, while still delivering the performance and durability of steel.
                          </p>
                          <p>
                            The Designer Series is perfect for any roofing or siding application.
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Available in 4 popular colors</li>
                            <li>Low shine matte paint system</li>
                            <li>Cool Chemistry Technology for energy efficiency</li>
                          </ul>
                        </div>
                      </div>

                      {/* Woodgrain Steel Series */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/woodgrain-steel-panel-colors.jpg"
                          alt="Woodgrain Steel Panel Colors"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Woodgrain Steel Series</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            The Woodgrain Steel series features 2 colors that replicate rough sawn red cedar in natural and weathered gray paint. These prints are perfect for creating a distinguished look of quality on any wall while having the endurance of steel at less cost than cedar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'steelRoof' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Steel Roof Panels</h3>

                    {/* Two images in one row with text below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Steel Panel Options */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/steel_panelV2.jpg"
                          alt="Steel Panel Options"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Steel Panel Options</h4>
                        <div className="space-y-3 text-sm text-gray-700">
                          <div>
                            <p className="font-semibold mb-2">Standard Pro-Rib:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>29 Gauge Panel (Actual .0142&quot; minimum thickness before painting, .0165&quot; nominal thickness after painting).</li>
                              <li>Exposed fastener panel system.</li>
                              <li>Class 4 hail resistance and Class A fire rated.</li>
                              <li>Limited 40-year paint warranty.</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold mb-2">Premium Pro-Rib:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>28 Gauge Panel (Actual .0157&quot; minimum thickness before painting, .018&quot; nominal thickness after painting).</li>
                              <li>Exposed fastener panel system.</li>
                              <li>Class 4 hail resistance and Class A fire rated.</li>
                              <li>Limited lifetime paint warranty.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Designer Steel Series */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/designer-steel-panel-colors.jpg"
                          alt="Designer Steel Panel Colors"
                          className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Designer Steel Series</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          <p>
                            The Designer Steel series features enhanced paint technology that eliminates the shine and glare of typical panels to create a rich, soft appearance, while still delivering the performance and durability of steel.
                          </p>
                          <p>
                            The Designer Series is perfect for any roofing or siding application.
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Available in 4 popular colors</li>
                            <li>Low shine matte paint system</li>
                            <li>Cool Chemistry Technology for energy efficiency</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'trimColor' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Trim Color</h3>
                    <div className="border border-gray-300 rounded-lg p-4 bg-white">
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Trim color typically matches roof steel color (defaulted).</li>
                        <li>
                          By selecting a trim color you will be adjusting the following items:
                          <ul className="list-none ml-6 mt-2 space-y-1">
                            <li className="flex items-center">
                              <span className="w-2 h-2 rounded-full border border-gray-700 mr-2"></span>
                              Bottom Trim
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 rounded-full border border-gray-700 mr-2"></span>
                              Corner Trim
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 rounded-full border border-gray-700 mr-2"></span>
                              Eave Trim
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 rounded-full border border-gray-700 mr-2"></span>
                              Gable Trim
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 rounded-full border border-gray-700 mr-2"></span>
                              Fascia Trim
                            </li>
                            <li className="flex items-center">
                              <span className="w-2 h-2 rounded-full border border-gray-700 mr-2"></span>
                              Door and Window Trim
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeSection === 'overhangs' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Overhangs</h3>
                    <div className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
                      <img
                        src="/assets/with_ohV2.png"
                        alt="Building with Overhang"
                        className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                      />
                      <h4 className="text-sm font-bold text-gray-900 mb-2 text-center">Building with Overhang</h4>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Better ventilation and curb appeal</li>
                        <li>Better drainage, moving rain and snow away from doors and foundation</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeSection === 'fascia' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Fascia</h3>

                    {/* Two images in one row with text below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* 4" Fascia */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/four-inch-fascia.jpg"
                          alt="4&quot; Fascia"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">4&quot; Fascia</h4>
                        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                          <li>Most economic fascia option</li>
                          <li>One piece fascia trim</li>
                        </ul>
                      </div>

                      {/* 6" Fascia */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/six-inch-fascia.jpg"
                          alt="6&quot; Fascia"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">6&quot; Fascia</h4>
                        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                          <li>Larger fascia allows ability to add gutter system</li>
                          <li>2 piece fascia trim</li>
                          <li>Provides additional curb appeal to fascia</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}


                {activeSection === 'fastenerPlacement' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Fastener Placement</h3>

                    {/* Two images in one row with text below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Screws in the Flat */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/fastenersV5-1.jpg"
                          alt="Fastener Placement - Screws in the flat"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Fastener Placement - Screws in the flat</h4>
                        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                          <li>Shorter screws used, means more screws per pound, and is more economical</li>
                          <li>Easier to install screws on the larger flat surface</li>
                          <li>Eliminates any issue of flattening your rib and causing your steel to not be square</li>
                        </ul>
                      </div>

                      {/* Screws through the Rib */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/fastenersV5-2.jpg"
                          alt="Fastener Placement - Screws through the rib"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Fastener Placement - Screws through the rib</h4>
                        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                          <li>Less chance of oil canning your steel panels</li>
                          <li>Top of the rib has smaller surface area and less water on it than in the flat</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'plans' && (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Plans</h3>

                    {/* Two images in one row with text below */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Hard Copy and Email */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/miniprintV4-1.jpg"
                          alt="Hard Copy and Email"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Hard Copy and Email</h4>
                        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                          <li>In addition to the email, plans are printed on 24&quot; x 36&quot; paper</li>
                          <li>and will be mailed to the selected address.</li>
                        </ul>
                      </div>

                      {/* Email */}
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                        <img
                          src="/assets/miniprintV4-2.jpg"
                          alt="Email"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Email</h4>
                        <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                          <li>Plans will be emailed as a PDF file and formatted to print on standard 8 1/2&quot; x 11&quot; paper.</li>
                          <li>Plan includes floor plan, steel layout, and elevations.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>
                        The building estimates from this program are code exempt applications (examples: buildings used for personal storage or agricultural use). Menards can provide estimates for all types of &quot;Engineered&quot; Post Frame Buildings and Barndominiums (examples: used for a business, living space, rental or personal storage buildings that need to be code compliant).
                      </p>
                      <p>
                        If you need to meet a specific snow or wind load rating or are required to provide sealed blueprints, please chat or leave a message, e-mail{' '}
                        <a href="mailto:postframe@midwestmanufacturing.com" className="text-blue-600 hover:underline">
                          postframe@midwestmanufacturing.com
                        </a>
                        , or visit your local Menards store for more information.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {infoTab === '3d' && (
              <div className="h-full">
                <Building3D
                  design={{
                    ...currentDesign,
                    // Use preview color if modal is open and color is selected, otherwise use current
                    wallColor: (showWallColorModal && selectedColorForModal)
                      ? (selectedColorForModal === 'galvanized' ? 'ash-gray' :
                        selectedColorForModal === 'rough-sawn-natural-cedar' || selectedColorForModal === 'rough-sawn-gray-cedar'
                          ? (selectedColorForModal === 'rough-sawn-natural-cedar' ? 'tan' : 'ash-gray')
                          : selectedColorForModal)
                      : currentDesign.wallColor,
                    // Use preview roof color if modal is open and color is selected
                    roofColor: (showRoofColorModal && selectedColorForModal)
                      ? (selectedColorForModal === 'galvanized' ? 'ash-gray' : selectedColorForModal)
                      : currentDesign.roofColor,
                    // Use preview trim color if modal is open and color is selected
                    trimColor: (showTrimColorModal && selectedColorForModal)
                      ? (selectedColorForModal === 'galvanized' ? 'ash-gray' :
                        selectedColorForModal === 'rough-sawn-natural-cedar' || selectedColorForModal === 'rough-sawn-gray-cedar'
                          ? (selectedColorForModal === 'rough-sawn-natural-cedar' ? 'tan' : 'ash-gray')
                          : selectedColorForModal)
                      : currentDesign.trimColor
                  }}
                />
              </div>
            )}
          </div>
          {/* Bottom actions (Next button) */}
          <div className="mt-4 flex justify-end flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onNext) {
                  onNext();
                }
              }}
              disabled={!onNext}
              className={`px-4 py-1.5 rounded-md font-semibold text-white transition-colors text-sm ${onNext
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              Next: Accessories
            </button>
          </div>
        </div>
      </div >

      <>
        {/* Wall Color Selection Modal - Slides in from left */}
        {showWallColorModal && (
          <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
              {/* Green Banner */}
              <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                <h2 className="text-base font-bold">Choose wall color</h2>
                <button
                  onClick={() => {
                    setShowWallColorModal(false);
                    setSelectedColorForModal('');
                  }}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Selection Section - Fixed at top */}
              <div className="p-4 border-b border-gray-300 shrink-0 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Selection:</h3>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  {selectedColorForModal
                    ? wallColors.find(c => c.value === selectedColorForModal)?.label || 'Select a color'
                    : wallColors.find(c => c.value === currentDesign.wallColor)?.label || 'White'}
                </p>
                <div
                  className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                  style={{
                    backgroundImage: selectedColorForModal
                      ? (getColorImagePath(selectedColorForModal, wallColors.find(c => c.value === selectedColorForModal)?.label || ''))
                        ? `url(${getColorImagePath(selectedColorForModal, wallColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                        : undefined
                      : (getColorImagePath(currentDesign.wallColor || 'white', wallColors.find(c => c.value === currentDesign.wallColor)?.label || 'White'))
                        ? `url(${getColorImagePath(currentDesign.wallColor || 'white', wallColors.find(c => c.value === currentDesign.wallColor)?.label || 'White')})`
                        : undefined,
                    backgroundPosition: 'center center',
                    backgroundSize: '100% 100%',
                    backgroundOrigin: 'border-box',
                    backgroundColor: selectedColorForModal
                      ? wallColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                      : wallColors.find(c => c.value === currentDesign.wallColor)?.hex || '#FFFFFF'
                  }}
                />
                <button
                  onClick={() => {
                    if (selectedColorForModal) {
                      // Handle special cases for colors that need fallback
                      if (selectedColorForModal === 'galvanized') {
                        handleDesignChange({ wallColor: 'ash-gray' }); // Use ash-gray as fallback for galvanized
                      } else if (selectedColorForModal === 'rough-sawn-natural-cedar' || selectedColorForModal === 'rough-sawn-gray-cedar') {
                        handleDesignChange({ wallColor: selectedColorForModal === 'rough-sawn-natural-cedar' ? 'tan' : 'ash-gray' }); // Use tan/ash-gray as fallback for woodgrain
                      } else {
                        handleDesignChange({ wallColor: selectedColorForModal });
                      }
                    } else {
                      // If no selection, keep current
                      handleDesignChange({ wallColor: currentDesign.wallColor || 'white' });
                    }
                    setShowWallColorModal(false);
                    setSelectedColorForModal('');
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors"
                >
                  Select
                </button>
              </div>

              {/* Scrollable Color Sections */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Designer Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Designer Colors</h3>
                    <div className="flex gap-2 flex-wrap">
                      {wallColors.filter(c => ['dover-gray', 'knights-armor', 'smoky-sable', 'sandy-clay'].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-20 h-20 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Standard Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Standard Colors</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {wallColors.filter(c => [
                        'white', 'tan', 'brite-white', 'pinewood', 'ash-gray',
                        'light-stone', 'ocean-blue', 'midnight-blue', 'emerald-green', 'beige',
                        'bronze', 'burnished-slate', 'light-gray', 'charcoal-gray', 'midnight-gray',
                        'charcoal-black', 'midnight-black', 'brite-red', 'red', 'colonial-red',
                        'burgundy', 'brown', 'galvanized'
                      ].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-14 h-14 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Woodgrain Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Woodgrain Colors</h3>
                    <div className="flex gap-2">
                      {wallColors.filter(c => ['rough-sawn-natural-cedar', 'rough-sawn-gray-cedar'].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-20 h-20 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roof Color Selection Modal - Slides in from left */}
        {showRoofColorModal && (
          <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
              {/* Green Banner */}
              <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                <h2 className="text-base font-bold">Choose roof color</h2>
                <button
                  onClick={() => {
                    setShowRoofColorModal(false);
                    setSelectedColorForModal('');
                  }}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Selection Section - Fixed at top */}
              <div className="p-4 border-b border-gray-300 shrink-0 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Selection:</h3>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  {selectedColorForModal
                    ? roofColors.find(c => c.value === selectedColorForModal)?.label || 'Select a color'
                    : roofColors.find(c => c.value === currentDesign.roofColor)?.label || 'White'}
                </p>
                <div
                  className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                  style={{
                    backgroundImage: selectedColorForModal
                      ? (getColorImagePath(selectedColorForModal, roofColors.find(c => c.value === selectedColorForModal)?.label || ''))
                        ? `url(${getColorImagePath(selectedColorForModal, roofColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                        : undefined
                      : (getColorImagePath(currentDesign.roofColor || 'white', roofColors.find(c => c.value === currentDesign.roofColor)?.label || 'White'))
                        ? `url(${getColorImagePath(currentDesign.roofColor || 'white', roofColors.find(c => c.value === currentDesign.roofColor)?.label || 'White')})`
                        : undefined,
                    backgroundPosition: 'center center',
                    backgroundSize: '100% 100%',
                    backgroundOrigin: 'border-box',
                    backgroundColor: selectedColorForModal
                      ? roofColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                      : roofColors.find(c => c.value === currentDesign.roofColor)?.hex || '#FFFFFF'
                  }}
                />
                <button
                  onClick={() => {
                    if (selectedColorForModal) {
                      if (selectedColorForModal === 'galvanized') {
                        handleDesignChange({ roofColor: 'ash-gray' });
                      } else {
                        handleDesignChange({ roofColor: selectedColorForModal });
                      }
                    } else {
                      handleDesignChange({ roofColor: currentDesign.roofColor || 'white' });
                    }
                    setShowRoofColorModal(false);
                    setSelectedColorForModal('');
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors"
                >
                  Select
                </button>
              </div>

              {/* Scrollable Color Sections */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Designer Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Designer Colors</h3>
                    <div className="flex gap-2 flex-wrap">
                      {roofColors.filter(c => ['dover-gray', 'knights-armor', 'smoky-sable', 'sandy-clay'].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-20 h-20 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Standard Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Standard Colors</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {roofColors.filter(c => [
                        'white', 'tan', 'brite-white', 'pinewood', 'ash-gray',
                        'light-stone', 'ocean-blue', 'midnight-blue', 'emerald-green', 'beige',
                        'bronze', 'burnished-slate', 'light-gray', 'charcoal-gray', 'midnight-gray',
                        'charcoal-black', 'midnight-black', 'brite-red', 'red', 'colonial-red',
                        'burgundy', 'brown', 'galvanized'
                      ].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-14 h-14 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trim Color Selection Modal - Slides in from left */}
        {showTrimColorModal && (
          <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
              {/* Green Banner */}
              <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                <h2 className="text-base font-bold">Choose trim color</h2>
                <button
                  onClick={() => {
                    setShowTrimColorModal(false);
                    setSelectedColorForModal('');
                  }}
                  className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Current Selection Section - Fixed at top */}
              <div className="p-4 border-b border-gray-300 shrink-0 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Selection:</h3>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  {selectedColorForModal
                    ? trimColors.find(c => c.value === selectedColorForModal)?.label || 'Select a color'
                    : trimColors.find(c => c.value === currentDesign.trimColor)?.label || 'White'}
                </p>
                <div
                  className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                  style={{
                    backgroundImage: selectedColorForModal
                      ? (getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || ''))
                        ? `url(${getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                        : undefined
                      : (getColorImagePath(currentDesign.trimColor || 'white', trimColors.find(c => c.value === currentDesign.trimColor)?.label || 'White'))
                        ? `url(${getColorImagePath(currentDesign.trimColor || 'white', trimColors.find(c => c.value === currentDesign.trimColor)?.label || 'White')})`
                        : undefined,
                    backgroundPosition: 'center center',
                    backgroundSize: '100% 100%',
                    backgroundOrigin: 'border-box',
                    backgroundColor: selectedColorForModal
                      ? trimColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                      : trimColors.find(c => c.value === currentDesign.trimColor)?.hex || '#FFFFFF'
                  }}
                />
                <button
                  onClick={() => {
                    if (selectedColorForModal) {
                      if (selectedColorForModal === 'galvanized') {
                        handleDesignChange({ trimColor: 'ash-gray' });
                      } else if (selectedColorForModal === 'rough-sawn-natural-cedar' || selectedColorForModal === 'rough-sawn-gray-cedar') {
                        handleDesignChange({ trimColor: selectedColorForModal === 'rough-sawn-natural-cedar' ? 'tan' : 'ash-gray' });
                      } else {
                        handleDesignChange({ trimColor: selectedColorForModal });
                      }
                    } else {
                      handleDesignChange({ trimColor: currentDesign.trimColor || 'white' });
                    }
                    setShowTrimColorModal(false);
                    setSelectedColorForModal('');
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors"
                >
                  Select
                </button>
              </div>

              {/* Scrollable Color Sections */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Designer Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Designer Colors</h3>
                    <div className="flex gap-2 flex-wrap">
                      {trimColors.filter(c => ['dover-gray', 'knights-armor', 'smoky-sable', 'sandy-clay'].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-20 h-20 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Standard Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Standard Colors</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {trimColors.filter(c => [
                        'white', 'tan', 'brite-white', 'pinewood', 'ash-gray',
                        'light-stone', 'ocean-blue', 'midnight-blue', 'emerald-green', 'beige',
                        'bronze', 'burnished-slate', 'light-gray', 'charcoal-gray', 'midnight-gray',
                        'charcoal-black', 'midnight-black', 'brite-red', 'red', 'colonial-red',
                        'burgundy', 'brown', 'galvanized'
                      ].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-14 h-14 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Woodgrain Colors */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Woodgrain Colors</h3>
                    <div className="flex gap-2">
                      {trimColors.filter(c => ['rough-sawn-natural-cedar', 'rough-sawn-gray-cedar'].includes(c.value)).map(color => {
                        const imagePath = getColorImagePath(color.value, color.label);
                        return (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColorForModal(color.value)}
                            className={`w-20 h-20 rounded border-2 transition-all ${selectedColorForModal === color.value ? 'border-green-600 ring-2 ring-green-300' : 'border-gray-400 hover:border-gray-500'
                              }`}
                            style={imagePath ? {
                              backgroundImage: `url(${imagePath})`,
                              backgroundPosition: 'center center',
                              backgroundSize: '100% 100%',
                              backgroundOrigin: 'border-box',
                              backgroundColor: color.hex
                            } : { backgroundColor: color.hex }}
                            title={color.label}
                          >
                            &nbsp;
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Soffit Color Selection Modal */}
        {
          showSoffitColorModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSoffitColorModal(false)}>
              <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Green Banner */}
                <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg">
                  <h2 className="text-base font-bold">Choose soffit color</h2>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Side - Color Sections */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Standard Colors */}
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">Standard Colors</h3>
                        <div className="grid grid-cols-5 gap-3">
                          {trimColors.map(color => (
                            <button
                              key={color.value}
                              onClick={() => setSelectedColorForModal(color.value)}
                              className={`w-32 h-32 rounded-lg border-4 ${selectedColorForModal === color.value ? 'border-green-600' : 'border-gray-400'
                                }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Current Selection */}
                    <div className="lg:col-span-1">
                      <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Current Selection:</h3>
                        <p className="text-sm font-bold text-gray-900 mb-3">
                          {selectedColorForModal
                            ? trimColors.find(c => c.value === selectedColorForModal)?.label || 'Select a color'
                            : trimColors.find(c => c.value === soffitColor)?.label || 'Select a color'}
                        </p>
                        <div
                          className="w-full h-24 rounded border-2 border-gray-300 mb-3"
                          style={{
                            backgroundColor: selectedColorForModal
                              ? trimColors.find(c => c.value === selectedColorForModal)?.hex || '#808080'
                              : trimColors.find(c => c.value === soffitColor)?.hex || '#808080'
                          }}
                        />
                        <button
                          onClick={() => {
                            if (selectedColorForModal) {
                              setSoffitColor(selectedColorForModal);
                            }
                            setShowSoffitColorModal(false);
                            setSelectedColorForModal('');
                          }}
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setShowSoffitColorModal(false);
                        setSelectedColorForModal('');
                      }}
                      className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Disclaimer */}
                  <p className="mt-4 text-xs text-gray-600 text-center">
                    Color chips show approximate tone. Color of actual product may vary. Final color approval should be made with actual material. Samples are available to order on Menards.com
                  </p>
                </div>
              </div>
            </div>
          )
        }
      </>
    </div >
  );
}


