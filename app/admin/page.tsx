'use client';

import { useState, useEffect } from 'react';
import { PricingConfig, defaultPricing } from '@/lib/pricing';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { updatePricingThunk, fetchPricingThunk } from '@/lib/store/slices/pricingSlice';

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const currentPricing = useAppSelector((state) => state.pricing.config);
  const isLoading = useAppSelector((state) => state.pricing.loading);

  const [pricing, setPricing] = useState<PricingConfig>(currentPricing);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVercel, setIsVercel] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setPricing(currentPricing);
    // Check environment (in a real app, this would be an API check)
    setIsVercel(process.env.NEXT_PUBLIC_VERCEL === '1' || window.location.hostname.includes('vercel.app'));
  }, [currentPricing]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === 'Admin@123') {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleSave = async () => {
    try {
      const credentials = { email, password };
      const resultAction = await dispatch(updatePricingThunk({ pricing, credentials }));

      if (updatePricingThunk.fulfilled.match(resultAction)) {
        setSaved(true);
        setError(null);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(resultAction.payload as string || 'Failed to save pricing');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleReset = () => {
    setPricing(defaultPricing);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-brown-100">
          <h1 className="text-3xl font-extrabold mb-8 text-center text-brown-900 tracking-tight">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-brown-800">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent outline-none transition-all placeholder-brown-300"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-brown-800">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent outline-none transition-all placeholder-brown-300"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors font-bold shadow-md hover:shadow-lg transform active:scale-[0.98]"
            >
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8 border border-brown-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brown-900 tracking-tight">Pricing Management</h1>
            <p className="text-brown-600 text-sm mt-1 font-medium">Configure global pricing parameters for building quotes</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm font-bold text-brown-500 hover:text-brown-700 transition-colors uppercase tracking-wider"
          >
            Logout
          </button>
        </div>

        {/* {isVercel && (
          <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-bold underline uppercase tracking-tight">Vercel Environment Detected</span>
            </div>
            <p className="text-sm font-medium">
              If saving fails with a "Read-Only" error, please ensure you have configured your <strong>MongoDB Atlas URI</strong> in Vercel.
              Refer to <code>MONGODB_SETUP.md</code> in the project root for instructions.
            </p>
          </div>
        )} */}

        {saved && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 flex items-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Pricing configuration saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-center gap-2 shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brown-200 border-t-brown-600 mb-4"></div>
            <p className="text-brown-600 font-medium italic">Loading pricing data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Base Price */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-2 text-brown-900">Base Price per Sq Ft ($)</label>
              <input
                type="number"
                value={pricing.basePricePerSqFt}
                onChange={(e) => setPricing({ ...pricing, basePricePerSqFt: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent outline-none transition-all font-semibold"
                step="0.01"
              />
            </div>

            {/* Truss Spacing Multipliers */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-4 text-brown-900">Truss Spacing Multipliers (Coefficient)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['4', '6', '8', '9'] as const).map(spacing => (
                  <div key={spacing} className="bg-white p-3 rounded-lg border border-brown-50 shadow-sm">
                    <label className="block text-xs font-bold text-brown-500 mb-1 uppercase tracking-tighter">{spacing}' Spacing</label>
                    <input
                      type="number"
                      value={pricing.trussSpacing[spacing]}
                      onChange={(e) => setPricing({ ...pricing, trussSpacing: { ...pricing.trussSpacing, [spacing]: parseFloat(e.target.value) } })}
                      className="w-full px-2 py-1.5 border border-brown-100 rounded focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Floor Finish */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-4 text-brown-900">Floor Finish ($ per sq ft)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-brown-50 shadow-sm">
                  <label className="block text-xs font-bold text-brown-500 mb-1 uppercase">Dirt/Gravel</label>
                  <input
                    type="number"
                    value={pricing.floorFinish['dirt-gravel']}
                    onChange={(e) => setPricing({ ...pricing, floorFinish: { ...pricing.floorFinish, 'dirt-gravel': parseFloat(e.target.value) } })}
                    className="w-full px-2 py-1.5 border border-brown-100 rounded focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                    step="0.01"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-brown-50 shadow-sm">
                  <label className="block text-xs font-bold text-brown-500 mb-1 uppercase">Concrete</label>
                  <input
                    type="number"
                    value={pricing.floorFinish['concrete']}
                    onChange={(e) => setPricing({ ...pricing, floorFinish: { ...pricing.floorFinish, concrete: parseFloat(e.target.value) } })}
                    className="w-full px-2 py-1.5 border border-brown-100 rounded focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-brown-50 shadow-sm">
                <label className="block text-xs font-bold text-brown-500 mb-1 uppercase">Thickened Edge Slab ($/linft)</label>
                <input
                  type="number"
                  value={pricing.thickenedEdgeSlab}
                  onChange={(e) => setPricing({ ...pricing, thickenedEdgeSlab: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1.5 border border-brown-100 rounded focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                  step="0.01"
                />
              </div>

              <div className="bg-white p-4 rounded-lg border border-brown-50 shadow-sm">
                <label className="block text-xs font-bold text-brown-500 mb-1 uppercase">Post Construction Slab ($/sqft)</label>
                <input
                  type="number"
                  value={pricing.postConstructionSlab}
                  onChange={(e) => setPricing({ ...pricing, postConstructionSlab: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1.5 border border-brown-100 rounded focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                  step="0.01"
                />
              </div>

              <div className="bg-white p-4 rounded-lg border border-brown-50 shadow-sm">
                <label className="block text-xs font-bold text-brown-500 mb-1 uppercase">Site Preparation (flat fee $)</label>
                <input
                  type="number"
                  value={pricing.sitePreparation}
                  onChange={(e) => setPricing({ ...pricing, sitePreparation: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1.5 border border-brown-100 rounded focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                  step="0.01"
                />
              </div>
            </div>

            {/* Sidewall Posts */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-4 text-brown-900">Sidewall Posts ($ per post)</label>
              <div className="grid grid-cols-3 gap-4">
                {(['4x6', '6x6', 'columns'] as const).map(post => (
                  <div key={post} className="bg-white p-3 rounded-lg border border-brown-50 shadow-sm text-center">
                    <label className="block text-[10px] font-extrabold text-brown-400 mb-1 uppercase tracking-widest">{post}</label>
                    <input
                      type="number"
                      value={pricing.sidewallPosts[post]}
                      onChange={(e) => setPricing({ ...pricing, sidewallPosts: { ...pricing.sidewallPosts, [post]: parseFloat(e.target.value) } })}
                      className="w-full px-2 py-1.5 border border-brown-100 rounded text-center focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Height Multipliers */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-4 text-brown-900">Clear Height Multipliers (Coefficient)</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {(['8', '10', '12', '14', '16', '18', '20'] as const).map(height => (
                  <div key={height} className="bg-white p-2 rounded-lg border border-brown-50 shadow-sm text-center">
                    <label className="block text-[10px] font-bold text-brown-500 mb-1">{height}'</label>
                    <input
                      type="number"
                      value={pricing.clearHeight[height]}
                      onChange={(e) => setPricing({ ...pricing, clearHeight: { ...pricing.clearHeight, [height]: parseFloat(e.target.value) } })}
                      className="w-full px-1 py-1 border border-brown-100 rounded text-center focus:ring-2 focus:ring-brown-500 outline-none transition-all text-xs font-semibold"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Girt Type */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-4 text-brown-900">Girt Type ($ per linear ft)</label>
              <div className="grid grid-cols-3 gap-4">
                {(['flat', 'bookshelf', 'double'] as const).map(girt => (
                  <div key={girt} className="bg-white p-3 rounded-lg border border-brown-50 shadow-sm text-center">
                    <label className="block text-xs font-bold text-brown-500 mb-1 capitalize tracking-tight">{girt}</label>
                    <input
                      type="number"
                      value={pricing.girtType[girt]}
                      onChange={(e) => setPricing({ ...pricing, girtType: { ...pricing.girtType, [girt]: parseFloat(e.target.value) } })}
                      className="w-full px-2 py-1.5 border border-brown-100 rounded text-center focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Grade Board */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-4 text-brown-900">Grade Board ($ per linear ft)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(['2x6', '2x8', '2x10', '2x6-centermatch', '2x6-fusion-centermatch'] as const).map(board => (
                  <div key={board} className="bg-white p-3 rounded-lg border border-brown-50 shadow-sm text-center">
                    <label className="block text-[9px] font-bold text-brown-500 mb-1 uppercase tracking-tighter">{board}</label>
                    <input
                      type="number"
                      value={pricing.gradeBoard[board]}
                      onChange={(e) => setPricing({ ...pricing, gradeBoard: { ...pricing.gradeBoard, [board]: parseFloat(e.target.value) } })}
                      className="w-full px-2 py-1 border border-brown-100 rounded text-center focus:ring-2 focus:ring-brown-500 outline-none transition-all text-xs font-medium"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Overhangs */}
            <div className="bg-cream-100 p-6 rounded-xl border border-brown-50">
              <label className="block text-sm font-bold mb-4 text-brown-900">Overhang ($ per linear ft)</label>
              <div className="grid grid-cols-3 gap-4">
                {(['0', '1', '2'] as const).map(oh => (
                  <div key={oh} className="bg-white p-3 rounded-lg border border-brown-50 shadow-sm text-center">
                    <label className="block text-xs font-bold text-brown-500 mb-1">{oh}' Overhang</label>
                    <input
                      type="number"
                      value={pricing.overhang[oh]}
                      onChange={(e) => setPricing({ ...pricing, overhang: { ...pricing.overhang, [oh]: parseFloat(e.target.value) } })}
                      className="w-full px-2 py-1.5 border border-brown-100 rounded text-center focus:ring-2 focus:ring-brown-500 outline-none transition-all font-medium"
                      step="0.01"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-8 border-t border-brown-100 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-8 z-10 transition-all">
              <button
                onClick={handleSave}
                className="flex-1 min-w-[160px] px-6 py-3 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-all disabled:opacity-50 font-bold shadow-md hover:shadow-lg transform active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? 'Saving Changes...' : 'Save All Pricing'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-cream-200 text-brown-700 rounded-lg hover:bg-cream-300 transition-colors font-bold border border-brown-100"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => dispatch(fetchPricingThunk())}
                className="px-6 py-3 bg-white text-brown-600 rounded-lg hover:bg-cream-50 transition-colors font-bold border border-brown-200"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
