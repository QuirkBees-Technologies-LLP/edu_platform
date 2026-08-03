import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  languages: [
    { _id: '1', name: 'English' },
    { _id: '2', name: 'Hindi' },
    { _id: '3', name: 'Spanish' },
    { _id: '4', name: 'German' }
  ],
  selectedLanguage: 'English',
  selectedLanguagesAdmin: ['English', 'Hindi', 'Spanish', 'German'],
  hasInitializedAdminLanguages: false
};

const studentLanagugeSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setSelectedLanguagesAdmin: (state, action) => {
      state.selectedLanguagesAdmin = action.payload;
    },
    toggleLanguageAdmin: (state, action) => {
      const language = action.payload;
      if (state.selectedLanguagesAdmin.includes(language)) {
        state.selectedLanguagesAdmin = state.selectedLanguagesAdmin.filter(l => l !== language);
      } else {
        state.selectedLanguagesAdmin.push(language);
      }
    },
    setLanguages: (state, action) => {
      state.languages = action.payload;
      if (!state.hasInitializedAdminLanguages && Array.isArray(action.payload) && action.payload.length > 0) {
        state.selectedLanguagesAdmin = action.payload.map(l => l.name);
        state.hasInitializedAdminLanguages = true;
      }
    }
  }
});

export const { setSelectedLanguage, setSelectedLanguagesAdmin, toggleLanguageAdmin, setLanguages } = studentLanagugeSlice.actions;

export const selectLanguages = (state) => state.language.languages;
export const selectSelectedLanguage = (state) => state.language.selectedLanguage;
export const selectSelectedLanguagesAdmin = (state) => state.language.selectedLanguagesAdmin;

export default studentLanagugeSlice.reducer;
