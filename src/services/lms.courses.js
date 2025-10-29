import api from "./axiosConfig";

/**
 * Get all courses with optional pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search term for title or description
 * @param {string} params.title - Filter by title
 * @param {string} params.description - Filter by description
 * @param {boolean} params.isPublished - Filter by publication status
 * @param {boolean} params.isDeleted - Filter by deletion status
 * @returns {Promise<Object>} Response with courses and pagination info
 */
export const getAllCourses = async (params = {}, token = null) => {
  try {
    const response = await api.get("/admin/course", {
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

export const getCourseByEducatorId = async (id, token = null) => {
  try {
    const response = await api.get(
      `/users/course?instructor=${id}&isPublished=true`,
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

/**
 * Get a single course by ID
 * @param {string} id - Course ID
 * @returns {Promise<Object>} Course data
 */
export const getCourseById = async (id, token = null) => {
  try {
    const response = await api.get(`/admin/course/${id}`, {
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
 * Create a new course
 * @param {Object} courseData - Course data
 * @param {string} courseData.title - Course title
 * @param {string} courseData.description - Course description
 * @returns {Promise<Object>} Created course data
 */
export const createCourse = async (courseData, token = null) => {
  try {
    const response = await api.post("/admin/course", courseData, {
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
 * Update an existing course
 * @param {string} id - Course ID
 * @param {Object} courseData - Course data to update
 * @param {string} [courseData.title] - Updated title
 * @param {string} [courseData.description] - Updated description
 * @param {number} [courseData.price] - Updated price
 * @param {boolean} [courseData.published] - Publication status
 * @param {boolean} [courseData.isFeatured] - Featured status
 * @param {string} [courseData.tier] - Course tier (e.g., "PREMIUM")
 * @param {string} [courseData.category] - Course category (e.g., "PROGRAMMING")
 * @param {string} [courseData.imageUrl] - Course image URL
 * @returns {Promise<Object>} Updated course data
 */
export const updateCourse = async (id, courseData, token = null) => {
  try {
    const response = await api.put(`/admin/course/${id}`, courseData, {
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
 * Soft delete a course
 * @param {string} id - Course ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteCourse = async (id, token = null) => {
  try {
    const response = await api.delete(`/admin/course/${id}`, {
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
 * Reorder courses
 * @param {Array<Object>} courses - Array of course objects with id and order
 * @param {string} courses[].id - Course ID
 * @param {number} courses[].order - New order for the course
 * @returns {Promise<Object>} Reordering confirmation
 */
export const reorderCourses = async (courses, token = null) => {
  try {
    const response = await api.put(
      "/admin/course/reorder",
      { courses },
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
