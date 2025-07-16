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
    <div className="card max-w-[390px] w-full">
      <form className="card-body flex flex-col login_card gap-5 p-7" noValidate>
        <div className="flex justify-center mb-5">
          <img src="/media/app/default-logo.svg" className="w-100 light_mode" alt="" />
          <img src="/media/app/default-logo-dark.svg" className="w-100 dark_mode" alt="" />
        </div>
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            Sign in
          </h3>
          <p>Let's Get Started IQVerse</p>
        </div>
        {formik.status && <Alert variant="danger">{formik.status}</Alert>}
        <Link
          to="/auth/student/login"
          className="btn  btn-light flex justify-center grow items-center"
        >  <GraduationCap size={16} /> Student Sign In
        </Link>
        <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
          <span className="border-t border-gray-200 w-full"></span>
        </div>
        <Link
          to="/auth/admin/login"
          className="btn  btn-light flex justify-center grow items-center"
        >        <CircleUser size={16} />  Admin/Educator Sign In
        </Link>
      </form>
    </div>
  );
};
export { Login };
