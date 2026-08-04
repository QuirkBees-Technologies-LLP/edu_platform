import React, { useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { Container } from "@/components/container";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation
} from "../../../store/api/client/clientProfileApiSlice";

const NotificationPreferences = () => {

  const { data, refetch } = useGetNotificationPreferencesQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();

  const formik = useFormik({
    initialValues: {
      iqIdea: true,
      iqInsights: true,
      iqSocial: true,
      iqLive: true,
      liveIdea: false,
      tradingSignals: true,
    },
    onSubmit: async (values) => {
      try {
        await updatePreferences(values).unwrap();
        toast.success("Notification preferences updated successfully");
        await refetch();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to update notification preferences");
      }
    },
  });

  useEffect(() => {
    if (data?.data) {
      const prefs = data?.data;
      formik.setValues({
        iqIdea: !!prefs?.iqIdea,
        iqInsights: !!prefs?.iqInsights,
        iqSocial: !!prefs?.iqSocial,
        iqLive: !!prefs?.iqLive,
        liveIdea: !!prefs?.liveIdea,
        tradingSignals: prefs?.tradingSignals !== false,
      });
    }
  }, [data]);

  const preferencesConfig = [
    { key: "iqIdea", label: "IQ Ideas", desc: "Get notified when new trading ideas are posted" },
    { key: "iqInsights", label: "IQ Insights", desc: "Receive updates on latest market insights" },
    { key: "iqSocial", label: "IQ Social", desc: "Stay updated with community posts and interactions" },
    { key: "iqLive", label: "IQ Live", desc: "Get alerts for live streaming sessions" },
    { key: "liveIdea", label: "Live Ideas", desc: "Receive immediate notifications for live trading ideas" },
    // { key: "tradingSignals", label: "IQ Strategies Alerts", desc: "Receive push notifications when TradingView signals are triggered" },
  ];

  return (
    <form onSubmit={formik?.handleSubmit} className="w-full">
      <div className="card w-full lg:w-2/3">
        <div className="card-header border-b border-gray-200 px-6 py-4">
          <h3 className="card-title text-gray-900 font-semibold text-lg">Notification Preferences</h3>
          <p className="text-gray-500 text-sm">Choose what notifications you want to receive.</p>
        </div>
        <div className="card-body">
          <div className="flex flex-col gap-6">
            {preferencesConfig?.map((item) => (
              <div key={item?.key} className="flex items-center justify-between">
                <div>
                  <label className="text-gray-900 font-medium text-sm block mb-1">
                    {item?.label}
                  </label>
                  <span className="text-gray-500 text-xs">
                    {item?.desc}
                  </span>
                </div>
                <label className="switch switch-sm">
                  <input
                    type="checkbox"
                    disabled={formik?.isSubmitting}
                    name={item?.key}
                    checked={formik?.values?.[item?.key]}
                    onChange={formik?.handleChange}
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Submit button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={formik?.isSubmitting}
              className="btn btn-primary"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default NotificationPreferences;
