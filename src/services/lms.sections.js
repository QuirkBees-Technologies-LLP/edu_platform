import api from "./axiosConfig";

/**
 * Get all sections with optional filters and pagination
 * @param {Object} params - Query parameters
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const getAllSections = async (params = {}, token) => {
  const response = await api.get("/admin/section", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get a single section by ID
 * @param {string} id - Section ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const getSectionById = async (id, token) => {
  const response = await api.get(`/admin/section/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Create a new section
 * @param {Object} sectionData - Section data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const createSection = async (sectionData, token) => {
  const response = await api.post("/admin/section", sectionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Update an existing section
 * @param {string} id - Section ID
 * @param {Object} sectionData - Updated section data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const updateSection = async (id, sectionData, token) => {
  const response = await api.put(`/admin/section/${id}`, sectionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Delete a section (soft delete)
 * @param {string} id - Section ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const deleteSection = async (id, token) => {
  const response = await api.delete(`/admin/section/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Reordena las secciones de un curso
 * @param {Array} sections - Array de secciones con sus nuevos órdenes
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} - Array de secciones reordenadas
 */
export const reorderSections = async (sections, token = null) => {
  try {
    const response = await api.put(
      "/admin/section/reorder",
      { sections },
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
