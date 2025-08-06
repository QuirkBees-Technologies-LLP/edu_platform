import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import * as Yup from "yup";
import { useFormik } from "formik";
import { KeenIcon } from "@/components";
import { toAbsoluteUrl } from "@/utils";
import { useAuthContext } from "@/auth";
import { useLayout } from "@/providers";
import { Alert } from "@/components";
import { useDispatch } from "react-redux";
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
const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
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
        setStatus(error.message);
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
      <form className="card-body flex flex-col gap-5 p-7" noValidate>
        <div className="text-center mb-2.5">
          <div className="text-center">
            <div className="flex justify-start mb-8">
              <Link to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'} className="text-sm gap-2 text-gray-300 dark:text-gray-600 hover:text-primary btn btn-rounded btn-sm btn-outline w-fit border-2 border-[#35353C]">
                <KeenIcon icon="black-left" />
              </Link>
            </div>
            <div class="flex justify-center mb-8">
              <img src="/media/app/default-logo-dark.png" class="w-100 h-5" alt="" />
              {/* <img src="/media/app/default-logo-dark.png" class="w-100 h-5 dark_mode" alt="" /> */}
            </div>
            <h3 className="text-xl font-medium text-gray-100 dark:text-gray-900 leading-none mb-3 text-center">
              Login
            </h3>
          </div>
          {/* <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">
              Need an account?
            </span>
            <Link
              to={
                currentLayout?.name === "auth-branded"
                  ? "/auth/signup"
                  : "/auth/classic/signup"
              }
              className="text-2sm link"
            >
              Sign up
            </Link>
          </div> */}
        </div>

        {/* <div className="grid grid-cols-2 gap-2.5">
          <a href="#" className="btn btn-light btn-sm justify-center">
            <img src={toAbsoluteUrl('/media/brand-logos/google.svg')} className="size-3.5 shrink-0" />
            Use Google
          </a>

          <a href="#" className="btn btn-light btn-sm justify-center">
            <img src={toAbsoluteUrl('/media/brand-logos/apple-black.svg')} className="size-3.5 shrink-0 dark:hidden" />
            <img src={toAbsoluteUrl('/media/brand-logos/apple-white.svg')} className="size-3.5 shrink-0 light:hidden" />
            Use Apple
          </a>
        </div> */}

        {/* <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
          <span className="border-t border-gray-200 w-full"></span>
        </div> */}

        {/* <Alert variant="primary">
          Use <span className="font-semibold text-gray-900">demo@keenthemes.com</span> username and{' '}
          <span className="font-semibold text-gray-900">demo1234</span> password.
        </Alert> */}

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          {/* <label className="form-label text-gray-900">Email</label> */}
          <label className="input  bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
            <input
              placeholder="Email"
              autoComplete="off"
              {...formik.getFieldProps("email")}
              className={clsx("text-gray-100 form-control", {
                "is-invalid": formik.touched.email && formik.errors.email,
              })}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            {/* <label className="form-label text-gray-900">Password</label> */}

          </div>
          <label className="input  bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              {...formik.getFieldProps("password")}
              className={clsx("text-gray-100 form-control", {
                "is-invalid": formik.touched.password && formik.errors.password,
              })}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", {
                  hidden: showPassword,
                })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showPassword,
                })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
          {/* <label className="checkbox-group">
            <input
              className="checkbox checkbox-sm"
              type="checkbox"
              {...formik.getFieldProps("remember")}
            />
            <span className="checkbox-label">Remember me</span>
          </label> */}
        </div>

        <button
          onClick={formik.handleSubmit}
          className="btn py-7 rounded-2xl bg-[linear-gradient(90deg,#7C3AED_0%,#5C25BA_100%)] btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? "Please wait..." : "Login"}
        </button>
        <div className="font-normal text-center">
          <Link
            to={
              currentLayout?.name === "auth-branded"
                ? "/auth/reset-password"
                : "/auth/classic/reset-password"
            }
            className="text-xs text-[#8D79FF] link shrink-0"
          >
            Forgot Password?
          </Link>
          </div>
      </form>
    </div>
  );
};
export { AdminLogin };
