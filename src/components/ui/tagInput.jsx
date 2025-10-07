import React, { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ value, onChange, touched, error }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
        setInput('');
      }
    }
  };

  const removeTag = (index) => {
    const newTags = value?.filter((_, i) => i !== index);
    onChange(newTags);
  };

  return (
    <div
      className={`w-full bg-light rounded-md px-3 py-2 flex flex-wrap items-center gap-2 border transition-colors duration-150 ${isFocused ? 'border-primary' : 'border-gray-300 hover:border-gray-400'
        } ${touched && error ? 'validation-error-border' : ''}`}
    >
      {value?.map((tag, index) => (
        <span
          key={index}
          className="bg-primary text-white text-sm px-3 py-1 rounded-xl flex items-center gap-1"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="hover:text-gray-300"
          >
            <X size={14} />
          </button>
        </span>
      ))}

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Add a tag"
        className="flex-1 border-none focus:ring-0 focus:outline-none text-sm bg-light"
      />
    </div>
  );
};

export default TagInput;
