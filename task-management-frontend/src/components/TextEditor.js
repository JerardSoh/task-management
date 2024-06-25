function TextEditor({ row, column, onRowChange, placeholder }) {
    return (
        <input
            type={column.key === "password" ? "password" : "text"}
            value={row[column.key] || ""}
            placeholder={placeholder}
            onChange={(e) =>
                onRowChange({ ...row, [column.key]: e.target.value })
            }
        />
    );
}
export default TextEditor;
