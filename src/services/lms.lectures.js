import api from "./axiosConfig";

/**
 * Get all lectures with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search term for title or description
 * @param {string} params.section - Filter by section ID
 * @param {string} params.title - Filter by title
 * @param {string} params.description - Filter by description
 * @param {string} params.type - Filter by type (VIDEO, TEXT, QUIZ, ASSIGNMENT)
 * @param {boolean} params.preview - Filter by preview status
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response with lectures and pagination info
 */
export const getAllLectures = async (params = {}, token = null) => {
  try {
    const response = await api.get("/admin/lecture", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a single lecture by ID
 * @param {string} id - The lecture ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Lecture data
 */
export const getLectureById = async (id, token = null) => {
  try {
    const response = await api.get(`/admin/lecture/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new lecture
 * @param {Object} lectureData - Lecture data
 * @param {string} lectureData.title - Lecture title
 * @param {string} lectureData.description - Lecture description
 * @param {string} lectureData.content - Lecture content
 * @param {string} lectureData.type - Lecture type (VIDEO, TEXT, QUIZ, ASSIGNMENT)
 * @param {boolean} lectureData.preview - Whether lecture is previewable
 * @param {string} lectureData.thumbnailUrl - Lecture thumbnail URL
 * @param {number} lectureData.order - Lecture order
 * @param {string} lectureData.section - Section ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Created lecture data
 */
export const createLecture = async (lectureData, token = null) => {
  try {
    const response = await api.post("/admin/lecture", lectureData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing lecture
 * @param {string} id - The lecture ID
 * @param {Object} lectureData - Updated lecture data
 * @param {string} lectureData.title - Lecture title
 * @param {string} lectureData.description - Lecture description
 * @param {string} lectureData.content - Lecture content
 * @param {string} lectureData.type - Lecture type (VIDEO, TEXT, QUIZ, ASSIGNMENT)
 * @param {boolean} lectureData.preview - Whether lecture is previewable
 * @param {string} lectureData.thumbnailUrl - Lecture thumbnail URL
 * @param {number} lectureData.order - Lecture order
 * @param {string} lectureData.section - Section ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Updated lecture data
 */
export const updateLecture = async (id, lectureData, token = null) => {
  try {
    const response = await api.put(`/admin/lecture/${id}`, lectureData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a lecture (soft delete)
 * @param {string} id - The lecture ID
 * @param {string} token - Authentication token
 * @returns {Promise<void>}
 */
export const deleteLecture = async (id, token = null) => {
  try {
    const response = await api.delete(`/admin/lecture/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reorder lectures
 * @param {Array} lectures - Array of lectures with new order
 * @param {Object} lectures[].id - Lecture ID
 * @param {number} lectures[].order - New order position
 * @param {string} token - Authentication token
 * @returns {Promise<void>}
 */
export const reorderLectures = async (lectures, token = null) => {
  try {
    const response = await api.put(
      "/admin/lecture/reorder",
      { lectures },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
