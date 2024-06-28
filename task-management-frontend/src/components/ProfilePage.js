import React, { useEffect, useState } from "react";
import { getUser, updateEmail, updatePassword } from "../apiService";
import "../styles/ProfilePage.css"; // Import the CSS file

const ProfileComponent = () => {
    const [user, setUser] = useState(null);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [emailMessage, setEmailMessage] = useState("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const data = await getUser();
                setUser(data.user);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleUpdateEmail = async () => {
        try {
            const data = await updateEmail(newEmail);
            setUser((prevUser) => ({ ...prevUser, email: newEmail }));
            setEmailMessage({ text: data.message, isSuccess: true });
        } catch (error) {
            setEmailMessage({ text: error.message, isSuccess: false });
        }
    };

    const handleUpdatePassword = async () => {
        try {
            const data = await updatePassword(newPassword);
            setPasswordMessage({ text: data.message, isSuccess: true });
        } catch (error) {
            setPasswordMessage({ text: error.message, isSuccess: false });
        }
    };

    if (!user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <h1 className="profile-title">Profile Page</h1>
            <div className="profile-details">
                <p>
                    <strong>Username:</strong> {user.username}
                </p>
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
            </div>
            <div className="profile-section">
                <h2>Change Email:</h2>
                <p
                    className={
                        emailMessage.isSuccess
                            ? "success-message"
                            : "error-message"
                    }
                >
                    {emailMessage.text}
                </p>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="New email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <button onClick={handleUpdateEmail}>Update Email</button>
                </div>
            </div>
            <div className="profile-section">
                <h2>Change Password:</h2>
                <p
                    className={
                        passwordMessage.isSuccess
                            ? "success-message"
                            : "error-message"
                    }
                >
                    {passwordMessage.text}
                </p>
                <div className="input-group">
                    <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button onClick={handleUpdatePassword}>
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileComponent;
