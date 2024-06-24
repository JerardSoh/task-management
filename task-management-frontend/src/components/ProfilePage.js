import React, { useEffect, useState } from "react";
import { getUser, updateEmail, updatePassword } from "../apiService";

const ProfileComponent = () => {
    const [user, setUser] = useState(null);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [isEmailUpdateSuccess, setIsEmailUpdateSuccess] = useState(false);
    const [isPasswordUpdateSuccess, setIsPasswordUpdateSuccess] =
        useState(false);

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
            setEmailMessage(data.message);
            setIsEmailUpdateSuccess(true);
        } catch (error) {
            setEmailMessage(error.message);
        }
    };

    const handleUpdatePassword = async () => {
        try {
            const data = await updatePassword(newPassword);
            setPasswordMessage(data.message);
            setIsPasswordUpdateSuccess(true);
        } catch (error) {
            setPasswordMessage(error.message);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Profile Page</h1>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <div>
                <h2>Change Email:</h2>
                <p
                    className={
                        isEmailUpdateSuccess
                            ? "success-message"
                            : "error-message"
                    }
                >
                    {emailMessage}
                </p>
                <div style={{ marginBottom: "20px" }}>
                    <input
                        type="email"
                        placeholder="New email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <button onClick={handleUpdateEmail}>Update Email</button>
                </div>
            </div>
            <div>
                <h2>Change Password:</h2>
                <p
                    className={
                        isPasswordUpdateSuccess
                            ? "success-message"
                            : "error-message"
                    }
                >
                    {passwordMessage}
                </p>
                <div style={{ marginBottom: "20px" }}>
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