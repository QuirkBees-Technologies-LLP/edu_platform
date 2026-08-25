import React from "react";
import { Star, X } from "lucide-react";
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

  const [rateEducator, { isLoading }] = useRateEducatorMutation();

  const validationSchema = Yup.object().shape({
    rating: Yup.number().min(1, "Please select a rating").required(),
    feedback: Yup.string()
      .max(500, "Feedback must be less than 500 characters")
      .optional(),
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

        toast.success("Rating submitted successfully!");
        formik.resetForm();
        setShowRatingModal(false);
      } catch (err) {
        console.error("Rating submit failed:", err);
        toast.error(err?.data?.message || "Rating submit failed");
      }
    },
  });

  if (!showRatingModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={() => setShowRatingModal(false)}
    >
      <div
        className="bg-white dark:bg-gray-200 rounded-xl shadow-lg w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowRatingModal(false)}
          className="absolute top-4 right-4 text-gray-700 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          Your opinion matters to us!
        </h2>
        <p className="text-center text-gray-600 mb-5">
          How would you rate this educator?
        </p>

        <div className="flex justify-center gap-3 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-all ${
                star <= formik.values.rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => formik.setFieldValue("rating", star)}
            />
          ))}
        </div>

        {formik.touched.rating && formik.errors.rating && (
          <p className="text-center text-red-500 text-sm mb-2">
            {formik.errors.rating}
          </p>
        )}

        {formik.values.rating > 0 && (
          <p className="text-center text-yellow-500 font-semibold mb-4">
            {ratings[formik.values.rating - 1]}
          </p>
        )}

        <textarea
          placeholder="Write your feedback (optional)"
          rows="4"
          className={`w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-100 dark:text-gray-800 focus:outline-none ${
            formik.errors.feedback &&
            formik.touched.feedback &&
            "border-red-500"
          }`}
          {...formik.getFieldProps("feedback")}
        />
        {formik.touched.feedback && formik.errors.feedback && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.feedback}</p>
        )}

        <button
          onClick={formik.handleSubmit}
          disabled={formik.values.rating < 1 || isLoading}
          className={`w-full mt-5 py-3 rounded-lg text-white font-semibold transition-all ${
            formik.values.rating < 1
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {isLoading ? "Submitting..." : "Rate Now"}
        </button>

        <button
          onClick={() => setShowRatingModal(false)}
          className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
