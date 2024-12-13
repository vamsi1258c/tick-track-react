import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Box from '@mui/material/Box';

const RichTextEditor = ({ value, onChange, placeholder, onBlur }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (event) => {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  };

  return (
    <Box
      sx={{
        marginBottom: '15px',
        border: `solid ${isFocused ? '1px #1976d2' : '0.8px #ced4da'}`,
        borderRadius: '4px',
        overflowY: 'auto',
        transition: 'border-color 0.3s',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ borderRadius: '4px' }}
      />
    </Box>
  );
};

export default RichTextEditor;
