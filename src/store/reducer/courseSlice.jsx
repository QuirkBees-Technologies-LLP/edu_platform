import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses as reorderCoursesApi,
} from "@/services/lms.courses";
import { getCourseByEducatorId } from "../../services/lms.courses";

// Types
const COURSE_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  "courses/fetchAll",
  async ({ params = {}, token }, { rejectWithValue }) => {
    try {
      const response = await getAllCourses(params, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

export const fetchCoursesByEducatorId = createAsyncThunk(
  "courses/fetchByEducatorId",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await getCourseByEducatorId(id, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch courses"
      );
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  "courses/fetchById",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await getCourseById(id, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch course"
      );
    }
  }
);

export const createNewCourse = createAsyncThunk(
  "courses/create",
  async ({ courseData, token }, { rejectWithValue }) => {
    try {
      const response = await createCourse(courseData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create course"
      );
    }
  }
);

export const updateExistingCourse = createAsyncThunk(
  "courses/update",
  async ({ id, courseData, token }, { rejectWithValue }) => {
    try {
      const response = await updateCourse(id, courseData, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update course"
      );
    }
  }
);

export const deleteExistingCourse = createAsyncThunk(
  "courses/delete",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await deleteCourse(id, token);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete course"
      );
    }
  }
);

export const reorderCourses = createAsyncThunk(
  "courses/reorder",
  async ({ courses, token }, { rejectWithValue }) => {
    try {
      const response = await reorderCoursesApi(courses, token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reorder courses"
      );
    }
  }
);

const initialState = {
  courses: [],
  selectedCourse: null,
  status: COURSE_STATUS.IDLE,
  error: null,
  pagination: {
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    totalRecords: 0,
  },
};

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearSelectedCourse: (state) => {
      state.selectedCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = COURSE_STATUS.IDLE;
    },
    updateLocalOrder: (state, action) => {
      state.courses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Courses
      .addCase(fetchCourses.pending, (state) => {
        state.status = COURSE_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = COURSE_STATUS.SUCCEEDED;
        state.courses = action.payload;
        state.pagination = {
          currentPage: 1,
          limit: action.payload.length,
          totalPages: 1,
          totalRecords: action.payload.length,
        };
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = COURSE_STATUS.FAILED;
        state.error = action.payload;
      })

      // Fetch Course By educator ID
      .addCase(fetchCoursesByEducatorId.pending, (state) => {
        state.status = COURSE_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchCoursesByEducatorId.fulfilled, (state, action) => {
        state.status = COURSE_STATUS.SUCCEEDED;
        state.courses = action.payload;
        state.pagination = {
          currentPage: 1,
          limit: action.payload.length,
          totalPages: 1,
          totalRecords: action.payload.length,
        };
      })
      .addCase(fetchCoursesByEducatorId.rejected, (state, action) => {
        state.status = COURSE_STATUS.FAILED;
        state.error = action.payload;
      })

      // Fetch Course By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.status = COURSE_STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.status = COURSE_STATUS.SUCCEEDED;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.status = COURSE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Create Course
      .addCase(createNewCourse.pending, (state) => {
        state.status = COURSE_STATUS.LOADING;
        state.error = null;
      })
      .addCase(createNewCourse.fulfilled, (state, action) => {
        state.status = COURSE_STATUS.SUCCEEDED;
        state.courses.push(action.payload);
        state.pagination.totalRecords += 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalRecords / state.pagination.limit
        );
      })
      .addCase(createNewCourse.rejected, (state, action) => {
        state.status = COURSE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Update Course
      .addCase(updateExistingCourse.pending, (state) => {
        state.status = COURSE_STATUS.LOADING;
        state.error = null;
      })
      .addCase(updateExistingCourse.fulfilled, (state, action) => {
        state.status = COURSE_STATUS.SUCCEEDED;
        const index = state.courses.findIndex(
          (course) => course._id === action.payload._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.selectedCourse?._id === action.payload._id) {
          state.selectedCourse = action.payload;
        }
      })
      .addCase(updateExistingCourse.rejected, (state, action) => {
        state.status = COURSE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Delete Course
      .addCase(deleteExistingCourse.pending, (state) => {
        state.status = COURSE_STATUS.LOADING;
        state.error = null;
      })
      .addCase(deleteExistingCourse.fulfilled, (state, action) => {
        state.status = COURSE_STATUS.SUCCEEDED;
        state.courses = state.courses.filter(
          (course) => course._id !== action.payload
        );
        state.pagination.totalRecords -= 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalRecords / state.pagination.limit
        );
        if (state.selectedCourse?._id === action.payload) {
          state.selectedCourse = null;
        }
      })
      .addCase(deleteExistingCourse.rejected, (state, action) => {
        state.status = COURSE_STATUS.FAILED;
        state.error = action.payload;
      })
      // Reorder Courses
      .addCase(reorderCourses.pending, (state) => {
        state.status = COURSE_STATUS.LOADING;
        state.error = null;
      })
      .addCase(reorderCourses.fulfilled, (state, action) => {
        state.status = COURSE_STATUS.SUCCEEDED;
        // Update the order of courses in the state
        const newCourses = [...state.courses];
        action.payload.forEach(({ id, order }) => {
          const courseIndex = newCourses.findIndex(
            (course) => course._id === id
          );
          if (courseIndex !== -1) {
            newCourses[courseIndex] = {
              ...newCourses[courseIndex],
              order,
            };
          }
        });
        // Sort courses by order and update state
        state.courses = newCourses.sort((a, b) => a.order - b.order);
      })
      .addCase(reorderCourses.rejected, (state, action) => {
        state.status = COURSE_STATUS.FAILED;
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedCourse,
  clearError,
  resetStatus,
  updateLocalOrder,
} = courseSlice.actions;

// Selectors
export const selectAllCourses = (state) => state.courses.courses;
export const selectCourseById = (id) => (state) =>
  state.courses.courses.find((course) => course._id === id);
export const selectSelectedCourse = (state) => state.courses.selectedCourse;
export const selectCoursesStatus = (state) => state.courses.status;
export const selectCoursesError = (state) => state.courses.error;
export const selectCoursesPagination = (state) => state.courses.pagination;

export default courseSlice.reducer;
