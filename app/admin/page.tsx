'use client';

import { useState, useEffect } from 'react';
import { getPricing, savePricing, PricingConfig, defaultPricing } from '@/lib/pricing';

export default function AdminPage() {
  const [pricing, setPricing] = useState<PricingConfig>(defaultPricing);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPricing(getPricing());
  }, []);

  const handleSave = () => {
    savePricing(pricing);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPricing(defaultPricing);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Admin - Pricing Management</h1>

        {saved && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            Pricing saved successfully!
          </div>
        )}

        <div className="space-y-6">
          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Base Price per Sq Ft ($)</label>
            <input
              type="number"
              value={pricing.basePricePerSqFt}
              onChange={(e) => setPricing({ ...pricing, basePricePerSqFt: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.01"
            />
          </div>

          {/* Truss Spacing Multipliers */}
          <div>
            <label className="block text-sm font-medium mb-2">Truss Spacing Multipliers</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">4'</label>
                <input
                  type="number"
                  value={pricing.trussSpacing['4']}
                  onChange={(e) => setPricing({ ...pricing, trussSpacing: { ...pricing.trussSpacing, '4': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">6'</label>
                <input
                  type="number"
                  value={pricing.trussSpacing['6']}
                  onChange={(e) => setPricing({ ...pricing, trussSpacing: { ...pricing.trussSpacing, '6': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">8'</label>
                <input
                  type="number"
                  value={pricing.trussSpacing['8']}
                  onChange={(e) => setPricing({ ...pricing, trussSpacing: { ...pricing.trussSpacing, '8': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Floor Finish */}
          <div>
            <label className="block text-sm font-medium mb-2">Floor Finish ($ per sq ft)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Dirt/Gravel</label>
                <input
                  type="number"
                  value={pricing.floorFinish['dirt-gravel']}
                  onChange={(e) => setPricing({ ...pricing, floorFinish: { ...pricing.floorFinish, 'dirt-gravel': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Concrete</label>
                <input
                  type="number"
                  value={pricing.floorFinish['concrete']}
                  onChange={(e) => setPricing({ ...pricing, floorFinish: { ...pricing.floorFinish, concrete: parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Additional Services */}
          <div>
            <label className="block text-sm font-medium mb-1">Thickened Edge Slab ($ per linear ft)</label>
            <input
              type="number"
              value={pricing.thickenedEdgeSlab}
              onChange={(e) => setPricing({ ...pricing, thickenedEdgeSlab: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Post Construction Slab ($ per sq ft)</label>
            <input
              type="number"
              value={pricing.postConstructionSlab}
              onChange={(e) => setPricing({ ...pricing, postConstructionSlab: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Site Preparation (flat fee $)</label>
            <input
              type="number"
              value={pricing.sitePreparation}
              onChange={(e) => setPricing({ ...pricing, sitePreparation: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.01"
            />
          </div>

          {/* Sidewall Posts */}
          <div>
            <label className="block text-sm font-medium mb-2">Sidewall Posts ($ per post)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">4x6</label>
                <input
                  type="number"
                  value={pricing.sidewallPosts['4x6']}
                  onChange={(e) => setPricing({ ...pricing, sidewallPosts: { ...pricing.sidewallPosts, '4x6': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">6x6</label>
                <input
                  type="number"
                  value={pricing.sidewallPosts['6x6']}
                  onChange={(e) => setPricing({ ...pricing, sidewallPosts: { ...pricing.sidewallPosts, '6x6': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Columns</label>
                <input
                  type="number"
                  value={pricing.sidewallPosts['columns']}
                  onChange={(e) => setPricing({ ...pricing, sidewallPosts: { ...pricing.sidewallPosts, columns: parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Clear Height Multipliers */}
          <div>
            <label className="block text-sm font-medium mb-2">Clear Height Multipliers</label>
            <div className="grid grid-cols-4 gap-2">
              {(['8', '10', '12', '14', '16', '18', '20'] as const).map(height => (
                <div key={height}>
                  <label className="block text-xs text-gray-600 mb-1">{height}'</label>
                  <input
                    type="number"
                    value={pricing.clearHeight[height]}
                    onChange={(e) => setPricing({ ...pricing, clearHeight: { ...pricing.clearHeight, [height]: parseFloat(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Girt Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Girt Type ($ per linear ft)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Flat</label>
                <input
                  type="number"
                  value={pricing.girtType['flat']}
                  onChange={(e) => setPricing({ ...pricing, girtType: { ...pricing.girtType, 'flat': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Bookshelf</label>
                <input
                  type="number"
                  value={pricing.girtType['bookshelf']}
                  onChange={(e) => setPricing({ ...pricing, girtType: { ...pricing.girtType, 'bookshelf': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Double</label>
                <input
                  type="number"
                  value={pricing.girtType['double']}
                  onChange={(e) => setPricing({ ...pricing, girtType: { ...pricing.girtType, 'double': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Grade Board */}
          <div>
            <label className="block text-sm font-medium mb-2">Grade Board ($ per linear ft)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">2x6</label>
                <input
                  type="number"
                  value={pricing.gradeBoard['2x6']}
                  onChange={(e) => setPricing({ ...pricing, gradeBoard: { ...pricing.gradeBoard, '2x6': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">2x8</label>
                <input
                  type="number"
                  value={pricing.gradeBoard['2x8']}
                  onChange={(e) => setPricing({ ...pricing, gradeBoard: { ...pricing.gradeBoard, '2x8': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Overhangs */}
          <div>
            <label className="block text-sm font-medium mb-2">Overhang ($ per linear ft)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">0'</label>
                <input
                  type="number"
                  value={pricing.overhang['0']}
                  onChange={(e) => setPricing({ ...pricing, overhang: { ...pricing.overhang, '0': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">1'</label>
                <input
                  type="number"
                  value={pricing.overhang['1']}
                  onChange={(e) => setPricing({ ...pricing, overhang: { ...pricing.overhang, '1': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">2'</label>
                <input
                  type="number"
                  value={pricing.overhang['2']}
                  onChange={(e) => setPricing({ ...pricing, overhang: { ...pricing.overhang, '2': parseFloat(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Pricing
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

