// import { useState } from "react";
// import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
// import clsx from "clsx";
// import * as Yup from "yup";
// import { useFormik } from "formik";
// import { KeenIcon } from "@/components";
// import { toAbsoluteUrl } from "@/utils";
// import { useAuthContext } from "@/auth";
// import { useLayout } from "@/providers";
// import { Alert } from "@/components";
// import { useDispatch } from "react-redux";
// const loginSchema = Yup.object().shape({
//   email: Yup.string()
//     .email("Wrong email format")
//     .min(3, "Minimum 3 symbols")
//     .max(50, "Maximum 50 symbols")
//     .required("Email is required"),
//   password: Yup.string()
//     .min(3, "Minimum 3 symbols")
//     .max(50, "Maximum 50 symbols")
//     .required("Password is required"),
//   remember: Yup.boolean(),
// });
// const initialValues = {
//   email: "",
//   password: "",
//   remember: false,
// };
// const AdminLogin = () => {
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuthContext();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = location.state?.from?.pathname || "/";
//   const [showPassword, setShowPassword] = useState(false);
//   const { currentLayout } = useLayout();
//   const dispatch = useDispatch();
//   const [searchParams] = useSearchParams();
//   const role = searchParams.get("role");
//   const formik = useFormik({
//     initialValues,
//     validationSchema: loginSchema,
//     onSubmit: async (values, { setStatus, setSubmitting }) => {
//       setLoading(true);
//       try {
//         if (!login) {
//           throw new Error("JWTProvider is required for this form.");
//         }
//         await login(values.email, values.password, dispatch);
//         if (values.remember) {
//           localStorage.setItem("email", values.email);
//         } else {
//           localStorage.removeItem("email");
//         }
//         navigate("/", {
//           replace: true,
//         });
//       } catch (error) {
//         setStatus(error.message);
//         setSubmitting(false);
//       }
//       setLoading(false);
//     },
//   });
//   const togglePassword = (event) => {
//     event.preventDefault();
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="login card max-w-[385px] border-none w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)]">
//       <form className="card-body flex flex-col gap-5 p-7" noValidate>
//         <div className="text-center mb-2.5">
//           <div className="text-center">
//             <div className="flex justify-start mb-8">
//               <Link to={currentLayout?.name === 'auth-branded' ? '/auth/login' : '/auth/classic/login'} className="text-sm gap-2 text-gray-300 dark:text-gray-600 hover:text-primary btn btn-rounded btn-sm btn-outline w-fit border-2 border-[#35353C]">
//                 <KeenIcon icon="black-left" />
//               </Link>
//             </div>
//             <div className="flex justify-center mb-8">
//               <img src="/media/app/default-logo-dark.png" className="w-100 h-5" alt="" />
//               {/* <img src="/media/app/default-logo-dark.png" class="w-100 h-5 dark_mode" alt="" /> */}
//             </div>
//             <h3 className="text-xl font-medium text-gray-100 dark:text-gray-900 leading-none mb-3 text-center">
//               Login
//             </h3>
//           </div>
//           {/* <div className="flex items-center justify-center font-medium">
//             <span className="text-2sm text-gray-600 me-1.5">
//               Need an account?
//             </span>
//             <Link
//               to={
//                 currentLayout?.name === "auth-branded"
//                   ? "/auth/signup"
//                   : "/auth/classic/signup"
//               }
//               className="text-2sm link"
//             >
//               Sign up
//             </Link>
//           </div> */}
//         </div>

//         {/* <div className="grid grid-cols-2 gap-2.5">
//           <a href="#" className="btn btn-light btn-sm justify-center">
//             <img src={toAbsoluteUrl('/media/brand-logos/google.svg')} className="size-3.5 shrink-0" />
//             Use Google
//           </a>

//           <a href="#" className="btn btn-light btn-sm justify-center">
//             <img src={toAbsoluteUrl('/media/brand-logos/apple-black.svg')} className="size-3.5 shrink-0 dark:hidden" />
//             <img src={toAbsoluteUrl('/media/brand-logos/apple-white.svg')} className="size-3.5 shrink-0 light:hidden" />
//             Use Apple
//           </a>
//         </div> */}

//         {/* <div className="flex items-center gap-2">
//           <span className="border-t border-gray-200 w-full"></span>
//           <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
//           <span className="border-t border-gray-200 w-full"></span>
//         </div> */}

//         {/* <Alert variant="primary">
//           Use <span className="font-semibold text-gray-900">demo@keenthemes.com</span> username and{' '}
//           <span className="font-semibold text-gray-900">demo1234</span> password.
//         </Alert> */}

//         {formik.status && <Alert variant="danger">{formik.status}</Alert>}

