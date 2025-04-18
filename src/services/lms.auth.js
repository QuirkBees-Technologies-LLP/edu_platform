import api from "./axiosConfig";

export const login = async (email, password) => {
  try {
    const response = await api.post("/users/auth/signin", { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const loginAdmin = async (email, password) => {
  try {
    const response = await api.post("admin/auth/signin", { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (email, password, name) => {
  try {
    const response = await api.post("/auth/signup", { email, password, name });
    return response.data;
  } catch (error) {
    throw error;
  }
};
