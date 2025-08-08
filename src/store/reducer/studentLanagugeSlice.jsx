import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  languages: [
    { _id: '1', name: 'English' },
    { _id: '2', name: 'Hindi' },
    { _id: '3', name: 'Spanish' },
    { _id: '4', name: 'German' }
  ],
  selectedLanguage: 'English'
};

const studentLanagugeSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setLanguages: (state, action) => {
      state.languages = action.payload;
    }
  }
});

export const { setSelectedLanguage,setLanguages } = studentLanagugeSlice.actions;

export const selectLanguages = (state) => state.language.languages;
export const selectSelectedLanguage = (state) => state.language.selectedLanguage;

export default studentLanagugeSlice.reducer;
