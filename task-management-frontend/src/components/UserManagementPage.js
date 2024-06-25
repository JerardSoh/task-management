import React, { useState, useEffect } from "react";
import Select from "react-select";
import TextEditor from "./TextEditor";
import {
    getAllUsers,
    createUser,
    updateUserDetails,
    getAllGroups,
    createGroup,
} from "../apiService";

const UserManagementPage = () => {
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
    const [errorMessage, setErrorMessage] = useState(""); // State for error message

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
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (username) => {
        const userToEdit = users.find((user) => user.username === username);
        setOriginalUser({ ...userToEdit }); // Store the original data
        setEditingId(username);
    };

    const handleCancel = () => {
        setUsers(
            users.map((user) =>
                user.username === originalUser.username ? originalUser : user
            )
        );
        setEditingId(null);
        setOriginalUser(null);
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
            } catch (error) {
                console.error("Failed to save user details:", error);
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
            setErrorMessage(""); // Clear any previous error message
        } catch (error) {
            setErrorMessage(error.message); // Set error message from catch block
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
        } catch (error) {
            console.error("Failed to create group:", error);
        }
    };

    return (
        <div>
            {/* Create Group Section */}
            <div>
                <label style={{ marginRight: "10px" }}>Create Group:</label>
                <input
                    type="text"
                    placeholder="Enter new group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />
                <button onClick={handleCreateGroup}>Create</button>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
                <div style={{ color: "red", marginBottom: "10px" }}>
                    {errorMessage}
                </div>
            )}

            {/* User Management Table */}
            <table>
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
                            />
                        </td>
                        <td>
                            <button onClick={handleNewUserSave}>Save</button>
                        </td>
                    </tr>
                    {/* Existing Users Rows */}
                    {users
                        .filter((user) => user.username !== "admin") // Filter out the user with username "admin"
                        .map((user) => (
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
                                        disabled={editingId !== user.username}
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
                                            options={allGroups.filter(
                                                (group) =>
                                                    !user.groups.includes(
                                                        group.value
                                                    )
                                            )}
                                            onChange={(selectedOptions) =>
                                                handleUserChange(
                                                    user.username,
                                                    "groups",
                                                    selectedOptions.map(
                                                        (option) => option.value
                                                    )
                                                )
                                            }
                                        />
                                    ) : (
                                        user.groups.join(", ")
                                    )}
                                </td>
                                <td>
                                    {editingId === user.username ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleSave(user.username)
                                                }
                                            >
                                                Save
                                            </button>
                                            <button
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
