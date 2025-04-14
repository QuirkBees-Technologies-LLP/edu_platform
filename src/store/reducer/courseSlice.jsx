import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  reorderCourses as reorderCoursesApi,
} from "@/services/lms.api";

// Async thunks
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (token, { rejectWithValue }) => {
    try {
      const courses = await getAllCourses(token);
      return courses.sort((a, b) => a.order - b.order);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewCourse = createAsyncThunk(
  "courses/createNewCourse",
  async ({ courseData, token }, { rejectWithValue }) => {
    try {
      return await createCourse(courseData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingCourse = createAsyncThunk(
  "courses/updateExistingCourse",
  async ({ courseId, courseData, token }, { rejectWithValue }) => {
    try {
      return await updateCourse(courseId, courseData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExistingCourse = createAsyncThunk(
  "courses/deleteExistingCourse",
  async ({ courseId, token }, { rejectWithValue }) => {
    try {
      await deleteCourse(courseId, token);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reorderCourses = createAsyncThunk(
  "courses/reorderCourses",
  async ({ dragIndex, hoverIndex, token }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const newCourses = [...state.courses.courses];
      const draggedCourse = newCourses[dragIndex];
      newCourses.splice(dragIndex, 1);
      newCourses.splice(hoverIndex, 0, draggedCourse);

      const courseOrders = newCourses.map((course, index) => ({
        id: course.id,
        order: index,
      }));

      await reorderCoursesApi(courseOrders, token);
      return newCourses;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload;
    },
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Course
      .addCase(createNewCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.push(action.payload);
      })
      .addCase(createNewCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Course
      .addCase(updateExistingCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExistingCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.map((course) =>
          course.id === action.payload.id ? action.payload : course
        );
        if (state.selectedCourse?.id === action.payload.id) {
          state.selectedCourse = action.payload;
        }
      })
      .addCase(updateExistingCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Course
      .addCase(deleteExistingCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteExistingCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter(
          (course) => course.id !== action.payload
        );
        if (state.selectedCourse?.id === action.payload) {
          state.selectedCourse = null;
        }
      })
      .addCase(deleteExistingCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reorder Courses
      .addCase(reorderCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
      })
      .addCase(reorderCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedCourse, clearSelectedCourse, clearError } =
  courseSlice.actions;
export default courseSlice.reducer;
