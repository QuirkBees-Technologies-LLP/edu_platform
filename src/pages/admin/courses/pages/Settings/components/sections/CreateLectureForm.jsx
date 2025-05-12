import { useState } from "react";
import { Check, X } from "lucide-react";
import { useAuthContext } from "@/auth/useAuthContext";
import { lmsLectures } from "../../../../../../../services";

const CreateLectureForm = ({ sectionId, onCancel, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !auth?.token) return;

    setIsSubmitting(true);

    try {
      const response = await lmsLectures.createLecture(
        {
          title,
          section: sectionId,
          order: 0,
        },
        auth.token
      );

      setTitle("");
      onSuccess(response.data);
      onCancel();
    } catch (error) {
      console.error("Failed to create lecture:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-2 bg-light rounded"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter lecture title"
          className="flex-1 px-3 py-2 border rounded focus:outline-none bg-light focus:ring-2 focus:ring-primary w-full"
          autoFocus
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
          title="Create lecture"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default CreateLectureForm;
