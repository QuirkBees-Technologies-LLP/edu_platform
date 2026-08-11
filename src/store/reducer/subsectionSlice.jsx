import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllSubsections,
  createSubsection,
  updateSubsection,
  deleteSubsection,
  reorderSubsections as reorderSubsectionsApi,
} from "@/services/lms.subsections";

const SUBSECTION_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};

export const fetchSubsections = createAsyncThunk(
  "subsections/fetchAll",
  async ({ sectionId, token }, { rejectWithValue }) => {
    try {
      const response = await getAllSubsections({ section: sectionId }, token);
      return { sectionId, subsections: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subsections"
      );
    }
  }
);

export const createNewSubsection = createAsyncThunk(
  "subsections/create",
  async ({ subsectionData, token }, { rejectWithValue }) => {
    try {
      const response = await createSubsection(subsectionData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create subsection"
      );
    }
  }
);

export const updateExistingSubsection = createAsyncThunk(
  "subsections/update",
  async ({ id, subsectionData, token }, { rejectWithValue }) => {
    try {
      const response = await updateSubsection(id, subsectionData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update subsection"
      );
    }
  }
);

export const deleteSubsectionThunk = createAsyncThunk(
  "subsections/delete",
  async ({ subsectionId, token }, { rejectWithValue }) => {
    try {
      await deleteSubsection(subsectionId, token);
      return { _id: subsectionId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const reorderSubsections = createAsyncThunk(
  "subsections/reorder",
  async ({ subsections, token }, { rejectWithValue }) => {
    try {
      const response = await reorderSubsectionsApi(subsections, token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  // Keyed by sectionId so multiple sections' subsections can coexist in memory
  bySection: {},
  status: SUBSECTION_STATUS.IDLE,
  error: null,
};

const subsectionSlice = createSlice({
  name: "subsections",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubsections: (state) => {
      state.bySection = {};
      state.status = SUBSECTION_STATUS.IDLE;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubsections.pending, (state) => {
        state.status = SUBSECTION_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchSubsections.fulfilled, (state, action) => {
        state.status = SUBSECTION_STATUS.SUCCEEDED;
        state.bySection[action.payload.sectionId] = action.payload.subsections;
      })
      .addCase(fetchSubsections.rejected, (state, action) => {
        state.status = SUBSECTION_STATUS.FAILED;
        state.error = action.payload;
      })
      .addCase(createNewSubsection.fulfilled, (state, action) => {
        const sectionId = action.payload.section?._id || action.payload.section;
        if (!state.bySection[sectionId]) state.bySection[sectionId] = [];
        state.bySection[sectionId].push(action.payload);
      })
      .addCase(updateExistingSubsection.fulfilled, (state, action) => {
        const sectionId = action.payload.section?._id || action.payload.section;
        const list = state.bySection[sectionId];
        if (list) {
          const index = list.findIndex((s) => s._id === action.payload._id);
          if (index !== -1) list[index] = action.payload;
        }
      })
      .addCase(deleteSubsectionThunk.fulfilled, (state, action) => {
        Object.keys(state.bySection).forEach((sectionId) => {
          state.bySection[sectionId] = state.bySection[sectionId].filter(
            (s) => s._id !== action.payload._id
          );
        });
      })
      .addCase(reorderSubsections.fulfilled, (state, action) => {
        const reordered = action.payload?.data || [];
        reordered.forEach((subsection) => {
          const sectionId = subsection.section?._id || subsection.section;
          const list = state.bySection[sectionId];
          if (list) {
            const index = list.findIndex((s) => s._id === subsection._id);
            if (index !== -1) list[index] = subsection;
          }
        });
      });
  },
});

export const { clearError, clearSubsections } = subsectionSlice.actions;

export const selectSubsectionsBySection = (sectionId) => (state) =>
  state.subsections.bySection[sectionId] || [];
export const selectSubsectionsStatus = (state) => state.subsections.status;
export const selectSubsectionsError = (state) => state.subsections.error;

export default subsectionSlice.reducer;
