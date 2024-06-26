import React from "react";
import "../styles/TextEditor.css"; // Import the CSS file

function TextEditor({ row, column, onRowChange, placeholder }) {
    return (
        <input
            type={column.key === "password" ? "password" : "text"}
            value={row[column.key] || ""}
            placeholder={placeholder}
            onChange={(e) =>
                onRowChange({ ...row, [column.key]: e.target.value })
            }
            className="text-editor-input" // Add class for styling
        />
    );
}

export default TextEditor;
