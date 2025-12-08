'use client';

import { useForm } from 'react-hook-form';
import { BuildingDesign } from '@/types/building';
import { wallColors, trimColors, roofColors } from '@/data/menardsColors';
import { windowOptions, doorOptions } from '@/data/windowsDoors';

interface BuildingFormProps {
  onSubmit: (data: BuildingDesign) => void;
  initialData?: Partial<BuildingDesign>;
  mode?: 'full' | 'optionsOnly';
}

export default function BuildingForm({ onSubmit, initialData, mode = 'full' }: BuildingFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BuildingDesign>({
    defaultValues: {
      width: 24,
      length: 30,
      trussSpacing: '6',
      floorFinish: 'dirt-gravel',
      thickenedEdgeSlab: false,
      postConstructionSlab: false,
      sitePreparation: false,
      sidewallPosts: '4x6',
      clearHeight: '12',
      girtType: '2x4',
      gradeBoard: '2x6',
      endWallOverhang: '0',
      sidewallOverhang: '0',
      openings: [],
      ...initialData,
    },
  });

  const watchedValues = watch();

  const onSubmitForm = (data: BuildingDesign) => {
    onSubmit(data);
  };

  // Round width to even numbers between 20-60
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value) || 20;
    value = Math.max(20, Math.min(60, value));
    value = Math.round(value / 2) * 2; // Round to even
    setValue('width', value);
  };

  // Round length to even numbers between 20-200
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value) || 20;
    value = Math.max(20, Math.min(200, value));
    value = Math.round(value / 2) * 2; // Round to even
    setValue('length', value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Building Specifications</h2>
      
      {mode === 'full' && (
        <>
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client Name *</label>
              <input
                {...register('clientName', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Address *</label>
              <input
                {...register('clientAddress', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="123 Main St, City, State ZIP"
              />
            </div>
          </div>

          {/* Building Use */}
          <div>
            <label className="block text-sm font-medium mb-1">Building Use *</label>
            <select
              {...register('buildingUse', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="residential">Residential</option>
              <option value="storage">Storage</option>
              <option value="agricultural">Agricultural</option>
              <option value="barndominium">Barndominium</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Width (20'-60', even numbers) *</label>
              <input
                type="number"
                {...register('width', { required: true, min: 20, max: 60 })}
                onChange={handleWidthChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                step="2"
                min="20"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Length (20'-200', even numbers) *</label>
              <input
                type="number"
                {...register('length', { required: true, min: 20, max: 200 })}
                onChange={handleLengthChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                step="2"
                min="20"
                max="200"
              />
            </div>
          </div>

          {/* Truss Spacing */}
          <div>
            <label className="block text-sm font-medium mb-1">Truss Spacing *</label>
            <select
              {...register('trussSpacing', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="4">4'</option>
              <option value="6">6'</option>
              <option value="8">8'</option>
            </select>
          </div>
        </>
      )}

      {/* Floor Finish */}
      <div>
        <label className="block text-sm font-medium mb-1">Floor Finish *</label>
        <select
          {...register('floorFinish', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="dirt-gravel">Dirt/Gravel</option>
          <option value="concrete">Concrete</option>
        </select>
      </div>

      {mode === 'full' && (
        <>
          {/* Additional Services */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Services</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('sitePreparation')}
                  className="mr-2"
                />
                Site Preparation (A sales representative will call to discuss)
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('thickenedEdgeSlab')}
                  className="mr-2"
                />
                Thickened Edge Slab (Building secured to concrete)
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('postConstructionSlab')}
                  className="mr-2"
                />
                Post Construction Slab
              </label>
            </div>
          </div>
        </>
      )}

      {/* Sidewall Posts */}
      <div>
        <label className="block text-sm font-medium mb-1">Sidewall Posts *</label>
        <select
          {...register('sidewallPosts', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="4x6">4x6</option>
          <option value="6x6">6x6</option>
          <option value="columns">Columns</option>
        </select>
      </div>

      {mode === 'full' && (
        <>
          {/* Clear Height */}
          <div>
            <label className="block text-sm font-medium mb-1">Inside Clear Height *</label>
            <select
              {...register('clearHeight', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="8">8'</option>
              <option value="10">10'</option>
              <option value="12">12'</option>
              <option value="14">14'</option>
              <option value="16">16'</option>
              <option value="18">18'</option>
              <option value="20">20'</option>
            </select>
          </div>
        </>
      )}

      {/* Girt Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Girt Type *</label>
        <select
          {...register('girtType', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="2x4">2x4</option>
          <option value="2x6">2x6</option>
        </select>
      </div>

      {/* Grade Board */}
      <div>
        <label className="block text-sm font-medium mb-1">Grade Board Type *</label>
        <select
          {...register('gradeBoard', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="2x6">2x6</option>
          <option value="2x8">2x8</option>
        </select>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Wall Color *</label>
          <select
            {...register('wallColor', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {wallColors.map(color => (
              <option key={color.value} value={color.value}>{color.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trim Color *</label>
          <select
            {...register('trimColor', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {trimColors.map(color => (
              <option key={color.value} value={color.value}>{color.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Roof Color *</label>
          <select
            {...register('roofColor', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {roofColors.map(color => (
              <option key={color.value} value={color.value}>{color.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overhangs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">End Wall Overhang *</label>
          <select
            {...register('endWallOverhang', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="0">0'</option>
            <option value="1">1'</option>
            <option value="2">2'</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sidewall Overhang *</label>
          <select
            {...register('sidewallOverhang', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="0">0'</option>
            <option value="1">1'</option>
            <option value="2">2'</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Update Design
        </button>
      </div>
    </form>
  );
}

