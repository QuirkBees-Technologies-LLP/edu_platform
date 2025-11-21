import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRateEducatorMutation } from "../../../store/api/admin/adminRatingApiSlice";
import { toast } from "sonner";

export default function RatingModal({
  showRatingModal,
  setShowRatingModal,
  educatorId,
}) {
  const ratings = ["AWFUL", "BAD", "OKAY", "GOOD", "BRILLIANT"];

  console.log(educatorId, "educatorId" || "No educator ID found");

  const [rateEducator, { isLoading }] = useRateEducatorMutation();

  const validationSchema = Yup.object().shape({
    rating: Yup.number().min(1, "Please select a rating").required(),
    feedback: Yup.string().max(500),
  });

  const formik = useFormik({
    initialValues: { rating: 0, feedback: "" },
    validationSchema,
    validateOnMount: true,
    onSubmit: async (values) => {
      try {
        const payload = {
          educator: educatorId,
          rating: values.rating,
          ratingLabel: ratings[values.rating - 1],
          comment: values.feedback || "",
        };

        await rateEducator(payload).unwrap();

        formik.resetForm();
        toast.success("Rating submitted successfully!");
        setShowRatingModal(false);
      } catch (err) {
        console.error("Rating submit failed:", err);
        toast.error(err?.data?.message || "Rating submit failed");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-8">
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={() => setShowRatingModal(false)}
      >
        <div
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowRatingModal(false)}
            className="absolute top-3 right-3 text-gray-700 dark:text-gray-300 hover:text-black"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-center mb-4 mt-4 text-gray-800 dark:text-gray-100">
            Your opinion matters to us!
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-300 mb-4 font-medium">
            How would you rate this educator?
          </p>

          {/* STAR RATING */}
          <div className="flex justify-center gap-4 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                onClick={() => formik.setFieldValue("rating", star)}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill={star <= formik.values.rating ? "#FDB344" : "none"}
                  stroke={star <= formik.values.rating ? "none" : "#0ea5e9"}
                  strokeWidth="2"
                  className="cursor-pointer transition-all "
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            ))}
          </div>

          {/* Validation Error */}
          {formik.touched.rating && formik.errors.rating && (
            <p className="text-red-500 text-xs text-center mb-3">
              {formik.errors.rating}
            </p>
          )}

          {/* Rating Label */}
          {formik.values.rating > 0 && (
            <p className="text-center text-sm font-semibold mb-4 text-[#0ea5e9]">
              {ratings[formik.values.rating - 1]}
            </p>
          )}

          {/* FEEDBACK INPUT */}
          <div className="flex flex-col gap-1">
            <textarea
              placeholder="Leave a message, if you want"
              rows="3"
              className={`w-full p-3 rounded-lg border dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-gray-200 ${
                formik.errors.feedback && formik.touched.feedback
                  ? "border border-red-500"
                  : ""
              }`}
              {...formik.getFieldProps("feedback")}
            />
            {formik.touched.feedback && formik.errors.feedback && (
              <span className="text-red-500 text-xs">
                {formik.errors.feedback}
              </span>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={formik.handleSubmit}
            disabled={formik.values.rating < 1 || isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold mt-4 transition-all ${
              formik.values.rating < 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isLoading ? "Submitting..." : "Rate Now"}
          </button>

          <button
            onClick={() => setShowRatingModal(false)}
            className="w-full mt-3 text-gray-500 dark:text-gray-300 text-sm hover:text-gray-700 dark:hover:text-gray-100"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
