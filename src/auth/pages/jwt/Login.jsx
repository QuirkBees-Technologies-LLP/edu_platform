import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import clsx from "clsx";
import * as Yup from "yup";
import { useFormik } from "formik";
import { KeenIcon } from "@/components";
import { toAbsoluteUrl } from "@/utils";
import { useAuthContext } from "@/auth";
import { useLayout } from "@/providers";
import { Alert } from "@/components";
import { useDispatch } from "react-redux";
import { Book, CircleUser, GraduationCap } from "lucide-react";
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
  remember: Yup.boolean(),
});
const initialValues = {
  email: "",
  password: "",
  remember: false,
};
const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!login) {
          throw new Error("JWTProvider is required for this form.");
        }
        await login(values.email, values.password, dispatch);
        if (values.remember) {
          localStorage.setItem("email", values.email);
        } else {
          localStorage.removeItem("email");
        }
        navigate("/", {
          replace: true,
        });
      } catch (error) {
        setStatus(error?.message || "Login failed");
        setSubmitting(false);
      }
      setLoading(false);
    },
  });
  const togglePassword = (event) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="login card max-w-[385px] border-none w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)]">
      <form className="card-body flex flex-col login_card gap-5 p-7" noValidate>
        <div className="flex justify-center mb-5">
          <img
            src="/media/app/default-logo-dark.png"
            className="w-100 h-5"
            alt=""
          />
          {/* <img src="/media/app/default-logo-dark.png" className="w-100 h-5 dark_mode" alt="" /> */}
        </div>
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-900 leading-none mb-2.5">
            Sign in
          </h3>
          <p className="text-gray-500">Let's Get Started IQONIC</p>
        </div>
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <Link
          to="/auth/student/login"
          className="btn border-1 border-[#35353C] text-gray-300 dark:text-gray-800 flex justify-center grow items-center"
        >
          {" "}
          <GraduationCap size={16} /> Student Sign In
        </Link>
        <div className="flex items-center gap-2">
          <span className="border-t border-[#35353C] w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">
            Or
          </span>
          <span className="border-t border-[#35353C] w-full"></span>
        </div>
        <Link
          to="/auth/admin/login"
          className="btn border-1 border-[#35353C] text-gray-300 dark:text-gray-800 flex justify-center grow items-center"
        >
          {" "}
          <CircleUser size={16} /> Admin/Educator Sign In
        </Link>
        <div className="flex items-center flex-col gap-3">
          <div className="text-center flex items-center gap-1 justify-center">
            <p className="text-2xs text-gray-300 dark:text-gray-800 mb-0">
              IQONIC
            </p>
            <Link
              to="/terms-of-service"
              className="text-2xs text-gray-700 underline"
            >
              {" "}
              Terms of Service{" "}
            </Link>{" "}
            <p className="text-2xs text-gray-300 dark:text-gray-800 mb-0">&</p>
            <Link
              to="/privacy-policy"
              className="text-2xs text-gray-700 underline"
            >
              {" "}
              Privacy Policy{" "}
            </Link>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <p className="text-2xs text-gray-300 dark:text-gray-800 mb-0">
              Need help?
            </p>
            <Link to="/support" className="text-2xs text-gray-700 underline">
              {" "}
              Contact Support.
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
export { Login };
