import { Editor } from "@tinymce/tinymce-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";

// RichEditor component
const RichEditor = ({ content, onChange, className }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (content) => {
    if (onChange) {
      onChange(content);
    }
  };

  return (
    <div
      className={cn("border rounded-md bg-white overflow-hidden", className)}
    >
      <Editor
        apiKey="mu4agh8e1hzw8g8dfzjj88c3yfdp79aahr24szna1gg3mdlu" // Replace with your TinyMCE API key or remove this line for development
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={content || ""}
        onChange={(e) => handleEditorChange(e.target.getContent())}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | image link table | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          placeholder: "Start typing or paste content...",
          skin: "oxide",
          statusbar: false,
          branding: false,
          force_br_newlines: true,
          force_p_newlines: false,
          forced_root_block: "",
          entity_encoding: "raw",
          newline_behavior: "linebreak",
        }}
      />
    </div>
  );
};

export default RichEditor;
