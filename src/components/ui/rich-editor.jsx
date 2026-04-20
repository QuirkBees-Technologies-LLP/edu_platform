
import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import { cn } from '@/lib/utils';
import { useSettings } from '@/providers/SettingsProvider';

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
