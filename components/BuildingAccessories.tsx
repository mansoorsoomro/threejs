'use client';

import { useState, useEffect } from 'react';
import Building3D from '@/components/Building3D';
import { BuildingDesign } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';
import { trimColors } from '@/data/menardsColors';

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

interface BuildingAccessoriesProps {
  design: BuildingDesign;
  onSubmit: (data: BuildingDesign) => void;
  onNext?: () => void;
}

export default function BuildingAccessories({ design, onSubmit, onNext }: BuildingAccessoriesProps) {
  const [infoTab, setInfoTab] = useState<'information' | '3d'>('information');
  const [currentDesign, setCurrentDesign] = useState<BuildingDesign>(design);

  // Which left-side option box is "active" (for yellow highlight)
  const [activeSection, setActiveSection] = useState<
    | 'openWall'
    | 'gableAccent'
    | 'wainscot'
    | 'wallInsulation'
    | 'wallCondensation'
    | 'interiorWallLiner'
    | 'roofCondensation'
    | 'ceilingInsulation'
    | 'ceilingLiner'
    | 'ridgeOptions'
    | 'outsideClosure'
    | 'ridgeVentilation'
    | 'gableVents'
    | 'endCaps'
    | 'snowGuards'
    | 'skylights'
    | 'eaveLight'
    | 'gutters'
    | 'cupolas'
  >('openWall');

  // Local state for all options
  // Open Wall configuration derives from design prop
  const openWall = design.openWalls?.isOpen ? 'Yes' : 'No';
  const openSideWallA = design.openWalls?.sideWallA ? 'Yes' : 'No';
  const openSideWallB = design.openWalls?.sideWallB ? 'Yes' : 'No';
  const openEndWallC = design.openWalls?.endWallC ? 'Yes' : 'No';
  const openEndWallD = design.openWalls?.endWallD ? 'Yes' : 'No';
  const removeEveryOtherPost = design.openWalls?.removeEveryOtherPost ? 'Yes' : 'No';

  // Helper to update openWalls config
  const updateOpenWalls = (key: keyof NonNullable<BuildingDesign['openWalls']>, value: boolean) => {
    const currentConfig = design.openWalls || {
      isOpen: false,
      sideWallA: false,
      sideWallB: false,
      endWallC: false,
      endWallD: false,
      removeEveryOtherPost: false
    };

    handleDesignChange({
      openWalls: {
        ...currentConfig,
        [key]: value
      }
    });
  };
  const [gableAccent, setGableAccent] = useState<string>(design.gableAccent ? 'Yes' : 'No');
  const [gableAccentEndWallC, setGableAccentEndWallC] = useState<string>(design.gableAccentEndWallC ? 'Yes' : 'No');
  const [gableAccentEndWallD, setGableAccentEndWallD] = useState<string>(design.gableAccentEndWallD ? 'Yes' : 'No');
  const [gableAccentColor, setGableAccentColor] = useState<string>(design.gableAccentColor || 'white');
  const [showGableAccentColorModal, setShowGableAccentColorModal] = useState<boolean>(false);
  const [selectedColorForModal, setSelectedColorForModal] = useState<string>('');
  const [wainscot, setWainscot] = useState<string>(design.wainscot ? 'Yes' : 'No');
  const [wainscotSideWallA, setWainscotSideWallA] = useState<string>(design.wainscotSideWallA ? 'Yes' : 'No');
  const [wainscotSideWallB, setWainscotSideWallB] = useState<string>(design.wainscotSideWallB ? 'Yes' : 'No');
  const [wainscotEndWallC, setWainscotEndWallC] = useState<string>(design.wainscotEndWallC ? 'Yes' : 'No');
  const [wainscotEndWallD, setWainscotEndWallD] = useState<string>(design.wainscotEndWallD ? 'Yes' : 'No');
  const [wainscotSize, setWainscotSize] = useState<string>(design.wainscotHeight || '36 in');
  const [wainscotColor, setWainscotColor] = useState<string>(design.wainscotColor || 'white');
  const [showWainscotColorModal, setShowWainscotColorModal] = useState<boolean>(false);
  const [wallInsulation, setWallInsulation] = useState<string>(design.wallInsulation || 'None');
  const [wallCondensation, setWallCondensation] = useState<string>(design.wallCondensation || 'None');
  const [interiorWallLiner, setInteriorWallLiner] = useState<string>(design.interiorWallLiner || 'None');
  const [interiorWallLinerColor, setInteriorWallLinerColor] = useState<string>(design.interiorWallLinerColor || 'white');
  const [showInteriorWallLinerColorModal, setShowInteriorWallLinerColorModal] = useState(false);
  const [roofCondensation, setRoofCondensation] = useState<string>(design.roofCondensation || 'None');
  const [ceilingInsulation, setCeilingInsulation] = useState<string>(design.ceilingInsulation || 'None');
  const [ceilingLiner, setCeilingLiner] = useState<string>(design.ceilingLiner || 'None');
  const [ceilingLinerColor, setCeilingLinerColor] = useState<string>(design.ceilingLinerColor || 'white');
  const [showCeilingLinerColorModal, setShowCeilingLinerColorModal] = useState(false);
  const [ridgeOptions, setRidgeOptions] = useState<string>(design.ridgeOptions || 'Universal Ridge Cap');
  const [outsideClosure, setOutsideClosure] = useState<string>(design.outsideClosure || 'Standard Non-Vented');
  const [ridgeVentilation, setRidgeVentilation] = useState<string>(design.ridgeVentilation || 'None');
  const [gableVents, setGableVents] = useState<string>(design.gableVents || 'None');
  const [endCaps, setEndCaps] = useState<string>(design.endCaps || 'No');
  const [snowGuards, setSnowGuards] = useState<string>(design.snowGuards || 'No');
  const [skylights, setSkylights] = useState<string>(design.skylights || 'None');
  const [skylightQuantity, setSkylightQuantity] = useState<number>(design.skylightQuantity || 1);
  const [eaveLightA, setEaveLightA] = useState<string>(design.eaveLightA || 'None');
  const [eaveLightB, setEaveLightB] = useState<string>(design.eaveLightB || 'None');
  const [gutters, setGutters] = useState<string>(design.gutters || 'No');
  const [gutterColor, setGutterColor] = useState<string>(design.gutterColor || 'White');
  const [showGutterColorModal, setShowGutterColorModal] = useState(false);
  const [cupolas, setCupolas] = useState<string>(design.cupolas || 'None');

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

  // Save accessories to localStorage whenever they change
  useEffect(() => {
    const accessories = {
      eaveLightA,
      eaveLightB,
      wallInsulation,
      interiorWallLiner,
      ceilingInsulation,
      ceilingLiner,
      ridgeVentilation,
      gableVents,
      ridgeOptions,
      gutters,
      endCaps,
      snowGuards,
      skylights,
      skylightQuantity,
      cupolas,
      roofCondensation,
      outsideClosure,
      wallCondensation,
      gableAccent,
    };
    localStorage.setItem('buildingAccessories', JSON.stringify(accessories));

    // Update global design state
    onSubmit({
      ...currentDesign,
      ...accessories,
      gableAccent: accessories.gableAccent === 'Yes'
    } as BuildingDesign);
  }, [
    eaveLightA,
    eaveLightB,
    wallInsulation,
    interiorWallLiner,
    ceilingInsulation,
    ceilingLiner,
    ridgeVentilation,
    gableVents,
    ridgeOptions,
    gutters,
    endCaps,
    snowGuards,
    skylights,
    skylightQuantity,
    cupolas,
    roofCondensation,
    outsideClosure,
    wallCondensation,
    gableAccent,
  ]);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="w-full h-full p-2">
        <div className="grid grid-cols-12 gap-[10px] h-full">
          {/* Left Column - Options panel */}
          <div className="bg-white rounded-lg shadow-md p-4 col-span-12 lg:col-span-4 flex flex-col h-full overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Building Parameters
            </h2>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {/* Open Wall */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'openWall'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('openWall')}
              >
                <div className={`px-4 py-2 ${activeSection === 'openWall' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Open Wall</p>
                  <p className="text-xs text-gray-700">Add an open wall</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'openWall' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Add an open wall</span>
                    <select
                      value={openWall}
                      onChange={e => updateOpenWalls('isOpen', e.target.value === 'Yes')}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${openWall === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Show additional options only when "Yes" is selected */}
                  {openWall === 'Yes' && (
                    <>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Open Side Wall A</span>
                        <select
                          value={openSideWallA}
                          onChange={e => updateOpenWalls('sideWallA', e.target.value === 'Yes')}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${openSideWallA === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Open Side Wall B</span>
                        <select
                          value={openSideWallB}
                          onChange={e => updateOpenWalls('sideWallB', e.target.value === 'Yes')}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${openSideWallB === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Open End Wall C</span>
                        <select
                          value={openEndWallC}
                          onChange={e => updateOpenWalls('endWallC', e.target.value === 'Yes')}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${openEndWallC === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Open End Wall D</span>
                        <select
                          value={openEndWallD}
                          onChange={e => updateOpenWalls('endWallD', e.target.value === 'Yes')}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${openEndWallD === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Remove every other post</span>
                        <select
                          value={removeEveryOtherPost}
                          onChange={e => updateOpenWalls('removeEveryOtherPost', e.target.value === 'Yes')}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${removeEveryOtherPost === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Gable Accent */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'gableAccent'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('gableAccent')}
              >
                <div className={`px-4 py-2 ${activeSection === 'gableAccent' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Gable Accent</p>
                  <p className="text-xs text-gray-700">Add Gable Accent</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'gableAccent' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Add Gable Accent</span>
                    <select
                      value={gableAccent}
                      onChange={e => {
                        const val = e.target.value;
                        setGableAccent(val);
                        handleDesignChange({ gableAccent: val === 'Yes' });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${gableAccent === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Show additional options only when "Yes" is selected */}
                  {gableAccent === 'Yes' && (
                    <>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">End Wall C</span>
                        <select
                          value={gableAccentEndWallC}
                          onChange={e => {
                            const val = e.target.value;
                            setGableAccentEndWallC(val);
                            handleDesignChange({ gableAccentEndWallC: val === 'Yes' });
                          }}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${gableAccentEndWallC === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">End Wall D</span>
                        <select
                          value={gableAccentEndWallD}
                          onChange={e => {
                            const val = e.target.value;
                            setGableAccentEndWallD(val);
                            handleDesignChange({ gableAccentEndWallD: val === 'Yes' });
                          }}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${gableAccentEndWallD === 'Yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Choose gable accent color</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedColorForModal(gableAccentColor || '');
                              setShowGableAccentColorModal(true);
                            }}
                            className={`flex-1 px-3 py-2 border rounded-md text-sm text-left ${gableAccentColor ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                              }`}
                          >
                            {trimColors.find(c => c.value === gableAccentColor)?.label || 'Select color'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedColorForModal(gableAccentColor || '');
                              setShowGableAccentColorModal(true);
                            }}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            style={{
                              backgroundColor: trimColors.find(c => c.value === gableAccentColor)?.hex || '#808080'
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Wainscot */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'wainscot'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('wainscot')}
              >
                <div className={`px-4 py-2 ${activeSection === 'wainscot' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Wainscot</p>
                  <p className="text-xs text-gray-700">Add wainscoting</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'wainscot' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Add wainscoting</span>
                    <select
                      value={wainscot}
                      onChange={e => {
                        const val = e.target.value;
                        setWainscot(val);
                        handleDesignChange({ wainscot: val === 'Yes' });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${wainscot ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Show additional options only when "Yes" is selected */}
                  {wainscot === 'Yes' && (
                    <>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Side Wall A</span>
                        <select
                          value={wainscotSideWallA}
                          onChange={e => {
                            const val = e.target.value;
                            setWainscotSideWallA(val);
                            handleDesignChange({ wainscotSideWallA: val === 'Yes' });
                          }}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${wainscotSideWallA ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Side Wall B</span>
                        <select
                          value={wainscotSideWallB}
                          onChange={e => {
                            const val = e.target.value;
                            setWainscotSideWallB(val);
                            handleDesignChange({ wainscotSideWallB: val === 'Yes' });
                          }}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${wainscotSideWallB ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">End Wall C</span>
                        <select
                          value={wainscotEndWallC}
                          onChange={e => {
                            const val = e.target.value;
                            setWainscotEndWallC(val);
                            handleDesignChange({ wainscotEndWallC: val === 'Yes' });
                          }}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${wainscotEndWallC ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">End Wall D</span>
                        <select
                          value={wainscotEndWallD}
                          onChange={e => {
                            const val = e.target.value;
                            setWainscotEndWallD(val);
                            handleDesignChange({ wainscotEndWallD: val === 'Yes' });
                          }}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${wainscotEndWallD ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Choose wainscot size</span>
                        <select
                          value={wainscotSize}
                          onChange={e => {
                            const val = e.target.value;
                            setWainscotSize(val);
                            handleDesignChange({ wainscotHeight: val });
                          }}
                          className={`w-full px-3 py-2 border rounded-md text-sm ${wainscotSize ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                            }`}
                        >
                          <option value="24 in">24 in</option>
                          <option value="30 in">30 in</option>
                          <option value="36 in">36 in</option>
                          <option value="42 in">42 in</option>
                          <option value="48 in">48 in</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs text-gray-700 block mb-2">Choose wainscot color</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedColorForModal(wainscotColor || '');
                              setShowWainscotColorModal(true);
                            }}
                            className={`flex-1 px-3 py-2 border rounded-md text-sm text-left ${wainscotColor ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                              }`}
                          >
                            {trimColors.find(c => c.value === wainscotColor)?.label || 'Select color'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedColorForModal(wainscotColor || '');
                              setShowWainscotColorModal(true);
                            }}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            style={{
                              backgroundColor: trimColors.find(c => c.value === wainscotColor)?.hex || '#808080'
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Wall Insulation */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'wallInsulation'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('wallInsulation')}
              >
                <div className={`px-4 py-4 ${activeSection === 'wallInsulation' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Wall Insulation</p>
                    <p className="text-xs text-gray-700 mb-3">Select type of wall insulation</p>
                    <select
                      value={wallInsulation}
                      onChange={e => setWallInsulation(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${wallInsulation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="6&quot; Batt 23&quot;">6&quot; Batt 23&quot;</option>
                      <option value="4' Wide Roll">4' Wide Roll</option>
                      <option value="6' Wide Roll">6' Wide Roll</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Wall Condensation Control */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'wallCondensation'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('wallCondensation')}
              >
                <div className={`px-4 py-4 ${activeSection === 'wallCondensation' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Wall Condensation Control</p>
                    <p className="text-xs text-gray-700 mb-3">Select type</p>
                    <select
                      value={wallCondensation}
                      onChange={e => setWallCondensation(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${wallCondensation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="Block-It House Wrap">Block-It House Wrap</option>
                      <option value="Reflectix Single Bubble Insulation">Reflectix Single Bubble Insulation</option>
                      <option value="Pro-Therm Condensation Blanket">Pro-Therm Condensation Blanket</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Interior Wall Liner */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'interiorWallLiner'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('interiorWallLiner')}
              >
                <div className={`px-4 py-4 ${activeSection === 'interiorWallLiner' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Interior Wall Liner</p>
                    <p className="text-xs text-gray-700 mb-3">Select type of wall liner</p>
                    <select
                      value={interiorWallLiner}
                      onChange={e => {
                        setInteriorWallLiner(e.target.value);
                        handleDesignChange({ interiorWallLiner: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${interiorWallLiner && interiorWallLiner !== 'None' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="ProRib">ProRib</option>
                      <option value="Dura Panel">Dura Panel</option>
                      <option value="Acoustical Liner">Acoustical Liner</option>
                    </select>

                    {interiorWallLiner && interiorWallLiner !== 'None' && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-700 mb-1">Select liner color</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedColorForModal(interiorWallLinerColor || '');
                              setShowInteriorWallLinerColorModal(true);
                            }}
                            className="flex-1 px-3 py-2 text-left border rounded-md text-sm bg-white hover:bg-gray-50 flex items-center justify-between group"
                          >
                            <span>
                              {trimColors.find(c => c.value === interiorWallLinerColor)?.label || 'Select color'}
                            </span>
                            <span className="text-gray-400 group-hover:text-gray-600">▼</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedColorForModal(interiorWallLinerColor || '');
                              setShowInteriorWallLinerColorModal(true);
                            }}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            style={{
                              backgroundColor: trimColors.find(c => c.value === interiorWallLinerColor)?.hex || '#FFFFFF'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Roof Condensation Control */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'roofCondensation'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('roofCondensation')}
              >
                <div className={`px-4 py-4 ${activeSection === 'roofCondensation' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Roof Condensation Control</p>
                    <p className="text-xs text-gray-700 mb-3">Select type</p>
                    <select
                      value={roofCondensation}
                      onChange={e => setRoofCondensation(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${roofCondensation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="Reflectix Bubble Insulation">Reflectix Bubble Insulation</option>
                      <option value="Pro-Therm Condensation Blanket">Pro-Therm Condensation Blanket</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ceiling Insulation */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'ceilingInsulation'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('ceilingInsulation')}
              >
                <div className={`px-4 py-4 ${activeSection === 'ceilingInsulation' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Ceiling Insulation</p>
                    <p className="text-xs text-gray-700 mb-3">Select type of ceiling insulation</p>
                    <select
                      value={ceilingInsulation}
                      onChange={e => setCeilingInsulation(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${ceilingInsulation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="4&quot; Fiberglass Blow In (R-11)">4&quot; Fiberglass Blow In (R-11)</option>
                      <option value="4.75&quot; Fiberglass Blow In (R-13)">4.75&quot; Fiberglass Blow In (R-13)</option>
                      <option value="6.75&quot; Fiberglass Blow In (R-19)">6.75&quot; Fiberglass Blow In (R-19)</option>
                      <option value="7.75&quot; Fiberglass Blow In (R-22)">7.75&quot; Fiberglass Blow In (R-22)</option>
                      <option value="9.125&quot; Fiberglass Blow In (R-26)">9.125&quot; Fiberglass Blow In (R-26)</option>
                      <option value="10.375&quot; Fiberglass Blow In (R-30)">10.375&quot; Fiberglass Blow In (R-30)</option>
                      <option value="13&quot; Fiberglass Blow In (R-38)">13&quot; Fiberglass Blow In (R-38)</option>
                      <option value="14.875&quot; Fiberglass Blow In (R-44)">14.875&quot; Fiberglass Blow In (R-44)</option>
                      <option value="16.375&quot; Fiberglass Blow In (R-49)">16.375&quot; Fiberglass Blow In (R-49)</option>
                      <option value="19.75&quot; Fiberglass Blow In (R-60)">19.75&quot; Fiberglass Blow In (R-60)</option>
                      <option value="6&quot; Batt (R-19)">6&quot; Batt (R-19)</option>
                      <option value="10&quot; Batt (R-30)">10&quot; Batt (R-30)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ceiling Liner */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'ceilingLiner'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('ceilingLiner')}
              >
                <div className={`px-4 py-4 ${activeSection === 'ceilingLiner' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Ceiling Liner</p>
                    <p className="text-xs text-gray-700 mb-3">Select type of ceiling liner</p>
                    <select
                      value={ceilingLiner}
                      onChange={e => {
                        setCeilingLiner(e.target.value);
                        handleDesignChange({ ceilingLiner: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${ceilingLiner && ceilingLiner !== 'None' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="ProRib">ProRib</option>
                      <option value="Dura Panel">Dura Panel</option>
                      <option value="Acoustical Liner">Acoustical Liner</option>
                    </select>

                    {ceilingLiner && ceilingLiner !== 'None' && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-700 mb-1">Select liner color</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedColorForModal(ceilingLinerColor || '');
                              setShowCeilingLinerColorModal(true);
                            }}
                            className="flex-1 px-3 py-2 text-left border rounded-md text-sm bg-white hover:bg-gray-50 flex items-center justify-between group"
                          >
                            <span>
                              {trimColors.find(c => c.value === ceilingLinerColor)?.label || 'Select color'}
                            </span>
                            <span className="text-gray-400 group-hover:text-gray-600">▼</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedColorForModal(ceilingLinerColor || '');
                              setShowCeilingLinerColorModal(true);
                            }}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            style={{
                              backgroundColor: trimColors.find(c => c.value === ceilingLinerColor)?.hex || '#FFFFFF'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ridge Options */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'ridgeOptions'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('ridgeOptions')}
              >
                <div className={`px-4 py-4 ${activeSection === 'ridgeOptions' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Ridge Options</p>
                    <p className="text-xs text-gray-700 mb-3">Select the type of ridge cap</p>
                    <select
                      value={ridgeOptions}
                      onChange={e => {
                        setRidgeOptions(e.target.value);
                        handleDesignChange({ ridgeOptions: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${ridgeOptions ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="Universal Ridge Cap">Universal Ridge Cap</option>
                      <option value="Pro-Sky Ridge Cap">Pro-Sky Ridge Cap</option>
                      <option value="Clear Polycarbonate Ridge Cap">Clear Polycarbonate Ridge Cap</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Outside Closure Strip */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'outsideClosure'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('outsideClosure')}
              >
                <div className={`px-4 py-4 ${activeSection === 'outsideClosure' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Outside Closure Strip</p>
                    <p className="text-xs text-gray-700 mb-3">Select outside closure strip</p>
                    <select
                      value={outsideClosure}
                      onChange={e => setOutsideClosure(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${outsideClosure ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="Standard Non-Vented">Standard Non-Vented</option>
                      <option value="Economy Vented">Economy Vented</option>
                      <option value="Premium Vented">Premium Vented</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ridge Ventilation */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'ridgeVentilation'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('ridgeVentilation')}
              >
                <div className={`px-4 py-4 ${activeSection === 'ridgeVentilation' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Ridge Ventilation</p>
                    <p className={`text-xs mb-2 italic ${currentDesign.roofColor === 'galvanized' ? 'text-red-600' : 'text-gray-600'}`}>This option cannot be changed when Steel Roof Panels option Galvanized is chosen</p>
                    <p className="text-xs text-gray-700 mb-3">Select quantity of ridge vents</p>
                    <select
                      value={ridgeVentilation}
                      onChange={e => {
                        setRidgeVentilation(e.target.value);
                        handleDesignChange({ ridgeVentilation: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${ridgeVentilation ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                      disabled={currentDesign.roofColor === 'galvanized'}
                    >
                      <option value="None">None</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Gable Vents */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'gableVents'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('gableVents')}
              >
                <div className={`px-4 py-4 ${activeSection === 'gableVents' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Gable Vents</p>
                    <p className={`text-xs mb-2 italic ${currentDesign.roofColor === 'galvanized' ? 'text-red-600' : 'text-gray-600'}`}>This option cannot be changed when Steel Roof Panels option Galvanized is chosen</p>
                    <p className="text-xs text-gray-700 mb-3">Select type of gable vents</p>
                    <select
                      value={gableVents}
                      onChange={e => {
                        setGableVents(e.target.value);
                        handleDesignChange({ gableVents: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${gableVents ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                      disabled={currentDesign.roofColor === 'galvanized'}
                    >
                      <option value="None">None</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* End Caps */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'endCaps'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('endCaps')}
              >
                <div className={`px-4 py-4 ${activeSection === 'endCaps' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">End Caps</p>
                    <p className="text-xs text-gray-700 mb-3">Add end caps</p>
                    <select
                      value={endCaps}
                      onChange={e => {
                        setEndCaps(e.target.value);
                        handleDesignChange({ endCaps: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${endCaps ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Snow Guards */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'snowGuards'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('snowGuards')}
              >
                <div className={`px-4 py-4 ${activeSection === 'snowGuards' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Snow Guards</p>
                    <p className="text-xs text-gray-700 mb-3">Add snow guards</p>
                    <select
                      value={snowGuards}
                      onChange={e => {
                        setSnowGuards(e.target.value);
                        handleDesignChange({ snowGuards: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${snowGuards ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skylights */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'skylights'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('skylights')}
              >
                <div className={`px-4 py-4 ${activeSection === 'skylights' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Skylights</p>
                    <p className="text-xs text-gray-700 mb-3">Skylight size</p>
                    <select
                      value={skylights}
                      onChange={e => {
                        setSkylights(e.target.value);
                        handleDesignChange({ skylights: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${skylights ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="7 ft">7 ft</option>
                      <option value="9 ft">9 ft</option>
                      <option value="11 ft">11 ft</option>
                    </select>

                    {skylights !== 'None' && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-700 mb-1">Select quantity</p>
                        <select
                          value={skylightQuantity}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            setSkylightQuantity(val);
                            handleDesignChange({ skylightQuantity: val });
                          }}
                          className="w-full px-3 py-2 border border-blue-500 bg-blue-50 rounded-md text-sm"
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Eave Light */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'eaveLight'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('eaveLight')}
              >
                <div className={`px-4 py-2 ${activeSection === 'eaveLight' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <p className="text-sm font-bold text-gray-900">Eave Light</p>
                  <p className="text-xs text-gray-700">Sidewall A and B eavelight</p>
                </div>
                <div className={`px-4 py-3 space-y-3 ${activeSection === 'eaveLight' ? 'bg-yellow-50' : 'bg-transparent'}`}>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Sidewall A eavelight</span>
                    <select
                      value={eaveLightA}
                      onChange={e => {
                        setEaveLightA(e.target.value);
                        handleDesignChange({ eaveLightA: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${eaveLightA ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="2ft">2ft</option>
                      <option value="3ft">3ft</option>
                      <option value="4ft">4ft</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-xs text-gray-700 block mb-2">Sidewall B eavelight</span>
                    <select
                      value={eaveLightB}
                      onChange={e => {
                        setEaveLightB(e.target.value);
                        handleDesignChange({ eaveLightB: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${eaveLightB ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="2ft">2ft</option>
                      <option value="3ft">3ft</option>
                      <option value="4ft">4ft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Gutters */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'gutters'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('gutters')}
              >
                <div className={`px-4 py-4 ${activeSection === 'gutters' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Gutters</p>
                    <p className="text-xs text-gray-600 mb-2 italic">This option cannot be changed when Overhangs option 0 ft is chosen</p>
                    <p className="text-xs text-gray-700 mb-3">Add gutters</p>
                    <select
                      value={gutters}
                      onChange={e => {
                        setGutters(e.target.value);
                        handleDesignChange({ gutters: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${gutters ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                      disabled={currentDesign.endWallOverhang === '0' && currentDesign.sidewallOverhang === '0'}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>

                    {gutters === 'Yes' && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-700 mb-1">Select gutter color</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedColorForModal(gutterColor || '');
                              setShowGutterColorModal(true);
                            }}
                            className="flex-1 px-3 py-2 text-left border rounded-md text-sm bg-white hover:bg-gray-50 flex items-center justify-between group"
                          >
                            <span>
                              {trimColors.find(c => c.value === gutterColor)?.label || 'Select color'}
                            </span>
                            <span className="text-gray-400 group-hover:text-gray-600">▼</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedColorForModal(gutterColor || '');
                              setShowGutterColorModal(true);
                            }}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                            style={{
                              backgroundColor: trimColors.find(c => c.value === gutterColor)?.hex || '#FFFFFF'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Cupolas */}
              <div
                className={`mb-3 cursor-pointer rounded-lg overflow-hidden transition-all ${activeSection === 'cupolas'
                  ? 'bg-yellow-100 border-2 border-yellow-300'
                  : 'bg-transparent border-0 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveSection('cupolas')}
              >
                <div className={`px-4 py-4 ${activeSection === 'cupolas' ? 'bg-yellow-200' : 'bg-transparent'}`}>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Cupolas</p>
                    <p className="text-xs text-gray-600 mb-2 italic">This option cannot be changed when Steel Wall Panels option Galvanized is chosen</p>
                    <p className="text-xs text-gray-700 mb-3">Select the size of cupolas</p>
                    <select
                      value={cupolas}
                      onChange={e => {
                        setCupolas(e.target.value);
                        handleDesignChange({ cupolas: e.target.value });
                      }}
                      className={`w-full px-3 py-2 border rounded-md text-sm ${cupolas ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                      <option value="None">None</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price + Tabs (Information / 3D) */}
          <div className="bg-white rounded-lg shadow-md p-4 col-span-12 lg:col-span-8 flex flex-col h-full overflow-hidden">
            {/* Tabs */}
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

            {/* Tab content */}
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
                          <span className="text-lg font-bold text-gray-900 align-baseline">
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
                  {activeSection === 'openWall' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Open Wall</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/open_wall.jpg"
                          alt="Open Wall - Sidewall and Endwall"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Create easy access to equipment</li>
                        <li>Economical option to protect/store items out of the weather</li>
                        <li>Create wider openings by removing every other post</li>
                        <li>Open wall four walls to create an open pavilion</li>
                        <li>Available on walls up to and including 16&apos; tall</li>
                        <li>Available on buildings up to and including 40&apos; wide</li>
                      </ul>
                    </div>
                  )}

                  {/* Gable Accent Section */}
                  {activeSection === 'gableAccent' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Gable Accent</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/gable-accent.png"
                          alt="Gable Accent"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside mb-4">
                        <li>An economical upgrade to your building.</li>
                        <li>Easy to install and improves the aesthetic appeal of your building.</li>
                      </ul>
                      <div className="mb-4">
                        <img
                          src="https://external-midwest.menards.com/postframe-web/web/img/canvas/building_walls_depiction.svg"
                          alt="Building Walls Depiction - Sidewall A, Sidewall B, Endwall C, Endwall D"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Wainscot Section */}
                  {activeSection === 'wainscot' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Wainscot</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/wainscot.jpg"
                          alt="Wainscot"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside mb-4">
                        <li>Most economical upgrade to building.</li>
                        <li>Easy to install and provides a modern look on your building.</li>
                      </ul>
                      <div className="mb-4">
                        <img
                          src="https://external-midwest.menards.com/postframe-web/web/img/canvas/building_walls_depiction.svg"
                          alt="Building Walls Depiction - Sidewall A, Sidewall B, Endwall C, Endwall D"
                          className="w-full h-auto max-h-48 object-contain rounded border border-gray-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Wall Insulation Section */}
                  {activeSection === 'wallInsulation' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Wall Insulation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {/* EcoBatt Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/wallInsulationBatt.jpg"
                            alt="EcoBatt Insulation"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">EcoBatt</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Insulation saves on heating and cooling costs and helps reduce noise</li>
                            <li>GREENGUARD gold certified to be formaldehyde free</li>
                            <li>Soft to the touch, easy to cut, and less itchy</li>
                            <li>Third-party certified to include a minimum of 50% post-consumer recycled content</li>
                            <li>Naturally brown, eco-friendly binder made from corn, sand, and recycled glass (no added dyes)</li>
                            <li>Provides superior thermal and sound control performance</li>
                            <li>Building is estimated with 2x6 horizontal girts between posts (bookshelf)</li>
                            <li>End walls include 2x4 exterior girts</li>
                          </ul>
                        </div>

                        {/* Roll Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/wallInsulationRollV2.jpg"
                            alt="Roll Insulation"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Roll</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Insulation saves on heating and cooling costs and helps reduce noise</li>
                            <li>Includes white poly vapor barrier to help control insulation</li>
                            <li>GREENGUARD gold certified to be formaldehyde free</li>
                            <li>Soft to the touch, easy to cut, and less itchy</li>
                            <li>Third-party certified to include a minimum of 50% post-consumer recycled content</li>
                            <li>Naturally brown, eco-friendly binder made from corn, sand, and recycled glass (no added dyes)</li>
                            <li>Building is estimated with Exterior girts selected and 2x4 interior girts</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wall Condensation Control Section */}
                  {activeSection === 'wallCondensation' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Wall Condensation Control</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {/* Block-It House Wrap Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/block-it-insulation.png"
                            alt="Block-It House Wrap"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Kimberly-Clark Block It House Wrap</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Most economical</li>
                            <li>Controls condensation in a post frame building</li>
                            <li>Used on roof and walls of a post frame building or just the roof to control condensation</li>
                          </ul>
                        </div>

                        {/* Reflectix Bubble Insulation Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/bubble-insulation.png"
                            alt="Reflectix Bubble Insulation"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Reflectix Bubble Insulation</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Controls condensation in a post frame building while also adding some R-value to the wall</li>
                            <li>Ideal choice for post frame buildings</li>
                            <li>R-2.8 Value</li>
                            <li>Most commonly used on roofs, but can be used on walls</li>
                          </ul>
                        </div>

                        {/* Pro-Therm Condensation Blanket Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/pro-therm-insulationV2.png"
                            alt="Pro-Therm Condensation Blanket"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Pro-Therm Condensation Blanket</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Durable white face acts as a vapor retarder and a liner</li>
                            <li>R-8 Value</li>
                            <li>No need for interior liner due to the white poly on blanket</li>
                            <li>Can be used on walls and roofs</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interior Wall Liner Section */}
                  {activeSection === 'interiorWallLiner' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Interior Wall Liner</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {/* Pro Rib Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/liner_pro-rib.jpg"
                            alt="Pro Rib"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Pro Rib</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Large color selection; 28 colors available</li>
                            <li>Lightweight</li>
                            <li>Heavy duty panel</li>
                          </ul>
                        </div>

                        {/* Dura Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/liner_dura-panel.jpg"
                            alt="Dura Panel"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Dura Panel</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Most economical</li>
                            <li>Lightweight</li>
                            <li>Galvanized or pre-finished white</li>
                          </ul>
                        </div>

                        {/* Acoustical Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/liner_acoustical.jpg"
                            alt="Acoustical Panel"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Acoustical Panel</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Sound deadening</li>
                            <li>Lightweight</li>
                            <li>Pre-finished white</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Roof Condensation Control Section */}
                  {activeSection === 'roofCondensation' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Roof Condensation Control</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {/* Reflectix Bubble Insulation Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/bubble-insulation.png"
                            alt="Reflectix Bubble Insulation"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Reflectix Bubble Insulation</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Controls condensation in a post frame building while also adding some R-value to the roof</li>
                            <li>Ideal choice for post frame buildings</li>
                            <li>R-2.8 Value</li>
                            <li>Most commonly used on roofs, but can be used on walls</li>
                          </ul>
                        </div>

                        {/* Pro-Therm Condensation Blanket Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/pro-therm-insulationV2.png"
                            alt="Pro-Therm Condensation Blanket"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Pro-Therm Condensation Blanket</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Durable white face acts as a vapor retarder and a liner</li>
                            <li>R-8 Value</li>
                            <li>No need for interior liner due to the white poly on blanket</li>
                            <li>Can be used on walls and roofs</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ceiling Insulation Section */}
                  {activeSection === 'ceilingInsulation' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Ceiling Insulation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {/* Blow-In Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/ceiling-insulation-blow.jpg"
                            alt="Blow-In Insulation"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Blow-In</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Lightest insulation per cubic foot</li>
                            <li>Add insulation to R-value desired</li>
                            <li>Quick install</li>
                          </ul>
                        </div>

                        {/* Batt Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/wallInsulationBatt.jpg"
                            alt="Batt Insulation"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Batt</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>No special equipment needed</li>
                            <li>No settling</li>
                            <li>Great for climate controlled buildings</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ceiling Liner Section */}
                  {activeSection === 'ceilingLiner' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Ceiling Liner</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {/* Pro Rib Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/liner_pro-rib.jpg"
                            alt="Pro Rib"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Pro Rib</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Large color selection; 28 colors available</li>
                            <li>Lightweight</li>
                            <li>Heavy duty panel</li>
                          </ul>
                        </div>

                        {/* Dura Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/liner_dura-panel.jpg"
                            alt="Dura Panel"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Dura Panel</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Most economical</li>
                            <li>Lightweight</li>
                            <li>Galvanized or pre-finished white</li>
                          </ul>
                        </div>

                        {/* Acoustical Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/liner_acoustical.jpg"
                            alt="Acoustical Panel"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Acoustical Panel</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Sound deadening</li>
                            <li>Lightweight</li>
                            <li>Pre-finished white</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ridge Options Section */}
                  {activeSection === 'ridgeOptions' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Ridge Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        {/* Universal Ridge Cap Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/ridge_universal.jpg"
                            alt="Universal Ridge Cap"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Universal</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Color matched to steel panels and trims</li>
                            <li>Provides coverage at the building peak</li>
                            <li>Designed to work with all closure strips</li>
                          </ul>
                        </div>

                        {/* Pro-Sky Ridge Cap Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/ridge_pro-sky.jpg"
                            alt="Pro-Sky Ridge Cap"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Pro-Sky</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Allows natural light in along building peak</li>
                            <li>Designed to work with all closure strips</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Outside Closure Strip Section */}
                  {activeSection === 'outsideClosure' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Outside Closure Strip</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {/* Standard Non-Vented Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/outside-closure-strip-non-vented.jpg"
                            alt="Standard Non-Vented Closure Strip"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Standard Non-Vented</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Provides continuous seal at the ridge against weather and pest infiltration</li>
                            <li>Profile matched to work with steel panels</li>
                            <li>Non-vented</li>
                          </ul>
                        </div>

                        {/* Economy Vented Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/outside-closure-strip-economy-vented.jpg"
                            alt="Economy Vented Closure Strip"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Economy Vented</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Provides ventilation at the ridge</li>
                            <li>Prevents against weather and pest infiltration at the ridge</li>
                            <li>Profile matched to work with steel panels</li>
                            <li>Good choice for climate controlled buildings by allowing for air exchange</li>
                          </ul>
                        </div>

                        {/* Premium Vented Panel */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                          <img
                            src="/assets/outside-closure-strip-premium-vented.jpg"
                            alt="Premium Vented Closure Strip"
                            className="w-full h-auto max-h-64 object-contain rounded border border-gray-300 mb-4"
                          />
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 text-center">Premium Vented</h4>
                          <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                            <li>Provides greater volume of air exchange than economy closure strips</li>
                            <li>Prevents against weather and pest infiltration at the ridge</li>
                            <li>Profile matched to work with steel panels</li>
                            <li>Best choice for climate controlled buildings by allowing for greater air exchange</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ridge Ventilation Section */}
                  {activeSection === 'ridgeVentilation' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Ridge Ventilation</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/ridge_ventilation.jpg"
                          alt="Ridge Ventilation"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Up to 1000 CFM of air exhaust with adequate air in flow</li>
                        <li>Allows natural lighting along ridge through the use of special louvers that keep rain and snow out</li>
                        <li>Splice plate and end flashing included</li>
                      </ul>
                    </div>
                  )}

                  {/* Gable Vents Section */}
                  {activeSection === 'gableVents' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Gable Vents</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/gable_vent.jpg"
                          alt="Gable Vents"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Allows additional air flow on gable ends</li>
                        <li>Two sizes available</li>
                        <li>Preformed nailing fin</li>
                        <li>All steel construction</li>
                      </ul>
                    </div>
                  )}

                  {/* End Caps Section */}
                  {activeSection === 'endCaps' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">End Caps</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/end_cap.jpg"
                          alt="End caps covering gable trim at the peak"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Used to cover gable trim connection at the peak.</li>
                      </ul>
                    </div>
                  )}

                  {/* Snow Guards Section */}
                  {activeSection === 'snowGuards' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Snow Guards</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/snow_guard.jpg"
                          alt="Snow guards sealing gable ends without overhangs"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Seals off gable ends of buildings with no gable overhangs.</li>
                        <li>Prevents snow and water from blowing around gable trim and leaking inside.</li>
                      </ul>
                    </div>
                  )}

                  {/* Skylights Section */}
                  {activeSection === 'skylights' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Skylights</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/skylights.jpg"
                          alt="Skylights installed on roof"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>20x stronger than 5oz fiberglass panels.</li>
                        <li>Same panel configuration as Pro-Rib and Premium Pro-Rib steel panels.</li>
                        <li>Highest light transmission available.</li>
                      </ul>
                    </div>
                  )}

                  {/* Eave Light Section */}
                  {activeSection === 'eaveLight' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3">Eave Light</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/eave_light.jpg"
                          alt="Eave light panels along sidewall"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Allows natural light along the eave of a building.</li>
                        <li>Highest light transmission available.</li>
                        <li>20x stronger than 5oz fiberglass.</li>
                        <li>Economical lighting choice versus running electrical.</li>
                      </ul>
                    </div>
                  )}

                  {/* Gutters Section */}
                  {activeSection === 'gutters' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3 text-center">Gutters</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/gutters.jpg"
                          alt="Steel gutters installed on roof edge"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>6&quot; gutters provide superior drainage.</li>
                        <li>Steel gutters are stronger and more durable to snow and ice.</li>
                        <li>Color matched to the steel panels and trims.</li>
                        <li>Provides proper water drainage away from your building.</li>
                      </ul>
                    </div>
                  )}

                  {/* Cupolas Section */}
                  {activeSection === 'cupolas' && (
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-gray-900 mb-3 text-center">Cupolas</h3>
                      <div className="mb-4">
                        <img
                          src="/assets/cupola.jpg"
                          alt="Cupola with weathervane"
                          className="w-full h-auto max-h-96 object-contain rounded border border-gray-300 mb-4"
                        />
                      </div>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Adds increased ventilation at your ridge.</li>
                        <li>Great way to add character to your building.</li>
                        <li>The cupola colors will match your building colors.</li>
                        <li>Two sizes available with built in threaded connector to add a weathervane.</li>
                        <li>Large selection of weathervane patterns available.</li>
                        <li>Personalize your building with a weathervane that matches your interests.</li>
                      </ul>
                    </div>
                  )}

                  {/* Add more sections for other options as needed */}
                  {activeSection !== 'openWall' && activeSection !== 'gableAccent' && activeSection !== 'wainscot' && activeSection !== 'wallInsulation' && activeSection !== 'wallCondensation' && activeSection !== 'interiorWallLiner' && activeSection !== 'roofCondensation' && activeSection !== 'ceilingInsulation' && activeSection !== 'ceilingLiner' && activeSection !== 'ridgeOptions' && activeSection !== 'outsideClosure' && activeSection !== 'ridgeVentilation' && activeSection !== 'gableVents' && activeSection !== 'endCaps' && activeSection !== 'snowGuards' && activeSection !== 'skylights' && activeSection !== 'eaveLight' && activeSection !== 'gutters' && activeSection !== 'cupolas' && (
                    <div className="mb-4">
                      {(() => {
                        if (typeof activeSection !== 'string') return null;
                        const sectionName: string = activeSection;
                        const label =
                          sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace(/([A-Z])/g, ' $1');
                        return <h3 className="text-base font-bold text-gray-900 mb-3">{label}</h3>;
                      })()}
                      <p className="text-sm text-gray-700">
                        Information about this option will be displayed here.
                      </p>
                    </div>
                  )}
                </>
              )}

              {infoTab === '3d' && (
                <div className="h-full">
                  <Building3D design={currentDesign} />
                </div>
              )}
            </div>
            {/* Bottom actions (Next button) */}
            {onNext && (
              <div className="mt-4 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onNext) {
                      onNext();
                    }
                  }}
                  className="px-4 py-1.5 rounded-md font-semibold text-white transition-colors text-sm bg-green-600 hover:bg-green-700"
                >
                  Next: Leans & Openings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gable Accent Color Selection Modal - Slides in from left */}
      {showGableAccentColorModal && (
        <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            {/* Green Banner */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold">Choose gable accent color</h2>
              <button
                onClick={() => {
                  setShowGableAccentColorModal(false);
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
                  ? trimColors.find(c => c.value === selectedColorForModal)?.label ||
                  (selectedColorForModal === 'galvanized' ? 'Galvanized' : 'Select a color')
                  : trimColors.find(c => c.value === gableAccentColor)?.label || 'Select a color'}
              </p>
              <div
                className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                style={{
                  backgroundImage: selectedColorForModal
                    ? (getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || ''))
                      ? `url(${getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                      : undefined
                    : (getColorImagePath(gableAccentColor || 'white', trimColors.find(c => c.value === gableAccentColor)?.label || 'White'))
                      ? `url(${getColorImagePath(gableAccentColor || 'white', trimColors.find(c => c.value === gableAccentColor)?.label || 'White')})`
                      : undefined,
                  backgroundPosition: 'center center',
                  backgroundSize: '100% 100%',
                  backgroundOrigin: 'border-box',
                  backgroundColor: selectedColorForModal
                    ? trimColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                    : trimColors.find(c => c.value === gableAccentColor)?.hex || '#FFFFFF'
                }}
              />
              <button
                onClick={() => {
                  if (selectedColorForModal) {
                    // Handle special cases
                    let colorToSave = selectedColorForModal;
                    if (selectedColorForModal === 'galvanized') {
                      colorToSave = 'gray'; // Use gray as fallback for galvanized
                    }

                    setGableAccentColor(colorToSave);
                    handleDesignChange({ gableAccentColor: colorToSave });
                  }
                  setShowGableAccentColorModal(false);
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

      {/* Wainscot Color Selection Modal - Slides in from left */}
      {showWainscotColorModal && (
        <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            {/* Green Banner */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold">Choose wainscot color</h2>
              <button
                onClick={() => {
                  setShowWainscotColorModal(false);
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
                  ? trimColors.find(c => c.value === selectedColorForModal)?.label ||
                  (selectedColorForModal === 'galvanized' ? 'Galvanized' : 'Select a color')
                  : trimColors.find(c => c.value === wainscotColor)?.label || 'Select a color'}
              </p>
              <div
                className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                style={{
                  backgroundImage: selectedColorForModal
                    ? (getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || ''))
                      ? `url(${getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                      : undefined
                    : (getColorImagePath(wainscotColor || 'white', trimColors.find(c => c.value === wainscotColor)?.label || 'White'))
                      ? `url(${getColorImagePath(wainscotColor || 'white', trimColors.find(c => c.value === wainscotColor)?.label || 'White')})`
                      : undefined,
                  backgroundPosition: 'center center',
                  backgroundSize: '100% 100%',
                  backgroundOrigin: 'border-box',
                  backgroundColor: selectedColorForModal
                    ? trimColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                    : trimColors.find(c => c.value === wainscotColor)?.hex || '#FFFFFF'
                }}
              />
              <button
                onClick={() => {
                  if (selectedColorForModal) {
                    // Handle special cases
                    let colorToSave = selectedColorForModal;
                    if (selectedColorForModal === 'galvanized') {
                      colorToSave = 'gray'; // Use gray as fallback for galvanized
                    }

                    setWainscotColor(colorToSave);
                    handleDesignChange({ wainscotColor: colorToSave });
                  }
                  setShowWainscotColorModal(false);
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
      {/* Interior Wall Liner Color Selection Modal - Slides in from left */}
      {showInteriorWallLinerColorModal && (
        <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            {/* Green Banner */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold">Choose liner color</h2>
              <button
                onClick={() => {
                  setShowInteriorWallLinerColorModal(false);
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
                  : trimColors.find(c => c.value === interiorWallLinerColor)?.label || 'Select a color'}
              </p>
              <div
                className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                style={{
                  backgroundImage: selectedColorForModal
                    ? (getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || ''))
                      ? `url(${getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                      : undefined
                    : (getColorImagePath(interiorWallLinerColor || 'white', trimColors.find(c => c.value === interiorWallLinerColor)?.label || 'White'))
                      ? `url(${getColorImagePath(interiorWallLinerColor || 'white', trimColors.find(c => c.value === interiorWallLinerColor)?.label || 'White')})`
                      : undefined,
                  backgroundPosition: 'center center',
                  backgroundSize: '100% 100%',
                  backgroundOrigin: 'border-box',
                  backgroundColor: selectedColorForModal
                    ? trimColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                    : trimColors.find(c => c.value === interiorWallLinerColor)?.hex || '#FFFFFF'
                }}
              />
              <button
                onClick={() => {
                  if (selectedColorForModal) {
                    setInteriorWallLinerColor(selectedColorForModal);
                    handleDesignChange({ interiorWallLinerColor: selectedColorForModal });
                  }
                  setShowInteriorWallLinerColorModal(false);
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
                {/* Standard Colors (Same as Wainscot/Trim) */}
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
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Ceiling Liner Color Selection Modal - Slides in from left */}
      {showCeilingLinerColorModal && (
        <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            {/* Green Banner */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold">Choose ceiling liner color</h2>
              <button
                onClick={() => {
                  setShowCeilingLinerColorModal(false);
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
                  : trimColors.find(c => c.value === ceilingLinerColor)?.label || 'Select a color'}
              </p>
              <div
                className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                style={{
                  backgroundImage: selectedColorForModal
                    ? (getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || ''))
                      ? `url(${getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                      : undefined
                    : (getColorImagePath(ceilingLinerColor || 'white', trimColors.find(c => c.value === ceilingLinerColor)?.label || 'White'))
                      ? `url(${getColorImagePath(ceilingLinerColor || 'white', trimColors.find(c => c.value === ceilingLinerColor)?.label || 'White')})`
                      : undefined,
                  backgroundPosition: 'center center',
                  backgroundSize: '100% 100%',
                  backgroundOrigin: 'border-box',
                  backgroundColor: selectedColorForModal
                    ? trimColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                    : trimColors.find(c => c.value === ceilingLinerColor)?.hex || '#FFFFFF'
                }}
              />
              <button
                onClick={() => {
                  if (selectedColorForModal) {
                    setCeilingLinerColor(selectedColorForModal);
                    handleDesignChange({ ceilingLinerColor: selectedColorForModal });
                  }
                  setShowCeilingLinerColorModal(false);
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
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Gutter Color Selection Modal - Slides in from left */}
      {showGutterColorModal && (
        <div className="fixed left-0 top-0 h-full w-[350px] z-50 transform transition-transform duration-300 ease-in-out translate-x-0" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white h-full shadow-2xl border-r border-gray-200 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
            {/* Green Banner */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold">Choose gutter color</h2>
              <button
                onClick={() => {
                  setShowGutterColorModal(false);
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
                  ? trimColors.find(c => c.value === selectedColorForModal)?.label ||
                  (selectedColorForModal === 'galvanized' ? 'Galvanized' : 'Select a color')
                  : trimColors.find(c => c.value === gutterColor)?.label || 'Select a color'}
              </p>
              <div
                className="w-full h-24 rounded border-2 border-gray-300 mb-4"
                style={{
                  backgroundImage: selectedColorForModal
                    ? (getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || ''))
                      ? `url(${getColorImagePath(selectedColorForModal, trimColors.find(c => c.value === selectedColorForModal)?.label || '')})`
                      : undefined
                    : (getColorImagePath(gutterColor || 'white', trimColors.find(c => c.value === gutterColor)?.label || 'White'))
                      ? `url(${getColorImagePath(gutterColor || 'white', trimColors.find(c => c.value === gutterColor)?.label || 'White')})`
                      : undefined,
                  backgroundPosition: 'center center',
                  backgroundSize: '100% 100%',
                  backgroundOrigin: 'border-box',
                  backgroundColor: selectedColorForModal
                    ? trimColors.find(c => c.value === selectedColorForModal)?.hex || '#FFFFFF'
                    : trimColors.find(c => c.value === gutterColor)?.hex || '#FFFFFF'
                }}
              />
              <button
                onClick={() => {
                  if (selectedColorForModal) {
                    // Handle special cases
                    let colorToSave = selectedColorForModal;
                    if (selectedColorForModal === 'galvanized') {
                      colorToSave = 'gray'; // Use gray as fallback for galvanized
                    }

                    setGutterColor(colorToSave);
                    handleDesignChange({ gutterColor: colorToSave });
                  }
                  setShowGutterColorModal(false);
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
    </div >
  );
}
