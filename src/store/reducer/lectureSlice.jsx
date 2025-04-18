import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllLectures,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
  reorderLectures,
} from "@/services/lms.lectures";

// Types
const LECTURE_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};

// Async thunks
export const fetchLectures = createAsyncThunk(
  "lectures/fetchAll",
  async ({ sectionId, token }, { rejectWithValue }) => {
    try {
      const response = await getAllLectures({ section: sectionId }, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lectures"
      );
    }
  }
);

export const fetchLectureById = createAsyncThunk(
  "lectures/fetchById",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await getLectureById(id, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lecture"
      );
    }
  }
);

export const createNewLecture = createAsyncThunk(
  "lectures/create",
  async ({ lectureData, token }, { rejectWithValue }) => {
    try {
      const response = await createLecture(lectureData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create lecture"
      );
    }
  }
);

export const updateExistingLecture = createAsyncThunk(
  "lectures/update",
  async ({ id, lectureData, token }, { rejectWithValue }) => {
    try {
      const response = await updateLecture(id, lectureData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update lecture"
      );
    }
  }
);

export const deleteExistingLecture = createAsyncThunk(
  "lectures/delete",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await deleteLecture(id, token);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete lecture"
      );
    }
  }
);

export const reorderExistingLectures = createAsyncThunk(
  "lectures/reorder",
  async ({ lectures, token }, { rejectWithValue }) => {
    try {
      const response = await reorderLectures(lectures, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reorder lectures"
      );
    }
  }
);

export const moveLectureToSection = createAsyncThunk(
  "lectures/moveToSection",
  async ({ lectureId, newSectionId, token }, { rejectWithValue }) => {
    try {
      const response = await updateLecture(
        lectureId,
        { section: newSectionId },
        token
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to move lecture"
      );
    }
  }
);

const initialState = {
  lectures: [],
  selectedLecture: null,
  status: LECTURE_STATUS.IDLE,
  error: null,
  pagination: {
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    totalRecords: 0,
  },
};

const lectureSlice = createSlice({
  name: "lectures",
  initialState,
  reducers: {
    clearLectures: (state) => {
      state.lectures = [];
      state.status = LECTURE_STATUS.IDLE;
      state.error = null;
      state.pagination = initialState.pagination;
    },
    clearSelectedLecture: (state) => {
      state.selectedLecture = null;
    },
    setSelectedLecture: (state, action) => {
      state.selectedLecture = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Lectures
      .addCase(fetchLectures.pending, (state) => {
        state.status = LECTURE_STATUS.LOADING;
      })
      .addCase(fetchLectures.fulfilled, (state, action) => {
        state.status = LECTURE_STATUS.SUCCEEDED;
        // No actualizamos el estado global, solo retornamos los datos
      })
      .addCase(fetchLectures.rejected, (state, action) => {
        state.status = LECTURE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Create Lecture
      .addCase(createNewLecture.pending, (state) => {
        state.status = LECTURE_STATUS.LOADING;
      })
      .addCase(createNewLecture.fulfilled, (state, action) => {
        state.status = LECTURE_STATUS.SUCCEEDED;
        state.lectures.push(action.payload);
        state.pagination.totalRecords += 1;
      })
      .addCase(createNewLecture.rejected, (state, action) => {
        state.status = LECTURE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Update Lecture
      .addCase(updateExistingLecture.pending, (state) => {
        state.status = LECTURE_STATUS.LOADING;
      })
      .addCase(updateExistingLecture.fulfilled, (state, action) => {
        state.status = LECTURE_STATUS.SUCCEEDED;
        const index = state.lectures.findIndex(
          (lecture) => lecture._id === action.payload._id
        );
        if (index !== -1) {
          state.lectures[index] = action.payload;
        }
        if (state.selectedLecture?._id === action.payload._id) {
          state.selectedLecture = action.payload;
        }
      })
      .addCase(updateExistingLecture.rejected, (state, action) => {
        state.status = LECTURE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Delete Lecture
      .addCase(deleteExistingLecture.pending, (state) => {
        state.status = LECTURE_STATUS.LOADING;
      })
      .addCase(deleteExistingLecture.fulfilled, (state, action) => {
        state.status = LECTURE_STATUS.SUCCEEDED;
        state.lectures = state.lectures.filter(
          (lecture) => lecture._id !== action.payload.id
        );
        state.pagination.totalRecords -= 1;
        if (state.selectedLecture?._id === action.payload.id) {
          state.selectedLecture = null;
        }
      })
      .addCase(deleteExistingLecture.rejected, (state, action) => {
        state.status = LECTURE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Reorder Lectures
      .addCase(reorderExistingLectures.pending, (state) => {
        state.status = LECTURE_STATUS.LOADING;
      })
      .addCase(reorderExistingLectures.fulfilled, (state, action) => {
        state.status = LECTURE_STATUS.SUCCEEDED;
        // Update the order of lectures in the state
        const newLectures = [...state.lectures];
        action.payload.forEach(({ id, order }) => {
          const lectureIndex = newLectures.findIndex(
            (lecture) => lecture._id === id
          );
          if (lectureIndex !== -1) {
            newLectures[lectureIndex] = {
              ...newLectures[lectureIndex],
              order,
            };
          }
        });
        // Sort lectures by order and update state
        state.lectures = newLectures.sort((a, b) => a.order - b.order);
      })
      .addCase(reorderExistingLectures.rejected, (state, action) => {
        state.status = LECTURE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Move Lecture to Section
      .addCase(moveLectureToSection.pending, (state) => {
        state.status = LECTURE_STATUS.LOADING;
      })
      .addCase(moveLectureToSection.fulfilled, (state, action) => {
        state.status = LECTURE_STATUS.SUCCEEDED;
        const index = state.lectures.findIndex(
          (lecture) => lecture._id === action.payload._id
        );
        if (index !== -1) {
          state.lectures[index] = action.payload;
        }
        if (state.selectedLecture?._id === action.payload._id) {
          state.selectedLecture = action.payload;
        }
      })
      .addCase(moveLectureToSection.rejected, (state, action) => {
        state.status = LECTURE_STATUS.FAILED;
        state.error = action.payload;
      });
  },
});

export const { clearLectures, clearSelectedLecture, setSelectedLecture } =
  lectureSlice.actions;

// Selectors
export const selectAllLectures = (state) => state.lectures.lectures;
export const selectLectureById = (id) => (state) =>
  state.lectures.lectures.find((lecture) => lecture._id === id);
export const selectSelectedLecture = (state) => state.lectures.selectedLecture;
export const selectLecturesStatus = (state) => state.lectures.status;
export const selectLecturesError = (state) => state.lectures.error;
export const selectLecturesPagination = (state) => state.lectures.pagination;

export default lectureSlice.reducer;
