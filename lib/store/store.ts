import { configureStore } from '@reduxjs/toolkit';
import storesReducer from './slices/storesSlice';
import buildingDataReducer from './slices/buildingDataSlice';
import pricingReducer from './slices/pricingSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      stores: storesReducer,
      buildingData: buildingDataReducer,
      pricing: pricingReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: [],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

