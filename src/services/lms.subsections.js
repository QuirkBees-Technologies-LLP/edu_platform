import api from "./axiosConfig";

/**
 * Get all subsections for a section
 * @param {Object} params - Query parameters (e.g. { section: sectionId })
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const getAllSubsections = async (params = {}, token) => {
  const response = await api.get("/admin/subsection", {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Get a single subsection by ID
 * @param {string} id - Subsection ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const getSubsectionById = async (id, token) => {
  const response = await api.get(`/admin/subsection/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Create a new subsection
 * @param {Object} subsectionData - Subsection data ({ title, order, section })
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const createSubsection = async (subsectionData, token) => {
  const response = await api.post("/admin/subsection", subsectionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Update an existing subsection
 * @param {string} id - Subsection ID
 * @param {Object} subsectionData - Updated subsection data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const updateSubsection = async (id, subsectionData, token) => {
  const response = await api.put(`/admin/subsection/${id}`, subsectionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Delete a subsection (soft delete)
 * @param {string} id - Subsection ID
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const deleteSubsection = async (id, token) => {
  const response = await api.delete(`/admin/subsection/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Reorder subsections within a section
 * @param {Array} subsections - Array of subsections with new order
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response data
 */
export const reorderSubsections = async (subsections, token = null) => {
  const response = await api.put(
    "/admin/subsection/reorder",
    { subsections },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
