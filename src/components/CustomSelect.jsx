import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select ${isOpen ? 'active' : ''}`} ref={containerRef}>
      <div className="custom-select-trigger" onClick={handleToggle}>
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="chevron">▼</span>
      </div>
      {isOpen && (
        <div className="custom-select-menu">
          {options.map(opt => (
            <div 
              key={opt.value} 
              className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
