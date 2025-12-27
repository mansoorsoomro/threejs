'use client';

import { useState, useEffect } from 'react';
import { Store } from '@/types/building';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchStores, fetchMoreStores, clearStores } from '@/lib/store/slices/storesSlice';
import { fetchAllBuildingData } from '@/lib/store/slices/buildingDataSlice';
import Footer from './Footer';

interface StoreSelectProps {
  buildingZipCode?: string;
  selectedStore?: Store;
  onZipCodeChange: (zipCode: string) => void;
  onStoreSelect: (store: Store) => void;
  onBack?: () => void;
}

export default function StoreSelect({
  buildingZipCode = '',
  selectedStore,
  onZipCodeChange,
  onStoreSelect,
  onBack,
}: StoreSelectProps) {
  // ... existing state ...
  const [zipCode, setZipCode] = useState(buildingZipCode);
  const [showStoreList, setShowStoreList] = useState(false);

  // Redux state
  const dispatch = useAppDispatch();
  const { stores, loading, error, hasMore, loadingMore, currentOffset, lastZipCode } = useAppSelector((state) => state.stores);

  useEffect(() => {
    if (buildingZipCode && buildingZipCode.length === 5) {
      dispatch(fetchStores(buildingZipCode));
      setShowStoreList(true);
    }
  }, [buildingZipCode, dispatch]);

  useEffect(() => {
    // Show store list when stores are loaded
    if (stores.length > 0) {
      setShowStoreList(true);
    }
  }, [stores]);

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
    onZipCodeChange(value);

    if (value.length === 5) {
      dispatch(fetchStores(value));
      setShowStoreList(true);
    } else {
      setShowStoreList(false);
      dispatch(clearStores());
    }
  };

  const handleStoreSelect = async (store: Store) => {
    // Call parent handler first
    onStoreSelect(store);

    // Fetch building data APIs when store is selected
    // Use the zip code from the selected store or building zip code
    const zipCodeToUse = store.zipCode || buildingZipCode;

    if (zipCodeToUse && zipCodeToUse.length === 5) {
      try {
        // Fetch all three APIs: getSceneQuestions, getOpenings, and getLoadings
        await dispatch(fetchAllBuildingData(zipCodeToUse));
        console.log('Building data fetched successfully');
      } catch (error) {
        console.error('Error fetching building data:', error);
        // Don't block the store selection if API calls fail
      }
    }
  };

  const handleLoadMore = async () => {
    const zipCodeToUse = lastZipCode || zipCode;
    if (zipCodeToUse && zipCodeToUse.length === 5) {
      const nextOffset = currentOffset + 1;
      await dispatch(fetchMoreStores({ zipCode: zipCodeToUse, offset: nextOffset }));
    }
  };

  const handleSearchDifferentZip = () => {
    setZipCode('');
    setShowStoreList(false);
    dispatch(clearStores());
    onZipCodeChange('');
  };

  return (
    <div className="bg-white pb-0">
      <div className="w-full px-10 py-0">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Let&apos;s get started planning your dream today!
        </h1>

        <p className="text-gray-700 mb-2 text-sm">
          Please enter the zip code you will be building in.
        </p>

        <div className="mb-2">
          <label className="block text-sm font-bold text-gray-900 mb-1">
            Building Zip Code:
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={handleZipCodeChange}
            placeholder="Enter 5-digit zip code"
            className="w-full max-w-xs px-3 py-1.5 border-2 border-blue-400 rounded text-sm focus:outline-none focus:border-blue-600"
            maxLength={5}
          />
        </div>

        {loading && (
          <div className="text-blue-600 mb-2 text-sm">Loading stores...</div>
        )}

        {error && (
          <div className="text-red-600 mb-2 text-sm">{error}</div>
        )}

        {showStoreList && stores.length > 0 && (
          <div className="mt-2">
            <p className="text-gray-700 mb-2 text-sm">
              For proper pricing service, and plant production, please tell us which store you would like to facilitate your purchase (including delivery to if applicable).
            </p>

            <div
              className="overflow-x-auto mt-2 max-h-[40vh] overflow-y-auto border border-gray-200"
              onScroll={(e) => {
                const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
                // Add a small threshold for better UX (e.g., load when within 50px of bottom)
                const nearBottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;

                if (nearBottom && hasMore && !loadingMore) {
                  handleLoadMore();
                }
              }}
            >
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200 sticky top-0 z-10">
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900 text-sm">Store</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900 text-sm">Address</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900 text-sm">Distance</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900 text-sm">Phone</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-900 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store, index) => (
                    <tr
                      key={store.id}
                      className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        } ${selectedStore?.id === store.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="border border-gray-300 px-2 py-1 font-semibold text-gray-900 text-sm">
                        {store.name}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-gray-700 text-sm">
                        {store.address}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-gray-700 text-sm">
                        {store.distance.toFixed(1)} miles
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-gray-700 text-sm">
                        {store.phone}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <button
                          onClick={() => handleStoreSelect(store)}
                          className={`px-3 py-1.5 rounded text-sm ${selectedStore?.id === store.id
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                          {selectedStore?.id === store.id ? 'Selected' : 'Select This Store'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loadingMore && (
              <div className="text-center py-2 text-sm text-blue-600">Loading more stores...</div>
            )}
          </div>
        )}

        {showStoreList && stores.length === 0 && !loading && (
          <div className="text-gray-600 mt-2 text-sm">
            No stores found for this zip code. Please try a different zip code.
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-2">
          <p className="text-green-700 italic text-xs leading-relaxed">
            The estimates from this program are for code exempt buildings. Menards can provide estimates for engineered buildings. If your building official requires an engineered building, please design your building and then chat with a post frame specialist, or visit your local Menards store for more information. All building designs should be verified by local building officials prior to starting your project.
          </p>
        </div>
      </div>

      <Footer onBack={onBack} showContinue={false} />
    </div>
  );
}

