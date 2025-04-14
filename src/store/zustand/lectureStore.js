import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getLecturesBySectionId,
  createLecture,
  updateLecture,
  deleteLecture,
  reorderLectures as reorderLecturesApi,
  moveLectureToSection as moveLectureToSectionApi,
} from "@/services/lms.api";

export const useLectureStore = create(
  persist(
    (set, get) => ({
      lectures: [],
      selectedLecture: null,
      isLoading: false,
      error: null,

      // Actions
      setLectures: (lectures) => set({ lectures }),
      setSelectedLecture: (lecture) => set({ selectedLecture: lecture }),
      clearSelectedLecture: () => set({ selectedLecture: null }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Async Actions
      fetchLectures: async (sectionId, token) => {
        try {
          set({ isLoading: true, error: null });
          const lectures = await getLecturesBySectionId(sectionId, token);
          // sort lectures by order
          const sortedLectures = lectures.sort((a, b) => a.order - b.order);
          set({ lectures: sortedLectures, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      createNewLecture: async (lectureData, token) => {
        try {
          set({ isLoading: true, error: null });
          const newLecture = await createLecture(lectureData, token);
          set((state) => ({
            lectures: [...state.lectures, newLecture],
            isLoading: false,
          }));
          return newLecture;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateExistingLecture: async (lectureId, lectureData, token) => {
        try {
          set({ isLoading: true, error: null });
          const updatedLecture = await updateLecture(
            lectureId,
            lectureData,
            token
          );
          set((state) => ({
            lectures: state.lectures.map((lecture) =>
              lecture.id === lectureId ? updatedLecture : lecture
            ),
            selectedLecture:
              state.selectedLecture?.id === lectureId
                ? updatedLecture
                : state.selectedLecture,
            isLoading: false,
          }));
          return updatedLecture;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteExistingLecture: async (lectureId, token) => {
        try {
          set({ isLoading: true, error: null });
          await deleteLecture(lectureId, token);
          set((state) => ({
            lectures: state.lectures.filter(
              (lecture) => lecture.id !== lectureId
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      reorderLectures: async (dragIndex, hoverIndex, token) => {
        try {
          set({ isLoading: true, error: null });
          const newLectures = [...get().lectures];
          const draggedLecture = newLectures[dragIndex];
          newLectures.splice(dragIndex, 1);
          newLectures.splice(hoverIndex, 0, draggedLecture);

          // Update backend
          const lectureOrders = newLectures.map((lecture, index) => ({
            id: lecture.id,
            order: index,
          }));
          await reorderLecturesApi(lectureOrders, token);

          // Update local state
          set({ lectures: newLectures, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      moveLectureToSection: async (lectureId, newSectionId, token) => {
        try {
          set({ isLoading: true, error: null });
          await moveLectureToSectionApi(lectureId, newSectionId, token);
          set((state) => ({
            lectures: state.lectures.filter(
              (lecture) => lecture.id !== lectureId
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "lecture-storage",
      partialize: (state) => ({ lectures: state.lectures }),
    }
  )
);
