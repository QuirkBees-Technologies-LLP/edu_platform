import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// auth
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const register = async (credentials) => {
  const response = await api.post("/auth/register", credentials);
  return response.data;
};

// courses
export const getAllCourses = async (token) => {
  try {
    const { data } = await api.get("/courses/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

export const getCourseById = async (courseId, token) => {
  try {
    const { data } = await api.get(`/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch course");
  }
};

// only admin and instructor can create course
export const createCourse = async (courseData, token) => {
  try {
    // for better control of the data.
    const payload = {
      title: courseData.title,
      description: courseData.description,
      imageUrl: courseData.imageUrl,
      category: courseData.category,
      tier: courseData.tier,
      published: courseData.published,
      isFeatured: courseData.isFeatured,
    };
    const { data } = await api.post("/courses", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

export const updateCourse = async (courseId, courseData, token) => {
  try {
    // for better control of the data.
    const payload = {
      title: courseData.title,
      description: courseData.description,
      imageUrl: courseData.imageUrl,
      category: courseData.category,
      tier: courseData.tier,
      published: courseData.published,
      isFeatured: courseData.isFeatured,
    };
    const response = await api.put(`/courses/${courseId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update course");
  }
};

export const reorderCourses = async (courseOrders, token) => {
  try {
    const response = await api.put(
      "/courses/reorder",
      { courseOrders: courseOrders },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to reorder courses"
    );
  }
};

export const deleteCourse = async (courseId, token) => {
  try {
    const response = await api.delete(`/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete course");
  }
};

// sections
export const getSectionsByCourseId = async (courseId, token) => {
  const response = await api.get(`/sections/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getSectionById = async (sectionId, token) => {
  const response = await api.get(`/sections/${sectionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createSection = async (sectionData, token) => {
  const payload = {
    title: sectionData.title,
    description: sectionData.description,
    courseId: sectionData.courseId,
  };

  const response = await api.post("/sections", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateSection = async (sectionId, sectionData, token) => {
  const payload = {
    title: sectionData.title,
    description: sectionData.description,
    courseId: sectionData.courseId,
  };
  const response = await api.put(`/sections/${sectionId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const reorderSections = async (sectionOrders, token) => {
  const response = await api.put(
    "/sections/reorder",
    { sectionOrders },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const deleteSection = async (sectionId, token) => {
  const response = await api.delete(`/sections/${sectionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// lectures
export const getLecturesBySectionId = async (sectionId, token) => {
  const response = await api.get(`/lectures/section/${sectionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getLectureById = async (lectureId, token) => {
  const response = await api.get(`/lectures/${lectureId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createLecture = async (lectureData, token) => {
  const payload = {
    title: lectureData.title,
    description: lectureData.description,
    content: lectureData.content,
    type: lectureData.type,
    preview: lectureData.preview,
    sectionId: lectureData.sectionId,
    thumbnailUrl: lectureData.thumbnailUrl,
  };
  const response = await api.post("/lectures", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateLecture = async (lectureId, lectureData, token) => {
  const payload = {
    title: lectureData.title,
    description: lectureData.description,
    content: lectureData.content,
    type: lectureData.type,
    preview: lectureData.preview,
    sectionId: lectureData.sectionId,
    thumbnailUrl: lectureData.thumbnailUrl,
  };

  const response = await api.put(`/lectures/${lectureId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const deleteLecture = async (lectureId, token) => {
  const response = await api.delete(`/lectures/${lectureId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const reorderLectures = async (lectureOrders, token) => {
  const response = await api.put(
    "/lectures/reorder",
    { lectureOrders },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const moveLectureToSection = async (lectureId, sectionId, token) => {
  const response = await api.put(
    `/lectures/${lectureId}/move`,
    { newSectionId: sectionId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
