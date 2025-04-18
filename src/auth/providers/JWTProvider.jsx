/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useState } from "react";
import * as authHelper from "../_helpers";
import * as lmsApi from "../../services/lms.api";
import { lmsAuth } from "../../services";

import { set } from "date-fns";
import { logoutUser, setToken } from "../../store/reducer/authSlice";
const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/users/auth/signin`;
export const REGISTER_URL = `${API_URL}/users/auth/signup`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/user`;

const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState();
  // const verify = async () => {
  //   if (auth) {
  //     try {
  //       // const {
  //       //   data: user
  //       // } = await getUser();
  //       if(auth?.token){
  //         setCurrentUser(auth);
  //       }
  //     } catch {
  //       saveAuth(undefined);
  //       setCurrentUser(undefined);
  //     }
  //   }
  // };

  const verify = async () => {
    try {
      if (auth?.token) {
        setCurrentUser(auth);
      } else {
        throw new Error("No valid auth token");
      }
    } catch {
      saveAuth(undefined);
      setCurrentUser(undefined);
    }
  };

  const saveAuth = (auth) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };
  const login = async (email, password, dispatch) => {
    try {
      const data = await lmsAuth.loginAdmin(email, password);
      const auth = {
        token: data.token,
        user: data.user,
      };
      saveAuth(auth);
      // const {
      //   data: user
      // } = await getUser();
      dispatch(setToken(auth.token));
      setCurrentUser(auth?.user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };
  const register = async (
    first_name,
    last_name,
    email,
    password,
    password_confirmation,
    role = "USER",
    tier = "FREE"
  ) => {
    try {
      const { data: auth } = await axios.post(REGISTER_URL, {
        first_name,
        last_name,
        email,
        password: password_confirmation,
        name: email,
        tier,
        role,
      });

      // const { data } = await lmsApi.register(credentials);
      const authData = {
        token: auth.token,
        user: auth.user,
      };
      saveAuth(authData);
      // const {
      //   data: user
      // } = await getUser();
      setCurrentUser(authData?.user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };
  const requestPasswordResetLink = async (email) => {
    await axios.post(FORGOT_PASSWORD_URL, {
      email,
    });
  };
  const changePassword = async (
    email,
    token,
    password,
    password_confirmation
  ) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation,
    });
  };
  // const getUser = async () => {
  //   return await axios.get(GET_USER_URL);
  // };
  const logout = (dispatch) => {
    saveAuth(undefined);
    setCurrentUser(undefined);
    dispatch(logoutUser());
    localStorage.clear();
  };
  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        requestPasswordResetLink,
        changePassword,
        // getUser,
        logout,
        verify,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext, AuthProvider };
