import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PricingConfig, defaultPricing } from '@/lib/pricing';

interface PricingState {
    config: PricingConfig;
    loading: boolean;
    error: string | null;
}

const initialState: PricingState = {
    config: defaultPricing,
    loading: false,
    error: null,
};

export const fetchPricingThunk = createAsyncThunk(
    'pricing/fetchPricing',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/pricing');
            if (!response.ok) {
                throw new Error('Failed to fetch pricing');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch pricing');
        }
    }
);

export const updatePricingThunk = createAsyncThunk(
    'pricing/updatePricing',
    async ({ pricing, credentials }: { pricing: PricingConfig, credentials: any }, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pricing, credentials }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update pricing');
            }
            return pricing;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to update pricing');
        }
    }
);

const pricingSlice = createSlice({
    name: 'pricing',
    initialState,
    reducers: {
        setPricing: (state, action) => {
            state.config = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPricingThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPricingThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.config = action.payload;
            })
            .addCase(fetchPricingThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updatePricingThunk.fulfilled, (state, action) => {
                state.config = action.payload;
            });
    },
});

export const { setPricing } = pricingSlice.actions;
export default pricingSlice.reducer;
