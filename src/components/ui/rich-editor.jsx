// import { Editor } from "@tinymce/tinymce-react";
// import { cn } from "@/lib/utils";
// import { useEffect, useRef } from "react";
// import { useSettings } from '@/providers/SettingsProvider';

// // RichEditor component
// const RichEditor = ({ content, onChange, className }) => {
//   const editorRef = useRef(null);
//  const {
//     settings,
//   } = useSettings();
//   const handleEditorChange = (content) => {
//     if (onChange) {
//       onChange(content);
//     }
//   };

//   // Update editor content when theme changes
//   useEffect(() => {
//     const iframe = editorRef.current?.iframeElement;
//     if (!iframe?.contentDocument) return;

//     const { documentElement, body } = iframe.contentDocument;
    
//     // Clean previous theme classes
//     documentElement.classList.remove('light', 'dark');
//     // Add current theme class
//     documentElement.classList.add(settings.themeMode);
    
//     // Force redraw for immediate theme application
//     body.style.display = 'none';
//     body.offsetHeight; // Trigger reflow
//     body.style.display = '';
//   }, [settings.themeMode]);
  
//   return (
//     <div
//       className={cn("border rounded-md overflow-hidden", className)}
//     >
//       <Editor
//         apiKey="mu4agh8e1hzw8g8dfzjj88c3yfdp79aahr24szna1gg3mdlu" // Replace with your TinyMCE API key or remove this line for development
//         onInit={(evt, editor) => (editorRef.current = editor)}
//         initialValue={content || ""}
//         onChange={(e) => handleEditorChange(e.target.getContent())}
//         init={{
//           height: 300,
//           menubar: false,
//           plugins: [
//             "advlist",
//             "autolink",
//             "lists",
//             "link",
//             "image",
//             "charmap",
//             "preview",
//             "anchor",
//             "searchreplace",
//             "visualblocks",
//             "code",
//             "fullscreen",
//             "insertdatetime",
//             "media",
//             "table",
//             "code",
//             "help",
//             "wordcount",
//           ],
//           toolbar:
//             "undo redo | blocks | " +
//             "bold italic forecolor | alignleft aligncenter " +
//             "alignright alignjustify | bullist numlist outdent indent | " +
//             "removeformat | image link table | help",
//             content_style: `
//           /* Base styles */
//           body {
//             font-family: Helvetica, Arial, sans-serif;
//             font-size: 14px;
//             padding: 12px;
//             transition: color 0.3s ease, background-color 0.3s ease;
//           }

//           /* Light theme */
//           .light body {
//             color: #333333;
//             background-color: #ffffff;
//           }
//           .light a {
//             color: #2563eb;
//           }
//           .light table {
//             border-color: #e2e8f0;
//           }

//           /* Dark theme */
//           .dark body {
//             color: #ffffff !important;
//             background-color: #111217;
//           }
//           .dark a {
//             color: #93c5fd;
//           }
//           .dark p {
//             color: #ffffff !important;
//           }
//           .dark table {
//             border-color: #334155;
//           }

//           /* Common elements */
//           table {
//             border-collapse: collapse;
//             width: 100%;
//           }
//           td, th {
//             border: 1px solid;
//             padding: 8px;
//           }
//         `,
//           placeholder: "Start typing or paste content...",
//           // skin: settings.themeMode === 'dark' ? 'oxide-dark' : 'oxide',
//           statusbar: false,
//           branding: false,
//           force_br_newlines: true,
//           force_p_newlines: false,
//           forced_root_block: "",
//           entity_encoding: "raw",
//           newline_behavior: "linebreak",
//         }}
//       />
//     </div>
//   );
// };

// export default RichEditor;


import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/SettingsProvider';
// import '@/styles/editor.css'; // Custom theme-based styles you can define here

const RichEditor = ({ content, onChange, className }) => {
  const editorRef = useRef(null);
  const { settings } = useSettings();

  const handleEditorChange = (value) => {
    if (onChange) onChange(value);
  };

  useEffect(() => {
    const editorContainer = editorRef.current?.getEditor().root;
    if (editorContainer) {
      editorContainer.classList.remove('light', 'dark');
      editorContainer.classList.add(settings.themeMode);
    }
  }, [settings.themeMode]);

  return (
    <div className={cn("border rounded-md bg-light", className)}>
      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={content || ''}
        onChange={handleEditorChange}
        placeholder="Start typing or paste content..."
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            [{ align: [] }],
            ['clean'],
          ],
        }}
        formats={[
          'header', 'bold', 'italic', 'underline', 'strike',
          'list', 'bullet', 'link', 'image', 'align',
        ]}
        className={`quill-editor ${settings.themeMode}`}
      />
    </div>
  );
};

export default RichEditor;
