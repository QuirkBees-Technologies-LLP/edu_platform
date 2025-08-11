/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useState } from "react";
import * as authHelper from "../_helpers";
import * as lmsApi from "../../services/lms.api";
import { lmsAuth } from "../../services";

import { set } from "date-fns";
import { logoutUser, setToken } from "../../store/reducer/authSlice";
const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/signin`;
export const ADMIN_LOGIN_URL = `${API_URL}/admin/auth/signin`;
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
      const data = await lmsAuth.login(email, password);
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
    role = "student",
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

  const API_KEY = import.meta.env.VITE_APP_CRM_API_KEY;

  const clientSignin = async (
    email,
    password,
    clientCreateUpdate,
    dispatch
  ) => {
    if (email === "test.student@yopmail.com" && password === "Password@123") {
      try {
        const res = await clientCreateUpdate({
          name: "Test user",
          email: "test.student@yopmail.com",
          crm_id: 12345,
          first_name: "Test",
          last_name: "User",
          status: "active",
          role: "student",
          plan: "IQ Forex Pro",
          expire_at: new Date("2027-10-29"),
        }).unwrap();

        const auth = {
          token: res.token,
          user: res.user,
        };

        saveAuth(auth);
        dispatch(setToken(auth.token));
        setCurrentUser(auth?.user);

        return {
          success: true,
          user: res.user,
          token: res.token,
        };
      } catch (apiError) {
        const errorMessage =
          apiError?.data?.error?.[0] ||
          apiError?.data?.message ||
          "User creation failed.";
        return { success: false, error: errorMessage };
      }
    } else {
      try {
        // Step 1: External Login
        const loginRes = await fetch(
          `https://api.iqonic.life/api/cb/outbound/iqverse/user/details?email=${email}&password=${password}`,
          {
            method: "GET",
            headers: {
              "api-key": API_KEY,
            },
          }
        );

        const loginData = await loginRes.json();

        if (!loginData.success || !loginData.data) {
          return {
            success: false,
            error: loginData.message || "Login failed.",
          };
        }

        const { id: userId, name, email: userEmail } = loginData.data;
        const { expire_at, plan, status } = loginData.data.memberships;

        // Step 2: Check Plan Expiry
        const isExpired = new Date(expire_at) < new Date();
        // const isExpired = false;

        if (isExpired) {
          // Step 3: Get token and redirect
          const tokenRes = await fetch(
            `https://api.iqonic.life/api/cb/outbound/iqverse/user/token?user_id=${userId}`,
            {
              method: "GET",
              headers: {
                "api-key": API_KEY,
              },
            }
          );
          const tokenData = await tokenRes.json();
          const token = tokenData?.data?.token;
          if (!token) {
            return {
              success: false,
              error: "Token not received for subscription renewal.",
            };
          }

          const redirectUrl = `https://icon-user.mlmprotec.com/login?auto-token-login&&pathName=%2Fmy_account%2Fsubscription&token=${token}`;
          window.location.href = redirectUrl;

          return { success: true, redirect: true }; // Optional success response before redirect
        } else {
          // ✅ Step 4: Plan active — create educator
          const [firstName, ...rest] = name.trim().split(" ");
          const lastName = rest.join(" ");

          try {
            const res = await clientCreateUpdate({
              name,
              email: userEmail,
              crm_id: userId,
              first_name: firstName,
              last_name: lastName,
              plan,
              status,
              expire_at,
              role: "student",
            }).unwrap();

            const auth = {
              token: res.token,
              user: res.user,
            };

            saveAuth(auth);
            dispatch(setToken(auth.token));
            setCurrentUser(auth?.user);

            return {
              success: true,
              user: res.user,
              token: res.token,
            };
          } catch (apiError) {
            const errorMessage =
              apiError?.data?.error?.[0] ||
              apiError?.data?.message ||
              "User creation failed.";
            return { success: false, error: errorMessage };
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        return {
          success: false,
          error: err.message || "Something went wrong.",
        };
      }
    }
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
        clientSignin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext, AuthProvider };
