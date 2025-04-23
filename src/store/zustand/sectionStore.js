import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getSectionsByCourseId,
  createSection,
  updateSection,
  deleteSection,
  reorderSections as reorderSectionsApi,
} from "@/services/lms.api";

export const useSectionStore = create(
  persist(
    (set, get) => ({
      sections: [],
      selectedSection: null,
      isLoading: false,
      error: null,

      // Actions
      setSections: (sections) => set({ sections }),
      setSelectedSection: (section) => set({ selectedSection: section }),
      clearSelectedSection: () => set({ selectedSection: null }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Async Actions
      fetchSections: async (courseId, token) => {
        try {
          set({ isLoading: true, error: null });
          const sections = await getSectionsByCourseId(courseId, token);
          // sort sections by order
          const sortedSections = sections.sort((a, b) => a.order - b.order);
          set({ sections: sortedSections, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      createNewSection: async (sectionData, token) => {
        try {
          set({ isLoading: true, error: null });
          const newSection = await createSection(sectionData, token);
          set((state) => ({
            sections: [...state.sections, newSection],
            isLoading: false,
          }));
          return newSection;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateExistingSection: async (sectionId, sectionData, token) => {
        try {
          set({ isLoading: true, error: null });
          const updatedSection = await updateSection(
            sectionId,
            sectionData,
            token
          );
          set((state) => ({
            sections: state.sections.map((section) =>
              section.id === sectionId ? updatedSection : section
            ),
            selectedSection:
              state.selectedSection?.id === sectionId
                ? updatedSection
                : state.selectedSection,
            isLoading: false,
          }));
          return updatedSection;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteSection: async (sectionId, token) => {
        try {
          set({ isLoading: true, error: null });
          await deleteSection(sectionId, token);
          set((state) => ({
            sections: state.sections.filter(
              (section) => section.id !== sectionId
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      reorderSections: async (courseId, dragIndex, hoverIndex, token) => {
        try {
          set({ isLoading: true, error: null });

          // Create a new array with the updated order
          const newSections = [...get().sections];
          const draggedSection = newSections[dragIndex];
          newSections.splice(dragIndex, 1);
          newSections.splice(hoverIndex, 0, draggedSection);

          // Update backend
          const sectionOrders = newSections.map((section, index) => ({
            id: section.id,
            order: index,
          }));
          await reorderSectionsApi(sectionOrders, token);

          // Update local state with the new order
          set({ sections: newSections, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "section-storage",
      partialize: (state) => ({ sections: state.sections }),
    }
  )
);
