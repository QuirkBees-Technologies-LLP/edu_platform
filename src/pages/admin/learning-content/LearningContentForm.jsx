/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/partials/toolbar";
import {
  useCreateLearningContentMutation,
  useUpdateLearningContentMutation,
  useGetLearningContentDetailQuery,
} from "../../../store/api/admin/adminLearningContentApiSlice";
import { useGetAdminStrategiesQuery } from "../../../store/api/admin/adminStrategyApiSlice";
import { useGetLanguagesQuery } from "../../../store/api/admin/adminLanguagesApiSlice";

const LearningContentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    contentType: location.state?.contentType || "FAST_START",
    strategy: "",
    language: [],
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch existing data for edit
  const { data: existingData, isLoading: isLoadingExisting } =
    useGetLearningContentDetailQuery(id, { skip: !isEdit });

  // Fetch strategies and languages for dropdowns
  const { data: strategiesData } = useGetAdminStrategiesQuery();
  const { data: languagesData } = useGetLanguagesQuery({
    page: 1,
    limit: 100,
    search: "",
  });

  const strategies = strategiesData?.data || [];
  const languages = languagesData?.data || [];

  const [createContent, { isLoading: isCreating }] =
    useCreateLearningContentMutation();
  const [updateContent, { isLoading: isUpdating }] =
    useUpdateLearningContentMutation();

  // Populate form for edit
  useEffect(() => {
    if (isEdit && existingData?.data) {
      const d = existingData.data;
      const langVal = Array.isArray(d.language)
        ? d.language.map((l) => l._id || l)
        : d.language?._id
          ? [d.language._id]
          : [];
      setFormData({
        contentType: d.contentType || "FAST_START",
        strategy: d.strategy?._id || d.strategy || "",
        language: langVal,
        title: d.title || "",
        description: d.description || "",
      });
    }
  }, [isEdit, existingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    // if (!formData.language || formData.language.length === 0)
    //   newErrors.language = "At least one language is required";
    if (formData.contentType === "STRATEGY" && !formData.strategy) {
      newErrors.strategy = "Strategy is required for Strategy type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      contentType: formData.contentType,
      // language: formData.language,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (formData.contentType === "STRATEGY") {
      payload.strategy = formData.strategy;
    }

    try {
      if (isEdit) {
        await updateContent({ id, ...payload }).unwrap();
        toast.success("Content updated successfully");
      } else {
        await createContent(payload).unwrap();
        toast.success("Content created successfully");
      }
      navigate("/admin/learning-content");
    } catch (err) {
      const msg =
        err?.data?.message || err?.data?.errors?.[0] || "Operation failed";
      toast.error(msg);
    }
  };

  if (isEdit && isLoadingExisting) {
    return (
      <div className="container-fluid flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-5">
      {/* Toolbar */}
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle
            text={isEdit ? "Edit Learning Content" : "Create Learning Content"}
          />
          <ToolbarDescription>
            {isEdit
              ? "Update title, description, and settings"
              : "Set up new learning content for students"}
          </ToolbarDescription>
        </ToolbarHeading>
        <ToolbarActions>
          <button
            className="btn btn-light"
            onClick={() => navigate("/admin/learning-content")}
          >
            Cancel
          </button>
        </ToolbarActions>
      </Toolbar>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Content Details</h3>
          </div>
          <div className="card-body px-6 lg:px-10 py-8">
            <div className="space-y-6">
              {/* Content Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content Type <span className="text-rose-500">*</span>
                </label>
                <div className="inline-flex bg-gray-200 dark:bg-[#1a1c23] rounded-lg p-1">
                  {[
                    { value: "FAST_START", label: "Fast Start Training" },
                    { value: "STRATEGY", label: "Strategy" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (!isEdit)
                          handleSelectChange("contentType", option.value);
                      }}
                      disabled={isEdit}
                      className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${
                        formData.contentType === option.value
                          ? "bg-gray-100 dark:bg-[#2a2d35] text-gray-900 dark:text-white shadow"
                          : "text-gray-600 dark:text-gray-400"
                      } ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy Dropdown (only for STRATEGY type) */}
              {formData.contentType === "STRATEGY" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Strategy <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={formData.strategy}
                    onValueChange={(val) => handleSelectChange("strategy", val)}
                    disabled={isEdit}
                  >
                    <SelectTrigger
                      className={`w-full ${errors.strategy ? "border-rose-500" : ""}`}
                    >
                      <SelectValue placeholder="Select Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.strategy && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.strategy}
                    </p>
                  )}
                </div>
              )}

              {/* Language Dropdown (commented out - language disabled for now) */}
              {/* <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Language <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={formData.language}
                  onValueChange={(val) => handleSelectChange("language", val)}
                >
                  <SelectTrigger
                    className={`w-full ${errors.language ? "border-rose-500" : ""}`}
                  >
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(languages) ? languages : []).map((l) => (
                      <SelectItem key={l._id} value={l._id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.language && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.language}
                  </p>
                )}
              </div> */}

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Welcome! or DEFY"
                  className={`w-full dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-800 dark:text-gray-200 placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all ${
                    errors.title ? "border-rose-500" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g., Watch this mini series to start your IQONIC journey!"
                  className="w-full dark:bg-[#1a1c23] border dark:border-gray-700 rounded-lg px-4 py-2.5 text-gray-800 dark:text-gray-200 placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="card-footer flex justify-end gap-3 px-6 lg:px-10 py-5">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate("/admin/learning-content")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="btn btn-primary"
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LearningContentForm;
