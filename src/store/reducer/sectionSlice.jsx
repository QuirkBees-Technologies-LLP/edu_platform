import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSectionsByCourseId,
  createSection,
  updateSection,
  deleteSection,
  reorderSections as reorderSectionsApi,
} from "@/services/lms.api";

// Async thunks
export const fetchSections = createAsyncThunk(
  "sections/fetchSections",
  async ({ courseId, token }, { rejectWithValue }) => {
    try {
      const sections = await getSectionsByCourseId(courseId, token);
      return sections.sort((a, b) => a.order - b.order);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewSection = createAsyncThunk(
  "sections/createNewSection",
  async ({ sectionData, token }, { rejectWithValue }) => {
    try {
      return await createSection(sectionData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingSection = createAsyncThunk(
  "sections/updateExistingSection",
  async ({ sectionId, sectionData, token }, { rejectWithValue }) => {
    try {
      return await updateSection(sectionId, sectionData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExistingSection = createAsyncThunk(
  "sections/deleteExistingSection",
  async ({ sectionId, token }, { rejectWithValue }) => {
    try {
      await deleteSection(sectionId, token);
      return sectionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reorderSections = createAsyncThunk(
  "sections/reorderSections",
  async (
    { courseId, dragIndex, hoverIndex, token },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState();
      const newSections = [...state.sections.sections];
      const draggedSection = newSections[dragIndex];
      newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, draggedSection);

      const sectionOrders = newSections.map((section, index) => ({
        id: section.id,
        order: index,
      }));

      await reorderSectionsApi(sectionOrders, token);
      return newSections;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  sections: [],
  selectedSection: null,
  isLoading: false,
  error: null,
};

const sectionSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {
    setSelectedSection: (state, action) => {
      state.selectedSection = action.payload;
    },
    clearSelectedSection: (state) => {
      state.selectedSection = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sections
      .addCase(fetchSections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Section
      .addCase(createNewSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections.push(action.payload);
      })
      .addCase(createNewSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Section
      .addCase(updateExistingSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = state.sections.map((section) =>
          section.id === action.payload.id ? action.payload : section
        );
        if (state.selectedSection?.id === action.payload.id) {
          state.selectedSection = action.payload;
        }
      })
      .addCase(updateExistingSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Section
      .addCase(deleteExistingSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExistingSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = state.sections.filter(
          (section) => section.id !== action.payload
        );
        if (state.selectedSection?.id === action.payload) {
          state.selectedSection = null;
        }
      })
      .addCase(deleteExistingSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reorder Sections
      .addCase(reorderSections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderSections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sections = action.payload;
      })
      .addCase(reorderSections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedSection, clearSelectedSection, clearError } =
  sectionSlice.actions;
export default sectionSlice.reducer;
