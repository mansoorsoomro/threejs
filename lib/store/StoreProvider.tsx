'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './store';
import { fetchPricingThunk } from './slices/pricingSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
    // Fetch pricing data on initialization
    storeRef.current.dispatch(fetchPricingThunk());
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

