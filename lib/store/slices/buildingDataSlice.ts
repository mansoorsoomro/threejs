import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchSceneQuestions,
  fetchOpenings,
  fetchLoadings,
  SceneQuestion,
  Opening,
  Loadings,
} from '@/lib/api/buildingApi';

interface BuildingDataState {
  sceneQuestions: SceneQuestion[];
  openings: Opening[];
  loadings: Loadings | null;
  loading: {
    sceneQuestions: boolean;
    openings: boolean;
    loadings: boolean;
  };
  error: {
    sceneQuestions: string | null;
    openings: string | null;
    loadings: string | null;
  };
}

const initialState: BuildingDataState = {
  sceneQuestions: [],
  openings: [],
  loadings: null,
  loading: {
    sceneQuestions: false,
    openings: false,
    loadings: false,
  },
  error: {
    sceneQuestions: null,
    openings: null,
    loadings: null,
  },
};

// Async thunks
export const fetchSceneQuestionsThunk = createAsyncThunk(
  'buildingData/fetchSceneQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchSceneQuestions();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scene questions';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOpeningsThunk = createAsyncThunk(
  'buildingData/fetchOpenings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchOpenings();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch openings';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchLoadingsThunk = createAsyncThunk(
  'buildingData/fetchLoadings',
  async (zipCode: string, { rejectWithValue }) => {
    try {
      const data = await fetchLoadings(zipCode);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loadings';
      return rejectWithValue(errorMessage);
    }
  }
);

// Combined thunk to fetch all building data
export const fetchAllBuildingData = createAsyncThunk(
  'buildingData/fetchAll',
  async (zipCode: string, { dispatch, rejectWithValue }) => {
    try {
      // Fetch all three APIs in parallel
      await Promise.all([
        dispatch(fetchSceneQuestionsThunk()),
        dispatch(fetchOpeningsThunk()),
        dispatch(fetchLoadingsThunk(zipCode)),
      ]);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch building data';
      return rejectWithValue(errorMessage);
    }
  }
);

const buildingDataSlice = createSlice({
  name: 'buildingData',
  initialState,
  reducers: {
    clearBuildingData: (state) => {
      state.sceneQuestions = [];
      state.openings = [];
      state.loadings = null;
      state.error = {
        sceneQuestions: null,
        openings: null,
        loadings: null,
      };
    },
  },
  extraReducers: (builder) => {
    // Scene Questions
    builder
      .addCase(fetchSceneQuestionsThunk.pending, (state) => {
        state.loading.sceneQuestions = true;
        state.error.sceneQuestions = null;
      })
      .addCase(fetchSceneQuestionsThunk.fulfilled, (state, action) => {
        state.loading.sceneQuestions = false;
        state.sceneQuestions = action.payload;
        state.error.sceneQuestions = null;
      })
      .addCase(fetchSceneQuestionsThunk.rejected, (state, action) => {
        state.loading.sceneQuestions = false;
        state.error.sceneQuestions = action.payload as string;
      });

    // Openings
    builder
      .addCase(fetchOpeningsThunk.pending, (state) => {
        state.loading.openings = true;
        state.error.openings = null;
      })
      .addCase(fetchOpeningsThunk.fulfilled, (state, action) => {
        state.loading.openings = false;
        state.openings = action.payload;
        state.error.openings = null;
      })
      .addCase(fetchOpeningsThunk.rejected, (state, action) => {
        state.loading.openings = false;
        state.error.openings = action.payload as string;
      });

    // Loadings
    builder
      .addCase(fetchLoadingsThunk.pending, (state) => {
        state.loading.loadings = true;
        state.error.loadings = null;
      })
      .addCase(fetchLoadingsThunk.fulfilled, (state, action) => {
        state.loading.loadings = false;
        state.loadings = action.payload;
        state.error.loadings = null;
      })
      .addCase(fetchLoadingsThunk.rejected, (state, action) => {
        state.loading.loadings = false;
        state.error.loadings = action.payload as string;
      });
  },
});

export const { clearBuildingData } = buildingDataSlice.actions;
export default buildingDataSlice.reducer;

