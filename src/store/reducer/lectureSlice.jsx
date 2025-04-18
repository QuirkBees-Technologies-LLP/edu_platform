import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLecturesBySectionId,
  createLecture,
  updateLecture,
  deleteLecture,
  reorderLectures as reorderLecturesApi,
  moveLectureToSection as moveLectureToSectionApi,
} from "@/services/lms.api";

// Async thunks
export const fetchLectures = createAsyncThunk(
  "lectures/fetchLectures",
  async ({ sectionId, token }, { rejectWithValue }) => {
    try {
      const lectures = await getLecturesBySectionId(sectionId, token);
      return lectures.sort((a, b) => a.order - b.order);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewLecture = createAsyncThunk(
  "lectures/createNewLecture",
  async ({ lectureData, token }, { rejectWithValue }) => {
    try {
      return await createLecture(lectureData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingLecture = createAsyncThunk(
  "lectures/updateExistingLecture",
  async ({ lectureId, lectureData, token }, { rejectWithValue }) => {
    try {
      return await updateLecture(lectureId, lectureData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExistingLecture = createAsyncThunk(
  "lectures/deleteExistingLecture",
  async ({ lectureId, token }, { rejectWithValue }) => {
    try {
      await deleteLecture(lectureId, token);
      return lectureId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reorderLectures = createAsyncThunk(
  "lectures/reorderLectures",
  async ({ dragIndex, hoverIndex, token }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const newLectures = [...state.lectures.lectures];
      const draggedLecture = newLectures[dragIndex];
      newLectures.splice(dragIndex, 1);
      newLectures.splice(hoverIndex, 0, draggedLecture);

      const lectureOrders = newLectures.map((lecture, index) => ({
        id: lecture.id,
        order: index,
      }));

      await reorderLecturesApi(lectureOrders, token);
      return newLectures;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveLectureToSection = createAsyncThunk(
  "lectures/moveLectureToSection",
  async ({ lectureId, newSectionId, token }, { rejectWithValue }) => {
    try {
      await moveLectureToSectionApi(lectureId, newSectionId, token);
      return { lectureId, newSectionId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  lectures: [],
  selectedLecture: null,
  isLoading: false,
  error: null,
};

const lectureSlice = createSlice({
  name: "lectures",
  initialState,
  reducers: {
    setSelectedLecture: (state, action) => {
      state.selectedLecture = action.payload;
    },
    clearSelectedLecture: (state) => {
      state.selectedLecture = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Lectures
      .addCase(fetchLectures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLectures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lectures = action.payload;
      })
      .addCase(fetchLectures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Lecture
      .addCase(createNewLecture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewLecture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lectures.push(action.payload);
      })
      .addCase(createNewLecture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Lecture
      .addCase(updateExistingLecture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingLecture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lectures = state.lectures.map((lecture) =>
          lecture.id === action.payload.id ? action.payload : lecture
        );
        if (state.selectedLecture?.id === action.payload.id) {
          state.selectedLecture = action.payload;
        }
      })
      .addCase(updateExistingLecture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Lecture
      .addCase(deleteExistingLecture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExistingLecture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lectures = state.lectures.filter(
          (lecture) => lecture.id !== action.payload
        );
        if (state.selectedLecture?.id === action.payload) {
          state.selectedLecture = null;
        }
      })
      .addCase(deleteExistingLecture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reorder Lectures
      .addCase(reorderLectures.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderLectures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lectures = action.payload;
      })
      .addCase(reorderLectures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Move Lecture to Section
      .addCase(moveLectureToSection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveLectureToSection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lectures = state.lectures.filter(
          (lecture) => lecture.id !== action.payload.lectureId
        );
      })
      .addCase(moveLectureToSection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedLecture, clearSelectedLecture, clearError } =
  lectureSlice.actions;

// Selectors
export const selectAllLectures = (state) => state.lectures.lectures;
export const selectSelectedLecture = (state) => state.lectures.selectedLecture;
export const selectLecturesStatus = (state) => state.lectures.isLoading;
export const selectLecturesError = (state) => state.lectures.error;

export default lectureSlice.reducer;
