import React, { useState } from "react";
import "../MultiSelectDropdown.css"; // Add your CSS styles here

const MultiSelectDropdown = ({ options, selectedOptions, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionChange = (option) => {
        const newSelectedOptions = selectedOptions.includes(option)
            ? selectedOptions.filter((o) => o !== option)
            : [...selectedOptions, option];
        onChange(newSelectedOptions);
    };

    return (
        <div className="multi-select-dropdown">
            <button className="dropdown-toggle" onClick={handleToggleDropdown}>
                Select Groups
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {options.map((option) => (
                        <label key={option} className="dropdown-item">
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={() => handleOptionChange(option)}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
