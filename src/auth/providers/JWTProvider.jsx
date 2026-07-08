/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useState } from "react";
import * as authHelper from "../_helpers";
import * as lmsApi from "../../services/lms.api";
import { lmsAuth } from "../../services";

import { set } from "date-fns";
import { logoutUser, setToken } from "../../store/reducer/authSlice";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/signin`;
export const ADMIN_LOGIN_URL = `${API_URL}/admin/auth/signin`;
export const REGISTER_URL = `${API_URL}/users/auth/signup`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/user`;

const testUsers = {
  "test@iqonic.vip": {
    password: "sX^c^VYpZu",
    data: {
      name: "Test user",
      email: "test@iqonic.vip",
      crm_id: 12345,
      first_name: "Test",
      last_name: "User",
      status: "Active",
      role: "student",
      plan: "iq-plus",
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
      status: "Active",
      role: "student",
      plan: "iq-max",
      expire_at: new Date("2027-12-29"),
    },
  },
  "kwame@coaching.com": {
    password: "Password123!",
    data: {
      name: "Kwame Coaching",
      email: "kwame@coaching.com",
      crm_id: 11111,
      first_name: "Kwame",
      last_name: "Coaching",
      status: "Active",
      role: "student",
      plan: "iq-max",
      expire_at: new Date("2027-12-31"),
    },
  },
};

const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState();

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

      const authData = {
        token: auth.token,
        user: auth.user,
      };
      saveAuth(authData);
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
        const loginRes = await axios.get(
          "https://shield.iqonic.life/outerinfo.dhtml",
          {
            params: {
              webhook: "ite5r9Qtin82q",
              action: "verifylogin",
              distid: email,
              password: password,
            },
          }
        );

        if (loginRes?.data[0].error) {
          return {
            success: false,
            error: loginRes.data.message || "Login failed.",
          };
        } else {
          let {
            username,
            first,
            last,
            uuid,
            userid,
            expiration,
            active,
            plan,
          } = loginRes?.data[0];

          if (active === "Inactive") {
            const { email } = loginRes?.data[0];

            const redirectUrl = `https://shield.iqonic.life/qiqonic/orderproducts.dhtml?alzq=1&username=${email}&site=iqonic&language=EN&setform=ordering.html&thisform=ordering.html&shipto=base&scountry=US&products=PLAN`;
            window.location.href = redirectUrl;

            return { success: true, redirect: true };
          } else {

            try {
              const { email } = loginRes?.data[0];

              const res = await clientCreateUpdate({
                name: `${first} ${last}`,
                email,
                crm_id: uuid ? uuid : userid,
                first_name: first,
                last_name: last,
                plan,
                status: active,
                expire_at: expiration,
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
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        return {
          success: false,
          error:
            err.response?.data?.message ||
            err.message ||
            "Something went wrong.",
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
