import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import TextEditor from "./TextEditor";
import {
    getAllUsers,
    createUser,
    updateUserDetails,
    getAllGroups,
    createGroup,
    checkAdmin,
} from "../apiService";
import "../styles/UserManagementPage.css"; // Import the CSS file

const UserManagementPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [originalUser, setOriginalUser] = useState(null); // State to store original user data
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        email: "",
        status: false,
        groups: [],
    });
    const [allGroups, setAllGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState(""); // State for new group name
    const [message, setMessage] = useState({ type: "", text: "" }); // State for error and success messages

    useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await getAllUsers();
                setUsers(users);

                const groups = await getAllGroups();
                setAllGroups(
                    groups.map((group) => ({ value: group, label: group }))
                );
            } catch (error) {
                if (error.message === "unauthenticated") {
                    navigate("/login");
                } else if (error.message === "unauthorized") {
                    navigate("/");
                } else {
                    setMessage({ type: "error", text: error.message }); // Set error message from catch block
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleEdit = async (username) => {
        try {
            await checkAdmin();
            const userToEdit = users.find((user) => user.username === username);
            setOriginalUser({ ...userToEdit }); // Store the original data
            setEditingId(username);
            setMessage({ type: "", text: "" }); // Clear messages on edit
        } catch (error) {
            if (error.message === "unauthenticated") {
                navigate("/login");
            } else if (error.message === "unauthorized") {
                navigate("/");
            } else {
                setMessage({ type: "error", text: error.message }); // Set error message from catch block
            }
        }
    };

    const handleCancel = () => {
        setUsers(
            users.map((user) =>
                user.username === originalUser.username ? originalUser : user
            )
        );
        setEditingId(null);
        setOriginalUser(null);
        setMessage({ type: "", text: "" }); // Clear messages on cancel
    };

    const handleUserChange = (username, field, value) => {
        setUsers(
            users.map((user) => {
                if (user.username === username) {
                    return { ...user, [field]: value };
                }
                return user;
            })
        );
    };

    const handleSave = async (username) => {
        const userToSave = users.find((user) => user.username === username);
        if (userToSave) {
            try {
                await updateUserDetails(userToSave.username, userToSave);
                setEditingId(null);
                setOriginalUser(null); // Clear original data after saving
                setMessage({
                    type: "success",
                    text: "User updated successfully.",
                }); // Set success message
            } catch (error) {
                if (error.message === "unauthenticated") {
                    navigate("/login");
                } else if (error.message === "unauthorized") {
                    navigate("/");
                } else {
                    setMessage({ type: "error", text: error.message }); // Set error message from catch block
                }
            }
        }
    };

    const handleNewUserChange = (field, value) => {
        setNewUser({ ...newUser, [field]: value });
    };

    const handleNewUserSave = async () => {
        try {
            await createUser(newUser);
            setNewUser({
                username: "",
                password: "",
                email: "",
                status: false,
                groups: [],
            });
            const users = await getAllUsers();
            setUsers(users);
            setMessage({ type: "success", text: "User created successfully." }); // Set success message
        } catch (error) {
            if (error.message === "unauthenticated") {
                navigate("/login");
            } else if (error.message === "unauthorized") {
                navigate("/");
            } else {
                setMessage({ type: "error", text: error.message }); // Set error message from catch block
            }
        }
    };

    const handleCreateGroup = async () => {
        try {
            const newGroup = { groupname: newGroupName };
            await createGroup(newGroup);
            setNewGroupName("");
            const groups = await getAllGroups();
            setAllGroups(
                groups.map((group) => ({ value: group, label: group }))
            );
            setMessage({
                type: "success",
                text: "Group created successfully.",
            }); // Set success message
        } catch (error) {
            if (error.message === "unauthenticated") {
                navigate("/login");
            } else if (error.message === "unauthorized") {
                navigate("/");
            } else {
                setMessage({ type: "error", text: error.message }); // Set error message from catch block
            }
        }
    };

    const customStyles = {
        multiValueRemove: (base, state) => {
            const editingUser = users.find(
                (user) => user.username === editingId
            );
            if (
                editingUser &&
                editingUser.username === "admin" &&
                state.data.value === "admin"
            ) {
                return { ...base, display: "none" };
            }
            return base;
        },
    };

    // Custom ClearIndicator component to remove the "Remove All" button
    const ClearIndicator = (props) => {
        return null;
    };

    const customComponents = {
        ClearIndicator,
    };

    return (
        <div className="user-management-container">
            {/* Create Group Section */}
            <div className="create-group">
                <label style={{ marginRight: "10px" }}>Create Group:</label>
                <input
                    type="text"
                    placeholder="Enter new group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />
                <button onClick={handleCreateGroup}>Create</button>
            </div>

            {/* Consolidated Message Display */}
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {/* User Management Table */}
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Email</th>
                        <th>Enabled</th>
                        <th>Groups</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* New User Row */}
                    <tr>
                        <td>
                            <input
                                type="text"
                                placeholder="Enter new username"
                                value={newUser.username}
                                onChange={(e) =>
                                    handleNewUserChange(
                                        "username",
                                        e.target.value
                                    )
                                }
                            />
                        </td>
                        <td>
                            <TextEditor
                                row={newUser}
                                column={{ key: "password" }}
                                placeholder="Enter new password"
                                onRowChange={(row) =>
                                    handleNewUserChange(
                                        "password",
                                        row.password
                                    )
                                }
                            />
                        </td>
                        <td>
                            <TextEditor
                                row={newUser}
                                column={{ key: "email" }}
                                placeholder="Enter new email"
                                onRowChange={(row) =>
                                    handleNewUserChange("email", row.email)
                                }
                            />
                        </td>
                        <td>
                            <input
                                type="checkbox"
                                checked={newUser.status}
                                onChange={(e) =>
                                    handleNewUserChange(
                                        "status",
                                        e.target.checked
                                    )
                                }
                            />
                        </td>
                        <td>
                            <Select
                                isMulti
                                value={newUser.groups.map((group) => ({
                                    value: group,
                                    label: group,
                                }))}
                                options={allGroups}
                                onChange={(selectedOptions) =>
                                    handleNewUserChange(
                                        "groups",
                                        selectedOptions.map(
                                            (option) => option.value
                                        )
                                    )
                                }
                                components={customComponents}
                                menuPortalTarget={document.body} // Render the menu outside the table
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),
                                }}
                            />
                        </td>
                        <td>
                            <button
                                className="create-button"
                                onClick={handleNewUserSave}
                            >
                                Create
                            </button>
                        </td>
                    </tr>
                    {/* Existing Users Rows */}
                    {users.map((user) => (
                        <tr key={user.username}>
                            <td>{user.username}</td>
                            <td>
                                {editingId === user.username ? (
                                    <TextEditor
                                        row={user}
                                        column={{ key: "password" }}
                                        placeholder="Enter new password"
                                        onRowChange={(row) =>
                                            handleUserChange(
                                                user.username,
                                                "password",
                                                row.password
                                            )
                                        }
                                    />
                                ) : (
                                    "******"
                                )}
                            </td>
                            <td>
                                {editingId === user.username ? (
                                    <TextEditor
                                        row={user}
                                        column={{ key: "email" }}
                                        placeholder="Enter new email"
                                        onRowChange={(row) =>
                                            handleUserChange(
                                                user.username,
                                                "email",
                                                row.email
                                            )
                                        }
                                    />
                                ) : (
                                    user.email
                                )}
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={user.status}
                                    disabled={
                                        user.username === "admin" ||
                                        editingId !== user.username
                                    }
                                    onChange={(e) =>
                                        handleUserChange(
                                            user.username,
                                            "status",
                                            e.target.checked
                                        )
                                    }
                                />
                            </td>
                            <td>
                                {editingId === user.username ? (
                                    <Select
                                        isMulti
                                        value={user.groups.map((group) => ({
                                            value: group,
                                            label: group,
                                        }))}
                                        options={allGroups}
                                        onChange={(selectedOptions) => {
                                            const selectedGroups =
                                                selectedOptions.map(
                                                    (option) => option.value
                                                );
                                            handleUserChange(
                                                user.username,
                                                "groups",
                                                selectedGroups
                                            );
                                        }}
                                        styles={{
                                            ...customStyles,
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                            }),
                                        }}
                                        components={customComponents}
                                        menuPortalTarget={document.body} // Render the menu outside the table
                                    />
                                ) : (
                                    user.groups.join(", ")
                                )}
                            </td>
                            <td>
                                {editingId === user.username ? (
                                    <>
                                        <button
                                            className="save-button"
                                            onClick={() =>
                                                handleSave(user.username)
                                            }
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="cancel-button"
                                            onClick={handleCancel}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleEdit(user.username)
                                        }
                                    >
                                        Edit
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementPage;
