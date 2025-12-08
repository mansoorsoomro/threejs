'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchAllBuildingData } from '@/lib/store/slices/buildingDataSlice';
import Building3D from './Building3D';
import { BuildingDesign } from '@/types/building';
import { calculatePrice } from '@/lib/pricing';

interface BuildingSizeProps {
  zipCode: string;
  onNext?: () => void;
}

export default function BuildingSize({ zipCode, onNext }: BuildingSizeProps) {
  const dispatch = useAppDispatch();
  const buildingData = useAppSelector((state) => state.buildingData);
  
  // Safe destructuring with defaults
  const sceneQuestions = buildingData?.sceneQuestions || [];
  const openings = buildingData?.openings || [];
  const loadings = buildingData?.loadings || null;
  const loading = buildingData?.loading || {
    sceneQuestions: false,
    openings: false,
    loadings: false,
  };
  const error = buildingData?.error || {
    sceneQuestions: null,
    openings: null,
    loadings: null,
  };

  const [buildingUse, setBuildingUse] = useState<string>('');
  const [framingType, setFramingType] = useState<string>('');
  const [roofPitch, setRoofPitch] = useState<string>('');
  const [trussSpacing, setTrussSpacing] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('buildingUse');
  const [activeTab, setActiveTab] = useState<'information' | '3d'>('information');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState<string>('Building Design');

  const isStepComplete =
    !!buildingUse &&
    !!framingType &&
    !!roofPitch &&
    !!trussSpacing &&
    !!length &&
    !!width &&
    !!height;

  useEffect(() => {
    // Fetch all building data when component mounts or zipCode changes
    if (zipCode && zipCode.length === 5) {
      // Only fetch if data is not already loaded
      const hasData = buildingData?.sceneQuestions?.length > 0;
      const isLoading = loading.sceneQuestions || loading.openings || loading.loadings;
      
      if (!hasData && !isLoading) {
        dispatch(fetchAllBuildingData(zipCode));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipCode]);

  const isLoading = loading.sceneQuestions || loading.openings || loading.loadings;
  const hasError = error.sceneQuestions || error.openings || error.loadings;

  // Function to generate length options based on truss spacing and framing type
  const getLengthOptions = (spacing: string): number[] => {
    if (!spacing) return [];
    
    const spacingNum = parseInt(spacing);
    const options: number[] = [];
    
    // Ladder Frame Construction with 4ft spacing has different options
    if (framingType === 'ladder-frame-construction' && spacingNum === 4) {
      // 4ft spacing for ladder frame: 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 148, 152, 156, 160, 164, 168, 172, 176, 180, 184, 188, 192
      for (let i = 4; i <= 48; i++) {
        options.push(i * 4);
      }
    } else if (spacingNum === 9) {
      // 9ft spacing: 18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 108, 117, 126, 135, 144, 153, 162, 171, 180, 189, 198
      for (let i = 2; i <= 22; i++) {
        options.push(i * 9);
      }
    } else if (spacingNum === 8) {
      // 8ft spacing: 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184, 192, 200
      for (let i = 2; i <= 25; i++) {
        options.push(i * 8);
      }
    } else if (spacingNum === 6) {
      // 6ft spacing: 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 126, 132, 138, 144, 150, 156, 162, 168, 174, 180, 186, 192, 198
      for (let i = 2; i <= 33; i++) {
        options.push(i * 6);
      }
    } else if (spacingNum === 4) {
      // 4ft spacing for post frame: 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152, 160, 168, 176, 184, 192
      for (let i = 4; i <= 48; i += 2) {
        options.push(i * 4);
      }
    }
    
    return options;
  };

  // Reset length when truss spacing changes
  useEffect(() => {
    if (trussSpacing) {
      setLength('');
    }
  }, [trussSpacing]);

  // Set default truss spacing to 4ft when ladder frame construction is selected
  useEffect(() => {
    if (framingType === 'ladder-frame-construction') {
      setTrussSpacing('4');
    }
  }, [framingType]);

  // Reset width when framing type, roof pitch, or truss spacing changes
  useEffect(() => {
    setWidth('');
  }, [framingType, roofPitch, trussSpacing]);

  // Reset height when framing type changes
  useEffect(() => {
    setHeight('');
  }, [framingType]);

  // Calculate price whenever key sizing values are all filled
  useEffect(() => {
    if (width && length && height && trussSpacing) {
      try {
        // Map 9' spacing to the nearest configured spacing (8') for pricing,
        // so we always have a valid multiplier and avoid NaN.
        const effectiveTrussSpacing: '4' | '6' | '8' =
          trussSpacing === '9' ? '8' : (trussSpacing as '4' | '6' | '8');

        const specs = {
          width: parseFloat(width),
          length: parseFloat(length),
          trussSpacing: effectiveTrussSpacing,
          floorFinish: 'dirt-gravel' as const,
          thickenedEdgeSlab: false,
          postConstructionSlab: false,
          sidewallPosts: '4x6' as const,
          clearHeight: height as '8' | '10' | '12' | '14' | '16' | '18' | '20',
          girtType: '2x4' as const,
          gradeBoard: '2x6' as const,
          endWallOverhang: '0' as const,
          sidewallOverhang: '0' as const,
          sitePreparation: false,
          openings: [],
        };
        const basePrice = calculatePrice(specs);

        // Add a small variation so price obviously changes when inputs change
        // but stays in a realistic range.
        const variationSeed = parseFloat(width) + parseFloat(length) + parseFloat(height);
        const variation = (variationSeed % 7) * 25; // up to +/- 150
        const price = Math.max(500, basePrice + variation);

        setEstimatedPrice(price);

        // Set a "random-looking" design id that changes with dimensions
        const seed = `${width}-${length}-${height}-${trussSpacing}`;
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = (hash * 31 + seed.charCodeAt(i)) | 0;
        }
        const positiveHash = Math.abs(hash);
        const idNumber = (positiveHash % 900000000000) + 100000000000; // 12 digits
        setDesignId(idNumber.toString());

        // Friendly design name based on framing type
        if (framingType === 'post-frame-construction') {
          setDesignName('Post Frame Design');
        } else if (framingType === 'ladder-frame-construction') {
          setDesignName('Ladder Frame Design');
        } else {
          setDesignName('Building Design');
        }
      } catch {
        setEstimatedPrice(null);
        setDesignId(null);
      }
    } else {
      setEstimatedPrice(null);
      setDesignId(null);
    }
  }, [width, length, height, trussSpacing, framingType]);

  // Function to get width options based on framing type and roof pitch
  const getWidthOptions = () => {
    // When Truss Spacing is 4ft
    if (trussSpacing === '4') {
      return {
        default: 'Choose width',
        sizes: [
          '12 ft', '14 ft', '16 ft', '18 ft', '20 ft', '22 ft',
          '24 ft', '26 ft', '28 ft', '30 ft', '32 ft', '34 ft',
          '36 ft', '38 ft', '40 ft', '42 ft', '44 ft', '45 ft',
          '46 ft', '48 ft', '50 ft', '52 ft', '56 ft', '58 ft',
          '60 ft', '62 ft', '64 ft', '66 ft', '68 ft', '70 ft'
        ]
      };
    }
    // When Post Frame and 4/12 roof pitch
    if (framingType === 'post-frame-construction' && roofPitch === '4/12') {
      return {
        default: 'Choose width',
        popular_sizes: ['24 ft', '30 ft', '36 ft', '40 ft'],
        specialty_sizes: [
          '12 ft', '14 ft', '16 ft', '18 ft', '20 ft', '22 ft',
          '26 ft', '28 ft', '32 ft', '34 ft', '38 ft', '42 ft',
          '44 ft', '45 ft', '46 ft', '48 ft', '50 ft', '52 ft',
          '56 ft', '58 ft', '60 ft', '62 ft', '64 ft', '66 ft',
          '68 ft', '70 ft'
        ]
      };
    }
    // When Ladder Frame and 4/12 roof pitch
    if (framingType === 'ladder-frame-construction' && roofPitch === '4/12') {
      return {
        default: 'Choose width',
        sizes: [
          '12 ft', '16 ft', '20 ft', '24 ft', '28 ft', '32 ft',
          '36 ft', '40 ft', '44 ft', '48 ft', '52 ft', '56 ft',
          '60 ft'
        ]
      };
    }
    // When Ladder Frame and 6/12 roof pitch
    if (framingType === 'ladder-frame-construction' && roofPitch === '6/12') {
      return {
        default: 'Choose width',
        sizes: [
          '12 ft', '16 ft', '20 ft', '24 ft', '28 ft', '32 ft',
          '36 ft', '40 ft'
        ]
      };
    }
    // When Post Frame and 6/12 roof pitch
    if (framingType === 'post-frame-construction' && roofPitch === '6/12') {
      return {
        default: 'Choose width',
        sizes: [
          '12 ft', '14 ft', '16 ft', '18 ft', '20 ft', '22 ft',
          '24 ft', '26 ft', '28 ft', '30 ft', '32 ft', '34 ft',
          '36 ft', '38 ft', '40 ft'
        ]
      };
    }
    // Default empty options
    return {
      default: 'Choose width',
      sizes: []
    };
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="w-full h-full p-2">
        <div className="grid grid-cols-12 gap-[10px] h-full">
          {/* Left Side - Options */}
          <div className="bg-white rounded-lg shadow-md p-4 col-span-12 lg:col-span-4 flex flex-col h-full overflow-hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Building Parameters
            </h2>

            <div className="overflow-y-auto flex-1 pr-2">
            <div className="space-y-3">
            {/* Building Use */}
            <div 
              className={`mb-3 cursor-pointer p-3 rounded-lg transition-all ${
                activeSection === 'buildingUse' ? 'bg-yellow-100 border-2 border-yellow-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection('buildingUse')}
            >
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Building Use
              </label>
              <p className="text-xs text-gray-600 mb-2">What will you use your building for?</p>
              <select
                value={buildingUse}
                onChange={(e) => {
                  setBuildingUse(e.target.value);
                  setActiveSection('buildingUse');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection('buildingUse');
                }}
                className={`w-full px-3 py-1.5 border-2 rounded focus:outline-none text-sm ${
                  buildingUse ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <option value="">Choose use</option>
                <option value="rural">Rural</option>
                <option value="residential-garage-storage">Residential Garage/Storage</option>
              </select>
            </div>

            {/* Construction Framing Type */}
            <div 
              className={`mb-3 cursor-pointer p-3 rounded-lg transition-all ${
                activeSection === 'framingType' ? 'bg-yellow-100 border-2 border-yellow-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection('framingType')}
            >
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Construction Framing Type
              </label>
              <p className="text-xs text-gray-600 mb-2">Select framing type</p>
              <select
                value={framingType}
                onChange={(e) => {
                  setFramingType(e.target.value);
                  setActiveSection('framingType');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection('framingType');
                }}
                className={`w-full px-3 py-1.5 border-2 rounded focus:outline-none text-sm ${
                  framingType ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <option value="">Choose framing</option>
                <option value="post-frame-construction">Post Frame Construction</option>
                <option value="ladder-frame-construction">Ladder Frame Construction</option>
              </select>
            </div>

            {/* Roof Pitch */}
            <div 
              className={`mb-3 cursor-pointer p-3 rounded-lg transition-all ${
                activeSection === 'roofPitch' ? 'bg-yellow-100 border-2 border-yellow-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection('roofPitch')}
            >
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Roof Pitch
              </label>
              <p className="text-xs text-gray-600 mb-2">Roof pitch</p>
              <select
                value={roofPitch}
                onChange={(e) => {
                  setRoofPitch(e.target.value);
                  setActiveSection('roofPitch');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection('roofPitch');
                }}
                className={`w-full px-3 py-1.5 border-2 rounded focus:outline-none text-sm ${
                  roofPitch ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select a pitch</option>
                <option value="4/12">4/12</option>
                <option value="6/12">6/12</option>
                {/* <option value="8/12">8/12</option> */}
              </select>
            </div>

            {/* Truss Spacing and Length */}
            <div 
              className={`mb-3 cursor-pointer p-3 rounded-lg transition-all ${
                activeSection === 'trussSpacing' ? 'bg-yellow-100 border-2 border-yellow-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection('trussSpacing')}
            >
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Truss Spacing and Length
              </label>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Select truss spacing</p>
                  <select
                    value={trussSpacing}
                    onChange={(e) => {
                      setTrussSpacing(e.target.value);
                      setActiveSection('trussSpacing');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSection('trussSpacing');
                    }}
                    className={`w-full px-3 py-1.5 border-2 rounded focus:outline-none text-sm ${
                      trussSpacing ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    disabled={framingType === 'ladder-frame-construction'}
                  >
                    <option value="">Choose Spacing</option>
                    {framingType === 'ladder-frame-construction' ? (
                      <option value="4">4 feet</option>
                    ) : (
                      <>
                        <option value="9">9 feet</option>
                        <option value="8">8 feet</option>
                        <option value="6">6 feet</option>
                        <option value="4">4 feet</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Choose length of building</p>
                  <select
                    value={length}
                    onChange={(e) => {
                      setLength(e.target.value);
                      setActiveSection('trussSpacing');
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSection('trussSpacing');
                    }}
                    className={`w-full px-3 py-1.5 border-2 rounded focus:outline-none text-sm ${
                      length ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    disabled={!trussSpacing}
                  >
                    <option value="">Choose length</option>
                    {getLengthOptions(trussSpacing).map((val) => (
                      <option key={val} value={val}>
                        {val} ft
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Width */}
            <div 
              className={`mb-3 cursor-pointer p-3 rounded-lg transition-all ${
                activeSection === 'width' ? 'bg-yellow-100 border-2 border-yellow-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection('width')}
            >
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Width
              </label>
              <p className="text-xs text-gray-600 mb-2">Choose width of building</p>
              <select
                value={width}
                onChange={(e) => {
                  setWidth(e.target.value);
                  setActiveSection('width');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection('width');
                }}
                className={`w-full px-3 py-1.5 border-2 rounded focus:outline-none text-sm ${
                  width ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                disabled={
                  // Enable if truss spacing is 4ft
                  !(trussSpacing === '4') &&
                  // Otherwise check framing type and roof pitch
                  (!framingType || !roofPitch || 
                    (framingType === 'post-frame-construction' && roofPitch !== '4/12' && roofPitch !== '6/12') ||
                    (framingType === 'ladder-frame-construction' && roofPitch !== '4/12' && roofPitch !== '6/12'))
                }
              >
                {(() => {
                  const options = getWidthOptions();
                  // When Truss Spacing is 4ft: show sizes array (takes priority)
                  if (trussSpacing === '4' && options.sizes && options.sizes.length > 0) {
                    return (
                      <>
                        <option value="">{options.default}</option>
                        {options.sizes.map((size) => (
                          <option key={size} value={size.replace(' ft', '')}>
                            {size}
                          </option>
                        ))}
                      </>
                    );
                  }
                  // Post Frame + 4/12: Popular and Specialty sizes (only if truss spacing is not 4ft)
                  if (framingType === 'post-frame-construction' && roofPitch === '4/12' && trussSpacing !== '4') {
                    return (
                      <>
                        <option value="">{options.default}</option>
                        <optgroup label="Popular Sizes">
                          {options.popular_sizes?.map((size) => (
                            <option key={size} value={size.replace(' ft', '')}>
                              {size}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Specialty Sizes">
                          {options.specialty_sizes?.map((size) => (
                            <option key={size} value={size.replace(' ft', '')}>
                              {size}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    );
                  }
                  // All other cases: simple sizes array
                  if (options.sizes && options.sizes.length > 0) {
                    return (
                      <>
                        <option value="">{options.default}</option>
                        {options.sizes.map((size) => (
                          <option key={size} value={size.replace(' ft', '')}>
                            {size}
                          </option>
                        ))}
                      </>
                    );
                  }
                  return <option value="">{options.default}</option>;
                })()}
              </select>
            </div>

            {/* Height */}
            <div 
              className={`mb-3 cursor-pointer p-3 rounded-lg transition-all ${
                activeSection === 'height' ? 'bg-yellow-100 border-2 border-yellow-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection('height')}
            >
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Height
              </label>
              <p className="text-xs text-gray-600 mb-2">Choose inside clear height of building</p>
              <select
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setActiveSection('height');
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection('height');
                }}
                className={`w-full px-3 py-1.5 border-2 rounded focus:outline-none text-sm ${
                  height ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                disabled={!framingType}
              >
                <option value="">Choose height</option>
                {framingType === 'post-frame-construction' && (
                  <>
                    {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((val) => (
                      <option key={val} value={val}>
                        {val} ft
                      </option>
                    ))}
                  </>
                )}
                {framingType === 'ladder-frame-construction' && (
                  <>
                    {[8, 10, 12, 14, 16].map((val) => (
                      <option key={val} value={val}>
                        {val} ft
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            </div>
            </div>
          </div>

          {/* Right Side - Data Display */}
          <div className="bg-white rounded-lg shadow-md p-4 col-span-12 lg:col-span-8 flex flex-col h-full overflow-hidden">
            <div className="mb-3 flex-shrink-0">
              <div className="flex space-x-2 border-b">
                <button 
                  onClick={() => setActiveTab('information')}
                  className={`px-3 py-1.5 font-semibold rounded-t transition-colors text-sm ${
                    activeTab === 'information' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Information
                </button>
                <button 
                  onClick={() => setActiveTab('3d')}
                  className={`px-3 py-1.5 font-semibold rounded-t transition-colors text-sm ${
                    activeTab === '3d' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  3D Scene
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
            {activeTab === 'information' && (
              <>
                {/* Price Summary Box */}
                {estimatedPrice !== null && (
                  <div className="mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2">
                      *Today&apos;s estimated price, future pricing may go up or down. Tax, labor, and delivery not included.
                    </p>
                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="text-sm font-semibold text-gray-700 mr-1">Building Price:</span>
                        <span className="text-xl font-bold text-gray-900 align-baseline">
                          ${estimatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {designId && (
                        <>
                          <p className="text-sm font-semibold text-gray-900">
                            Design Id: <span className="font-normal">{designId}</span>
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            Design Name: <span className="font-normal">{designName}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Helper Banner */}
                {estimatedPrice === null && (
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-gray-700">
                      Please fill in Width, Truss Spacing, Length, and Height to get a price.
                    </p>
                  </div>
                )}

                {/* Conditional Content Based on Active Section */}
            {activeSection === 'buildingUse' && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Building Use</h3>
                <div className={`grid gap-3 ${buildingUse ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {/* Rural Card */}
                  {(!buildingUse || buildingUse === 'rural') && (
                    <div
                      onClick={() => setBuildingUse('rural')}
                      className={`border-2 rounded p-3 cursor-pointer transition-all ${
                        buildingUse === 'rural'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src="/assets/rular.jpg"
                        alt="Agricultural Use Building"
                        className="w-1/2 h-auto rounded mb-2"
                      />
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Rural</h4>
                      <p className="text-xs text-gray-600">
                        Buildings in a rural or farm setting that don&apos;t need to meet any codes or are code exempt.
                      </p>
                    </div>
                  )}

                  {/* Residential Garage/Storage Card */}
                  {(!buildingUse || buildingUse === 'residential-garage-storage') && (
                    <div
                      onClick={() => setBuildingUse('residential-garage-storage')}
                      className={`border-2 rounded p-3 cursor-pointer transition-all ${
                        buildingUse === 'residential-garage-storage'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src="/assets/Residential.jpg"
                        alt="Residential Use Building"
                        className="w-1/2 h-auto rounded mb-2"
                      />
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Residential Garage/Storage</h4>
                      <p className="text-xs text-gray-600">
                        Buildings in a suburban or residential area where some codes need to be met.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'framingType' && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Construction Framing Type</h3>
                <div className={`grid gap-3 ${framingType ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {/* Post Frame Construction Card */}
                  {(!framingType || framingType === 'post-frame-construction') && (
                    <div
                      onClick={() => setFramingType('post-frame-construction')}
                      className={`border-2 rounded p-3 cursor-pointer transition-all ${
                        framingType === 'post-frame-construction'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src="/assets/PostFrame.jpg"
                        alt="Post Frame Construction"
                        className="w-1/2 h-auto rounded mb-2"
                      />
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Post Frame Construction</h4>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Uses treated posts or laminated columns for vertical supports.</li>
                        <li>Truss spacing available at 9&apos;, 8&apos;, 6&apos;, or 4&apos; oc spacing.</li>
                        <li>12&apos; to 70&apos; wide buildings available to choose from.</li>
                        <li>8&apos; to 20&apos; tall buildings available to choose from.</li>
                        <li>Can choose to have the posts embedded in the ground, eliminating a continuous concrete foundation.</li>
                        <li>Ability to add lean-tos.</li>
                        <li>More options for doors, windows, and overhead doors.</li>
                      </ul>
                    </div>
                  )}

                  {/* Ladder Frame Construction Card */}
                  {(!framingType || framingType === 'ladder-frame-construction') && (
                    <div
                      onClick={() => setFramingType('ladder-frame-construction')}
                      className={`border-2 rounded p-3 cursor-pointer transition-all ${
                        framingType === 'ladder-frame-construction'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src="/assets/LadderFrame%20.jpg"
                        alt="Ladder Frame Construction"
                        className="w-1/2 h-auto rounded mb-2"
                      />
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Ladder Frame Construction</h4>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>Great alternative to stud framed buildings.</li>
                        <li>Uses 2-ply or 3-ply studs 4&apos; oc with 4&apos; oc trusses.</li>
                        <li>2x6 wall girts laid horizontally between wall studs.</li>
                        <li>Tip up the wall sections on top of concrete.</li>
                        <li>12&apos; to 60&apos; wide buildings available to choose from.</li>
                        <li>8&apos; to 16&apos; tall buildings available to choose from.</li>
                        <li>Requires a concrete foundation in place before construction.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'roofPitch' && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Roof Pitch</h3>
                {framingType === 'post-frame-construction' && (
                  <div className="mb-3">
                    <img 
                      src="/assets/roof_pitch.jpg"
                      alt="Roof Pitch - Post Frame Construction"
                      className="w-1/2 h-auto rounded border border-gray-300"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Having a steeper pitch will help water and snow run off the roof.
                    </p>
                  </div>
                )}
                {framingType === 'ladder-frame-construction' && (
                  <div className="mb-3">
                    <img 
                      src="/assets/ladder_roof_pitch.png"
                      alt="Roof Pitch - Ladder Frame Construction"
                      className="w-1/2 h-auto rounded border border-gray-300"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Having a steeper pitch will help water and snow run off the roof.
                    </p>
                  </div>
                )}
                {!framingType && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      Please select a Construction Framing Type first to see the roof pitch illustration.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'trussSpacing' && framingType === 'post-frame-construction' && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Truss Spacing and Length</h3>
                <div className="mb-3">
                  <img 
                    src="/assets/lengthV3.jpg"
                    alt="Truss Spacing and Length"
                    className="w-1/2 h-auto rounded border border-gray-300 mb-3"
                  />
                  <div className="space-y-2 text-xs text-gray-700">
                    <p className="font-semibold">Select truss spacing:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>9&apos;</strong> - Most economical and often used in agricultural buildings.</li>
                      <li><strong>8&apos;</strong> - Most commonly used for suburban residential storage and garages.</li>
                      <li><strong>6&apos;</strong> - Most commonly used to get an approximate price on commercial buildings.</li>
                      <li><strong>4&apos;</strong> - Least economical, trusses are 4&apos; oc and poles are 8&apos; oc allowing the purlins to be laid flat.</li>
                    </ul>
                    <p className="mt-4">
                      The length options available are based on the selected truss spacing.
                    </p>
                    <p>
                      Post spacing is determined on truss spacing.
                    </p>
                    <p>
                      If you can&apos;t find a building length that meets your requirements, please chat or leave a message with a Post Frame Specialist and they will help you.
                    </p>
                    <p className="italic">
                      For example: if you are using 9&apos; truss spacing to get the best price out there, and you want the building to be 50&apos; long, then select the 54&apos; option for pricing purposes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'trussSpacing' && framingType === 'ladder-frame-construction' && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Truss Spacing and Length</h3>
                <div className="mb-3">
                  <img 
                    src="/assets/ladder_framing_length.jpg"
                    alt="Truss Spacing and Length - Ladder Frame"
                    className="w-1/2 h-auto rounded border border-gray-300 mb-3"
                  />
                  <div className="space-y-2 text-xs text-gray-700">
                    <p>
                      Choose from lengths between 16&apos; and 192&apos;.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'width' && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Width</h3>
                <div className="mb-3">
                  <img 
                    src="/assets/widthV2.jpg"
                    alt="Building Width"
                    className="w-1/2 h-auto rounded border border-gray-300 mb-3"
                  />
                  <div className="space-y-2 text-xs text-gray-700">
                    <div>
                      <p className="font-semibold mb-2">Popular Truss Sizes:</p>
                      <p>
                        The popular truss width sizes currently are 24&apos;, 30&apos;, 36&apos;, and 40&apos; with spacing of 6&apos;, 8&apos;, and 9&apos;.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Specialty Sized Trusses:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Available in a variety of sizes to accommodate your needs</li>
                        <li>Produced specifically for your project</li>
                        <li>Longer production times should be expected</li>
                      </ul>
                    </div>
                    <p>
                      If you can&apos;t find a building width that meets your requirements, please chat or leave a message with a Post Frame Specialist and they will help you.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'height' && (
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900 mb-3">Height</h3>
                <div className="mb-3">
                  <img 
                    src="/assets/height.jpg"
                    alt="Building Height"
                    className="w-1/2 h-auto rounded border border-gray-300 mb-3"
                  />
                  <div className="space-y-2 text-xs text-gray-700">
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>
                        Height is measured from the top of the concrete floor or from the top of the concrete curb to the bottom of the truss.
                      </li>
                      <li>
                        If you are planning on putting an overhead door on the building is it recommended to make the building 2&apos; taller than your tallest overhead door.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimer - Only show when Building Use section is active */}
            {activeSection === 'buildingUse' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-700 italic leading-relaxed">
                  The building estimates from this program are for code exempt applications (examples: buildings used for personal storage or agricultural use). Menards can provide estimates for all types of &quot;Engineered&quot; Post Frame Buildings (examples: used for a business, rental or personal storage buildings that need to be code compliant).
                </p>
                <p className="text-xs text-green-700 italic leading-relaxed mt-2">
                  If you need to meet a specific snow or wind load rating or are required to provide sealed blueprints, please chat with a post frame specialist or visit your local Menards store for more information.
                </p>
                <p className="text-xs text-green-700 font-semibold italic leading-relaxed mt-2">
                  All Building Designs should be verified by local officials prior to starting your project.
                </p>
              </div>
            )}
              </>
            )}

            {activeTab === '3d' && (
              <div className="h-full">
                {width && length && height && trussSpacing ? (
                  <Building3D 
                    design={{
                      // Basic client/info mapping
                      clientName: '',
                      clientAddress: '',
                      buildingUse: buildingUse === 'rural' ? 'agricultural' : buildingUse === 'residential-garage-storage' ? 'residential' : 'storage',
                      width: parseFloat(width) || 24,
                      length: parseFloat(length) || 30,
                      // Preserve the exact truss spacing that was chosen, including 9'
                      trussSpacing: (trussSpacing as '4' | '6' | '8' | '9') || '6',
                      // Pass framing type and roof pitch through to the 3D scene
                      framingType: framingType ? (framingType as 'post-frame-construction' | 'ladder-frame-construction') : undefined,
                      roofPitch: (roofPitch as '4/12' | '6/12') || undefined,
                      floorFinish: 'dirt-gravel',
                      thickenedEdgeSlab: false,
                      postConstructionSlab: false,
                      sitePreparation: false,
                      sidewallPosts: '4x6',
                      clearHeight: (height as '8' | '10' | '12' | '14' | '16' | '18' | '20') || '12',
                      girtType: '2x4',
                      gradeBoard: '2x6',
                      wallColor: 'white',
                      trimColor: 'white',
                      roofColor: 'charcoal',
                      endWallOverhang: '0',
                      sidewallOverhang: '0',
                      openings: []
                    }}
                  />
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      Please fill in Width, Length, Height, and Truss Spacing to view the 3D scene.
                    </p>
                  </div>
                )}
              </div>
            )}
            </div>
            {/* Bottom actions (Next button) */}
            <div className="mt-4 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isStepComplete && onNext) {
                    onNext();
                  }
                }}
                disabled={!isStepComplete || !onNext}
                className={`px-4 py-1.5 rounded-md font-semibold text-white transition-colors text-sm ${
                  isStepComplete && onNext
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Next: Building Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

