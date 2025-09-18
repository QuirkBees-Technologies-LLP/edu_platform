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

const testUsers = {
  "test@iqonic.vip": {
    password: "Test$iqonic",
    data: {
      name: "Test user",
      email: "test@iqonic.vip",
      crm_id: 12345,
      first_name: "Test",
      last_name: "User",
      status: "active",
      role: "student",
      plan: "IQ Max",
      expire_at: new Date("2027-10-29"),
    },
  },
  "daud@student.com": {
    password: "Daud123!",
    data: {
      name: "Daud",
      email: "daud@student.com",
      crm_id: 67890,
      first_name: "Daud",
      last_name: "Student",
      status: "active",
      role: "student",
      plan: "IQ Max",
      expire_at: new Date("2027-10-29"),
    },
  },
};

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
    if (testUsers[email] && testUsers[email].password === password) {
      try {
        // const res = await clientCreateUpdate({
        //   name: "Test user",
        //   email: "test.student@yopmail.com",
        //   crm_id: 12345,
        //   first_name: "Test",
        //   last_name: "User",
        //   status: "active",
        //   role: "student",
        //   plan: "IQ Max",
        //   expire_at: new Date("2027-10-29"),
        // }).unwrap();

         const res = await clientCreateUpdate(testUsers[email].data).unwrap();
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
        const loginRes = await axios.get(
          "https://api.iqonic.life/api/cb/outbound/iqverse/user/details",
          {
            params: {
              email: email,
              password: password,
            },
            headers: {
              "api-key": API_KEY,
            },
          }
        );

        console.log("loginRes",loginRes.data)

        // const loginData = await loginRes.json();

        if (!loginRes?.data?.success || !loginRes?.data?.data) {
          return {
            success: false,
            error: loginRes.data.message || "Login failed.",
          };
        }

        const { id: userId, name, email: userEmail } = loginRes?.data?.data;
        if(!loginRes?.data?.data?.memberships){
          return{
             success: false,
            error: loginRes.data.message || "Login failed.",
          }
        }
        const { expire_at, plan, status } = loginRes?.data?.data?.memberships;


        // Step 2: Check Plan Expiry
        const isExpired = new Date(expire_at) < new Date();
        // const isExpired = new Date(expire_at) < new Date() ? status === "active" ? false : true : false;

        if (isExpired) {
          // Step 3: Get token and redirect
          // const tokenRes = await fetch(
          //   `https://api.iqonic.life/api/cb/outbound/iqverse/user/token?user_id=${userId}`,
          //   {
          //     method: "GET",
          //     headers: {
          //       "api-key": API_KEY,
          //     },
          //   }
          // );

          const tokenRes = await axios.get(
            "https://api.iqonic.life/api/cb/outbound/iqverse/user/token",
            {
              params: {
                user_id: userId,
              },
              headers: {
                "api-key": API_KEY,
              },
            }
          );
          // const tokenData = await tokenRes.json();

          console.log("tokenRes",tokenRes)
          const token = tokenRes?.data?.data?.token;
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
         error: err.response?.data?.message || err.message || "Something went wrong.",
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
