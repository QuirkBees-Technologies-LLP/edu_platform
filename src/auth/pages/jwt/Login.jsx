// import { useState } from "react";
// import {
//   Link,
//   useLocation,
//   useNavigate,
//   useSearchParams,
// } from "react-router-dom";
// import clsx from "clsx";
// import * as Yup from "yup";
// import { useFormik } from "formik";
// import { KeenIcon } from "@/components";
// import { toAbsoluteUrl } from "@/utils";
// import { useAuthContext } from "@/auth";
// import { useLayout } from "@/providers";
// import { Alert } from "@/components";
// import { useDispatch } from "react-redux";
// import { Book, CircleUser, GraduationCap } from "lucide-react";
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
// const Login = () => {
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuthContext();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = location.state?.from?.pathname || "/";
//   const [showPassword, setShowPassword] = useState(false);
//   const { currentLayout } = useLayout();
//   const dispatch = useDispatch();
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
//         setStatus(error?.message || "Login failed");
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
//       <form className="card-body flex flex-col login_card gap-5 p-7" noValidate>
//         <div className="flex justify-center mb-5">
//           <img
//             src="/media/app/default-logo-dark.png"
//             className="w-100 h-5"
//             alt=""
//           />
//           {/* <img src="/media/app/default-logo-dark.png" className="w-100 h-5 dark_mode" alt="" /> */}
//         </div>
//         <div className="text-center mb-2.5">
//           <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-900 leading-none mb-2.5">
//             Sign in
//           </h3>
//           <p className="text-gray-500">Let's Get Started IQONIC</p>
//         </div>
//         {formik.status && <Alert variant="danger">{formik.status}</Alert>}
//         <Link
//           to="/auth/student/login"
//           className="btn border-1 border-[#35353C] text-gray-300 dark:text-gray-800 flex justify-center grow items-center"
//         >
//           {" "}
//           <GraduationCap size={16} /> Student Sign In
//         </Link>
//         <div className="flex items-center gap-2">
//           <span className="border-t border-[#35353C] w-full"></span>
//           <span className="text-2xs text-gray-500 font-medium uppercase">
//             Or
//           </span>
//           <span className="border-t border-[#35353C] w-full"></span>
//         </div>
//         <Link
//           to="/auth/admin/login"
//           className="btn border-1 border-[#35353C] text-gray-300 dark:text-gray-800 flex justify-center grow items-center"
//         >
//           {" "}
//           <CircleUser size={16} /> Admin/Educator Sign In
//         </Link>
//         <div className="flex items-center flex-col gap-3">
//           <div className="text-center flex items-center gap-1 justify-center">
//             <p className="text-2xs text-gray-300 dark:text-gray-800 mb-0">
//               IQONIC
//             </p>
//             <Link
//               to="/terms-of-service"
//               className="text-2xs text-gray-700 underline"
//             >
//               {" "}
//               Terms of Service{" "}
//             </Link>{" "}
//             <p className="text-2xs text-gray-300 dark:text-gray-800 mb-0">&</p>
//             <Link
//               to="/privacy-policy"
//               className="text-2xs text-gray-700 underline"
//             >
//               {" "}
//               Privacy Policy{" "}
//             </Link>
//           </div>
//           <div className="flex items-center gap-1 justify-center">
//             <p className="text-2xs text-gray-300 dark:text-gray-800 mb-0">
//               Need help?
//             </p>
//             <Link to="/support" className="text-2xs text-gray-700 underline">
//               {" "}
//               Contact Support.
//             </Link>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };
// export { Login };

import { useState, Fragment } from "react";
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

const SIGN_IN_OPTIONS = [
  { to: "/auth/student/login", label: "Student Sign In", Icon: GraduationCap },
  { to: "/auth/admin/login", label: "Admin / Educator Sign In", Icon: CircleUser },
];

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

const OPTION_BUTTON_STYLE = {
  background:
    "linear-gradient(180deg, rgba(24,10,44,0.60) 0%, rgba(8,5,14,0.60) 100%)",
};

const OPTION_BUTTON_CLASS =
  "flex h-[56px] w-full items-center justify-center gap-2.5 rounded-[14px] border border-white/[0.05] " +
  "text-[17px] font-normal text-white transition-[filter] duration-200 hover:brightness-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70";

const FOOTER_LINK_CLASS =
  "text-white underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none";

const FOOTER_ROW_CLASS = "flex flex-wrap items-center justify-center gap-x-1";

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

const Divider = () => (
  <div className="flex items-center gap-3">
    <span className="h-px w-full bg-white/35" />
    <span className="text-sm uppercase text-white/90">Or</span>
    <span className="h-px w-full bg-white/35" />
  </div>
);

const SignInOption = ({ to, label, Icon }) => (
  <Link to={to} className={OPTION_BUTTON_CLASS} style={OPTION_BUTTON_STYLE}>
    <Icon size={20} aria-hidden="true" />
    {label}
  </Link>
);

const LegalLinks = () => (
  <div className="flex flex-col items-center gap-3 pb-1 pt-5 text-center text-sm text-white">
    <div className={FOOTER_ROW_CLASS}>
      <span>IQONIC</span>
      <Link to="/terms-of-service" className={FOOTER_LINK_CLASS}>
        Terms of Service
      </Link>
      <span>&</span>
      <Link to="/privacy-policy" className={FOOTER_LINK_CLASS}>
        Privacy Policy
      </Link>
    </div>
    <div className={FOOTER_ROW_CLASS}>
      <span>Need help?</span>
      <Link to="/support" className={FOOTER_LINK_CLASS}>
        Contact Support
      </Link>
    </div>
  </div>
);

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
    <div className="login fixed inset-0 z-10 overflow-y-auto overflow-x-hidden bg-black">
      <div className="relative flex min-h-full w-full flex-col items-center justify-center gap-14 overflow-hidden px-4 py-10">
        <img
          src="/media/app/default-logo-dark.png"
          className="relative z-10 h-6 w-auto max-w-[70vw] brightness-0 invert"
          alt="IQONIC"
        />

        <div className="relative w-full max-w-[420px]">
          <HorizonGlow />

          <div
            className="relative rounded-[32px]"
            style={GLASS_CARD_STYLE}
          >
            <CardSparkles />

            <form className="login_card flex flex-col gap-5 p-6" noValidate>
              <header className="pb-5 pt-2 text-center">
                <h1 className="mb-1.5 text-2xl font-bold leading-tight text-white">
                  Welcome back!
                </h1>
                <p className="text-lg text-white">Let's get started IQONIC</p>
              </header>

              {formik.status && <Alert variant="danger">{formik.status}</Alert>}

              {SIGN_IN_OPTIONS.map((option, index) => (
                <Fragment key={option.to}>
                  {index > 0 && <Divider />}
                  <SignInOption {...option} />
                </Fragment>
              ))}

              <LegalLinks />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login };