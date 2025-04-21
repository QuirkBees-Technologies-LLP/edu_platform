import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  courses: [],
  featuredCourses: [],
  popularCourses: [],
  selectedCategory: null,
  selectedProfessor: null,
  visibleCourses: 9,
  loading: false,
  error: null,
};

export const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
    setFeaturedCourses: (state, action) => {
      state.featuredCourses = action.payload;
    },
    setPopularCourses: (state, action) => {
      state.popularCourses = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.visibleCourses = 9; // Reset visible courses when changing category
    },
    setSelectedProfessor: (state, action) => {
      state.selectedProfessor = action.payload;
      state.visibleCourses = 9; // Reset visible courses when changing professor
    },
    incrementVisibleCourses: (state) => {
      state.visibleCourses = Math.min(
        state.visibleCourses + 9,
        state.courses.length
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCourses,
  setFeaturedCourses,
  setPopularCourses,
  setSelectedCategory,
  setSelectedProfessor,
  incrementVisibleCourses,
  setLoading,
  setError,
} = coursesSlice.actions;

export default coursesSlice.reducer;
