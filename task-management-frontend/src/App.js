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
import { AdminProvider } from "./components/AdminContext";

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/login" element={<LoginComponent />} />
                    <Route
                        path="*"
                        element={
                            <AdminProvider>
                                <ProtectedRoute>
                                    <NavigationBar />
                                    <Routes>
                                        <Route
                                            path="/"
                                            element={<HomePage />}
                                        />
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
                                            path="*"
                                            element={<Navigate to="/" />}
                                        />
                                    </Routes>
                                </ProtectedRoute>
                            </AdminProvider>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
