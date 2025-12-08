import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Store } from '@/types/building';
import { fetchStoresByZipCode } from '@/lib/api/storesApi';

interface StoresState {
  stores: Store[];
  loading: boolean;
  error: string | null;
  lastZipCode: string | null;
  currentOffset: number;
  hasMore: boolean;
  loadingMore: boolean;
}

const initialState: StoresState = {
  stores: [],
  loading: false,
  error: null,
  lastZipCode: null,
  currentOffset: 1,
  hasMore: true,
  loadingMore: false,
};

// Async thunk for fetching stores (initial load)
export const fetchStores = createAsyncThunk(
  'stores/fetchStores',
  async (zipCode: string, { rejectWithValue }) => {
    try {
      const stores = await fetchStoresByZipCode(zipCode, 1);
      return { stores, zipCode };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stores';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for loading more stores (pagination)
export const fetchMoreStores = createAsyncThunk(
  'stores/fetchMoreStores',
  async ({ zipCode, offset }: { zipCode: string; offset: number }, { rejectWithValue }) => {
    try {
      const stores = await fetchStoresByZipCode(zipCode, offset);
      return { stores, zipCode, offset };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch more stores';
      return rejectWithValue(errorMessage);
    }
  }
);

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    clearStores: (state) => {
      state.stores = [];
      state.error = null;
      state.lastZipCode = null;
      state.currentOffset = 1;
      state.hasMore = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload.stores;
        state.lastZipCode = action.payload.zipCode;
        state.currentOffset = 1;
        // Always show load more button initially if we got stores
        // Only hide it after we try to load more and get less than 10
        state.hasMore = action.payload.stores.length > 0;
        state.error = null;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.stores = [];
        state.currentOffset = 1;
        state.hasMore = true;
      })
      .addCase(fetchMoreStores.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchMoreStores.fulfilled, (state, action) => {
        state.loadingMore = false;
        // Append new stores to existing ones
        state.stores = [...state.stores, ...action.payload.stores];
        state.currentOffset = action.payload.offset;
        // If we got exactly 10 stores, there might be more. If less, no more to load
        state.hasMore = action.payload.stores.length === 10;
        state.error = null;
      })
      .addCase(fetchMoreStores.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStores, clearError } = storesSlice.actions;
export default storesSlice.reducer;