//         <div className="flex flex-col gap-1">
//           {/* <label className="form-label text-gray-900">Email</label> */}
//           <label className="input  bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
//             <input
//               placeholder="Email"
//               autoComplete="off"
//               {...formik.getFieldProps("email")}
//               className={clsx("text-gray-100 dark:text-white form-control", {
//                 "is-invalid": formik.touched.email && formik.errors.email,
//               })}
//             />
//           </label>
//           {formik.touched.email && formik.errors.email && (
//             <span role="alert" className="text-danger text-xs mt-1">
//               {formik.errors.email}
//             </span>
//           )}
//         </div>

//         <div className="flex flex-col gap-1">
//           <div className="flex items-center justify-between gap-1">
//             {/* <label className="form-label text-gray-900">Password</label> */}

//           </div>
//           <label className="input  bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
//             <input
//               placeholder="Password"
//               type={showPassword ? "text" : "password"}
//               autoComplete="off"
//               {...formik.getFieldProps("password")}
//               className={clsx("text-gray-100 dark:text-white form-control", {
//                 "is-invalid": formik.touched.password && formik.errors.password,
//               })}
//             />
//             <button className="btn btn-icon" onClick={togglePassword}>
//               <KeenIcon
//                 icon="eye"
//                 className={clsx("text-gray-500", {
//                   hidden: showPassword,
//                 })}
//               />
//               <KeenIcon
//                 icon="eye-slash"
//                 className={clsx("text-gray-500", {
//                   hidden: !showPassword,
//                 })}
//               />
//             </button>
//           </label>
//           {formik.touched.password && formik.errors.password && (
//             <span role="alert" className="text-danger text-xs mt-1">
//               {formik.errors.password}
//             </span>
//           )}
//         </div>
//         <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
//           {/* <label className="checkbox-group">
//             <input
//               className="checkbox checkbox-sm"
//               type="checkbox"
//               {...formik.getFieldProps("remember")}
//             />
//             <span className="checkbox-label">Remember me</span>
//           </label> */}
//         </div>

//         <button
//           onClick={formik.handleSubmit}
//           className="btn py-7 rounded-2xl bg-[linear-gradient(90deg,#7C3AED_0%,#5C25BA_100%)] btn-primary flex justify-center grow"
//           disabled={loading || formik.isSubmitting}
//         >
//           {loading ? "Please wait..." : "Login"}
//         </button>
//         {/* <div className="font-normal text-center">
//           <Link
//             to={
//               currentLayout?.name === "auth-branded"
//                 ? "/auth/reset-password"
//                 : "/auth/classic/reset-password"
//             }
//             className="text-xs text-[#8D79FF] link shrink-0"
//           >
//             Forgot Password?
//           </Link>
//           </div> */}
//       </form>
//     </div>
//   );
// };
// export { AdminLogin };

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

// --- FIGMA EXACT DESIGN CONSTANTS ---
const HORIZON_Y = "56%";
const HORIZON_STYLE = {
  width: "max(450vw, 2800px)",
  height: "max(450vw, 2800px)",
  left: "50%",
  top: HORIZON_Y,
  transform: "translateX(-50%)",
  background: "#000",
  boxShadow: [
    "0 -1px 0 rgba(255,255,255,0.9)",
    "0 -2px 4px rgba(233,213,255,0.9)",
    "0 -5px 12px rgba(192,132,252,0.8)",
    "0 -14px 30px rgba(147,51,234,0.6)",
    "0 -34px 70px rgba(109,40,217,0.35)",
  ].join(", "),
};

const BLOOM_CORE_STYLE = {
  left: "50%",
  top: HORIZON_Y,
  width: "min(64vw, 1000px)",
  height: "260px",
  transform: "translate(-50%, -50%)",
  background:
    "radial-gradient(closest-side, rgba(216,180,254,0.50) 0%, rgba(147,51,234,0.38) 30%, rgba(88,28,170,0.16) 65%, transparent 100%)",
};

const BLOOM_HAZE_STYLE = {
  left: "50%",
  top: HORIZON_Y,
  width: "min(120vw, 1900px)",
  height: "520px",
  transform: "translate(-50%, -50%)",
  background:
    "radial-gradient(closest-side, rgba(76,29,149,0.30) 0%, rgba(50,18,100,0.13) 55%, transparent 100%)",
};

const RIM_SHINE_STYLE = {
  left: "80%",
  top: HORIZON_Y,
  width: "min(50vw, 820px)",
  height: "36px",
  transform: "translate(-50%, -50%)",
  filter: "blur(8px)",
  background:
    "radial-gradient(closest-side, rgba(255,255,255,0.9) 0%, rgba(233,213,255,0.6) 40%, rgba(168,85,247,0.25) 75%, transparent 100%)",
};

const GLASS_CARD_STYLE = {
  background: [
    "radial-gradient(ellipse 62% 20% at 50% 54%, rgba(196,160,245,0.42) 0%, rgba(124,72,196,0.22) 50%, transparent 100%)",
    "linear-gradient(180deg, rgba(26,10,52,0.92) 0%, rgba(42,17,84,0.80) 36%, rgba(24,12,44,0.82) 62%, rgba(8,8,10,0.94) 100%)",
  ].join(", "),
  border: "1px solid rgba(150,120,230,0.5)",
  boxShadow:
    "0 0 50px rgba(124,58,237,0.16), inset 0 1px 0 rgba(255,255,255,0.10)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
};

