import React from 'react';
import ReactQuill from 'react-quill';

const RichTextEditor = ({ value, onChange, onBlur, touched, error }) => {
    console.log(touched && error, "test");
    
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`${touched && error ? 'validation-error-border' : ''}`}
        />
    );
};

export default RichTextEditor;
