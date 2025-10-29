import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  reorderSections as reorderSectionsApi,
} from "@/services/lms.sections";

// Types
const SECTION_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};

// Async thunks
export const fetchSections = createAsyncThunk(
  "sections/fetchAll",
  async ({ courseId, token }, { rejectWithValue }) => {
    try {
      const response = await getAllSections({ course: courseId }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch sections"
      );
    }
  }
);

export const fetchSectionById = createAsyncThunk(
  "sections/fetchById",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await getSectionById(id, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch section"
      );
    }
  }
);

export const createNewSection = createAsyncThunk(
  "sections/create",
  async ({ sectionData, token }, { rejectWithValue }) => {
    try {
      const response = await createSection(sectionData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create section"
      );
    }
  }
);

export const updateExistingSection = createAsyncThunk(
  "sections/update",
  async ({ id, sectionData, token }, { rejectWithValue }) => {
    try {
      const response = await updateSection(id, sectionData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update section"
      );
    }
  }
);

export const deleteExistingSection = createAsyncThunk(
  "sections/delete",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await deleteSection(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete section"
      );
    }
  }
);

export const reorderSections = createAsyncThunk(
  "sections/reorderSections",
  async ({ sections, token }, { rejectWithValue }) => {
    try {
      const response = await reorderSectionsApi(sections, token);
      return response;
    } catch (error) {
      console.log("error createAsyncThunk", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSectionThunk = createAsyncThunk(
  "sections/deleteSection",
  async ({ sectionId, token }, { rejectWithValue }) => {
    try {
      await deleteSection(sectionId, token);
      return { _id: sectionId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  sections: [],
  selectedSection: null,
  status: SECTION_STATUS.IDLE,
  error: null,
  pagination: {
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    totalRecords: 0,
  },
};

const sectionSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {
    clearSelectedSection: (state) => {
      state.selectedSection = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = SECTION_STATUS.IDLE;
    },
    updateLocalOrder: (state, action) => {
      state.sections = action.payload;
    },
    clearSections: (state) => {
      state.sections = [];
      state.status = SECTION_STATUS.IDLE;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Sections
      .addCase(fetchSections.pending, (state) => {
        state.status = SECTION_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.status = SECTION_STATUS.SUCCEEDED;
        state.sections = action.payload;
        state.pagination = {
          currentPage: 1,
          limit: action.payload.length,
          totalPages: 1,
          totalRecords: action.payload.length,
        };
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.status = SECTION_STATUS.FAILED;
        state.error = action.payload;
      })
      // Fetch Section By ID
      .addCase(fetchSectionById.pending, (state) => {
        state.status = SECTION_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchSectionById.fulfilled, (state, action) => {
        state.status = SECTION_STATUS.SUCCEEDED;
        state.selectedSection = action.payload;
      })
      .addCase(fetchSectionById.rejected, (state, action) => {
        state.status = SECTION_STATUS.FAILED;
        state.error = action.payload;
      })
      // Create Section
      .addCase(createNewSection.pending, (state) => {
        state.status = SECTION_STATUS.LOADING;
        state.error = null;
      })
      .addCase(createNewSection.fulfilled, (state, action) => {
        state.status = SECTION_STATUS.SUCCEEDED;
        state.sections.push(action.payload);
        state.pagination.totalRecords += 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalRecords / state.pagination.limit
        );
      })
      .addCase(createNewSection.rejected, (state, action) => {
        state.status = SECTION_STATUS.FAILED;
        state.error = action.payload;
      })
      // Update Section
      .addCase(updateExistingSection.pending, (state) => {
        state.status = SECTION_STATUS.LOADING;
        state.error = null;
      })
      .addCase(updateExistingSection.fulfilled, (state, action) => {
        state.status = SECTION_STATUS.SUCCEEDED;
        const index = state.sections.findIndex(
          (section) => section._id === action.payload._id
        );
        if (index !== -1) {
          state.sections[index] = action.payload;
        }
        if (state.selectedSection?._id === action.payload._id) {
          state.selectedSection = action.payload;
        }
      })
      .addCase(updateExistingSection.rejected, (state, action) => {
        state.status = SECTION_STATUS.FAILED;
        state.error = action.payload;
      })
      // Delete Section
      .addCase(deleteExistingSection.pending, (state) => {
        state.status = SECTION_STATUS.LOADING;
        state.error = null;
      })
      .addCase(deleteExistingSection.fulfilled, (state, action) => {
        state.status = SECTION_STATUS.SUCCEEDED;
        state.sections = state.sections.filter(
          (section) => section._id !== action.payload
        );
        state.pagination.totalRecords -= 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalRecords / state.pagination.limit
        );
        if (state.selectedSection?._id === action.payload) {
          state.selectedSection = null;
        }
      })
      .addCase(deleteExistingSection.rejected, (state, action) => {
        state.status = SECTION_STATUS.FAILED;
        state.error = action.payload;
      })
      // Reorder Sections
      .addCase(reorderSections.pending, (state) => {
        state.status = SECTION_STATUS.LOADING;
      })
      .addCase(reorderSections.fulfilled, (state, action) => {
        state.status = SECTION_STATUS.SUCCEEDED;
        // const updatedSections = [...state.sections];
        // action.payload?.data.forEach(({ id, order }) => {
        //   const sectionIndex = updatedSections.findIndex((s) => s._id === id);
        //   if (sectionIndex !== -1) {
        //     updatedSections[sectionIndex].order = order
        //   }
        // });
        // state.sections = updatedSections.sort((a, b) => a.order - b.order);
        // state.sections = updatedSections;
        state.sections = action.payload.data;
      })
      .addCase(reorderSections.rejected, (state, action) => {
        state.status = SECTION_STATUS.FAILED;
        state.error = action.payload;
      })
      .addCase(deleteSectionThunk.pending, (state) => {
        state.status = SECTION_STATUS.LOADING;
        state.error = null;
      })
      .addCase(deleteSectionThunk.fulfilled, (state, action) => {
        state.status = SECTION_STATUS.SUCCEEDED;
        state.sections = state.sections.filter(
          (section) => section._id !== action.payload._id
        );
        state.pagination.totalRecords -= 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalRecords / state.pagination.limit
        );
      })
      .addCase(deleteSectionThunk.rejected, (state, action) => {
        state.status = SECTION_STATUS.FAILED;
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedSection,
  clearError,
  resetStatus,
  updateLocalOrder,
  clearSections,
} = sectionSlice.actions;

// Selectors
export const selectAllSections = (state) => state.sections.sections;
export const selectSectionById = (id) => (state) =>
  state.sections.sections.find((section) => section._id === id);
export const selectSelectedSection = (state) => state.sections.selectedSection;
export const selectSectionsStatus = (state) => state.sections.status;
export const selectSectionsError = (state) => state.sections.error;
export const selectSectionsPagination = (state) => state.sections.pagination;

export default sectionSlice.reducer;
