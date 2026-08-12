import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  suffix: null,
};

const breadcrumbSlice = createSlice({
  name: "breadcrumb",
  initialState,
  reducers: {
    setBreadcrumbSuffix: (state, action) => {
      state.suffix = action.payload;
    },
    clearBreadcrumbSuffix: (state) => {
      state.suffix = null;
    },
  },
});

export const { setBreadcrumbSuffix, clearBreadcrumbSuffix } = breadcrumbSlice.actions;
export const selectBreadcrumbSuffix = (state) => state.breadcrumb.suffix;

export default breadcrumbSlice.reducer;
