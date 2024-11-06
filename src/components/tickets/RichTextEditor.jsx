// RichTextEditor.js
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const RichTextEditor = ({ value, onChange, placeholder, onBlur }) => {

    const editorStyle = {
        height: '120px',  
        marginBottom: '15px',  
        border: '1px solid #ced4da',  
        borderRadius: '4px',  
        overflowY: 'auto',
        position: 'sticky'
    };
    return (
        <div className="mb-3">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={editorStyle}
                onBlur={onBlur}
                size="sm"
            />
        </div>
    );
};

export default RichTextEditor;
