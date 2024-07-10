import "./App.css";
import React from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import LoginComponent from "./components/LoginComponent";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import UserManagementPage from "./components/UserManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import NavigationBar from "./components/NavigationBar";
import ApplicationPage from "./components/ApplicationPage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginComponent />} />
                <Route
                    path="*"
                    element={
                        <ProtectedRoute>
                            <NavigationBar />
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route
                                    path="/profile"
                                    element={<ProfilePage />}
                                />
                                <Route
                                    path="/user-management"
                                    element={
                                        <AdminProtectedRoute>
                                            <UserManagementPage />
                                        </AdminProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/:appAcronym"
                                    element={<ApplicationPage />}
                                />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
