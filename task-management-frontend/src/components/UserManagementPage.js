import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserDetails, getAllGroups } from "../apiService";
import MultiSelectDropdown from "./MultiSelectDropdown";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getAllUsers();
                const groupData = await getAllGroups();
                console.log("Users API Response:", userData);
                console.log("Groups API Response:", groupData);

                setUsers(userData.result || []);
                setGroups(groupData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleGroupChange = (userIndex, newGroups) => {
        setUsers((prevUsers) =>
            prevUsers.map((user, i) =>
                i === userIndex ? { ...user, groups: newGroups } : user
            )
        );
    };

    const handleCheckboxChange = (index, field) => {
        setUsers((prevUsers) =>
            prevUsers.map((user, i) =>
                i === index ? { ...user, [field]: !user[field] } : user
            )
        );
    };

    const handleInputChange = (index, field, value) => {
        setUsers((prevUsers) =>
            prevUsers.map((user, i) =>
                i === index ? { ...user, [field]: value } : user
            )
        );
    };

    const handleSubmit = async (username, index) => {
        const user = users[index];
        const updatedUser = {
            email: user.email,
            status: user.status,
            group: user.groups,
            password: user.password,
        };

        try {
            const response = await updateUserDetails(username, updatedUser);
            console.log("User updated:", response);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>User Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Groups</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="6">No users available</td>
                        </tr>
                    ) : (
                        users.map((user, index) => (
                            <tr key={user.username}>
                                <td>{user.username}</td>
                                <td>
                                    <input
                                        type="password"
                                        placeholder="New Password" // Placeholder to indicate input field
                                        onChange={(e) =>
                                            handleInputChange(
                                                index,
                                                "password",
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={user.email || ""}
                                        onChange={(e) =>
                                            handleInputChange(
                                                index,
                                                "email",
                                                e.target.value
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(user.status)}
                                        onChange={() =>
                                            handleCheckboxChange(
                                                index,
                                                "status"
                                            )
                                        }
                                    />
                                </td>
                                <td>
                                    <MultiSelectDropdown
                                        options={groups}
                                        selectedOptions={user.groups}
                                        onChange={(newGroups) =>
                                            handleGroupChange(index, newGroups)
                                        }
                                    />
                                </td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleSubmit(user.username, index)
                                        }
                                    >
                                        Submit
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