const SPARKLE_STYLE = {
  background: "linear-gradient(180deg, transparent, #fff, transparent)",
  boxShadow: "0 0 14px 3px rgba(216,180,254,0.8), 0 0 4px 1px #fff",
};

const SUBMIT_BUTTON_STYLE = {
  background:
    "linear-gradient(180deg, rgba(147,51,234,0.85) 0%, rgba(109,40,217,0.95) 100%)",
  boxShadow: "0 0 20px rgba(147,51,234,0.4)",
};

const HorizonGlow = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    <div className="absolute" style={BLOOM_HAZE_STYLE} />
    <div className="absolute" style={BLOOM_CORE_STYLE} />
    <div className="absolute" style={RIM_SHINE_STYLE} />
    <div className="absolute rounded-full" style={HORIZON_STYLE} />
  </div>
);

const CardSparkles = () => (
  <>
    <span
      aria-hidden="true"
      className="absolute -left-px top-[17%] h-3 w-[1px] rounded-full"
      style={SPARKLE_STYLE}
    />
    <span
      aria-hidden="true"
      className="absolute -right-px top-[78%] h-3 w-[1px] rounded-full"
      style={SPARKLE_STYLE}
    />
  </>
);

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
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black flex flex-col items-center justify-center">
      <div className="relative flex min-h-full w-full flex-col items-center justify-center gap-14 overflow-hidden px-4 py-10">
        {/* IQONIC Logo (Outside the Card) */}
        <img
          src="/media/app/default-logo-dark.png"
          className="relative z-10 h-6 w-auto max-w-[70vw] brightness-0 invert"
          alt="IQONIC"
        />

        <div className="relative w-full max-w-[420px]">
          {/* Glowing Curved Horizon Flare Background */}
          <HorizonGlow />

          {/* Glass Card Container */}
          <div
            className="relative rounded-[32px] p-6"
            style={GLASS_CARD_STYLE}
          >
            <CardSparkles />

            {/* Back Arrow Button */}
            <div className="absolute left-6 top-6 z-20">
              <Link
                to={
                  currentLayout?.name === "auth-branded"
                    ? "/auth/login"
                    : "/auth/classic/login"
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 transition-colors hover:text-white"
              >
                <KeenIcon icon="black-left" className="text-sm" />
              </Link>
            </div>

            <form
              className="login_card flex flex-col gap-6 pt-2"
              noValidate
              onSubmit={formik.handleSubmit}
            >
              {/* Header Title */}
              <header className="pb-2 pt-2 text-center">
                <h1 className="text-2xl font-bold leading-tight text-white">
                  Admin / Educator Log In
                </h1>
              </header>

              {formik.status && <Alert variant="danger">{formik.status}</Alert>}

              {/* Email Input Field - Fully Transparent */}
              <div className="flex flex-col gap-1">
                <div className="relative border-b border-white/30 transition-colors focus-within:border-purple-400">
                  <input
                    type="email"
                    placeholder="Email"
                    autoComplete="off"
                    {...formik.getFieldProps("email")}
                    className={clsx(
                      "w-full py-2 text-base text-white placeholder-white/60 outline-none focus:outline-none border-none shadow-none",
                      {
                        "is-invalid":
                          formik.touched.email && formik.errors.email,
                      }
                    )}
                    style={{ backgroundColor: "transparent", background: "transparent" }}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <span role="alert" className="mt-1 text-xs text-red-400">
                    {formik.errors.email}
                  </span>
                )}
              </div>

              {/* Password Input Field - Fully Transparent */}
              <div className="flex flex-col gap-1">
                <div className="relative flex items-center justify-between border-b border-white/30 transition-colors focus-within:border-purple-400">
                  <input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    {...formik.getFieldProps("password")}
                    className={clsx(
                      "w-full py-2 text-base text-white placeholder-white/60 outline-none focus:outline-none border-none shadow-none",
                      {
                        "is-invalid":
                          formik.touched.password && formik.errors.password,
                      }
                    )}
                    style={{ backgroundColor: "transparent", background: "transparent" }}
                  />
                  <button
                    type="button"
                    className="p-1 text-white/70 hover:text-white border-none bg-transparent"
                    onClick={togglePassword}
                  >
                    <KeenIcon
                      icon="eye"
                      className={clsx({ hidden: showPassword })}
                    />
                    <KeenIcon
                      icon="eye-slash"
                      className={clsx({ hidden: !showPassword })}
                    />
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span role="alert" className="mt-1 text-xs text-red-400">
                    {formik.errors.password}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || formik.isSubmitting}
                className="mt-3 flex h-[52px] w-full items-center justify-center rounded-[14px] text-lg font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.99] border-none"
                style={SUBMIT_BUTTON_STYLE}
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AdminLogin };