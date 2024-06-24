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
import ProtectedRoute from "./components/ProtectedRoute";
import NavigationBar from "./components/NavigationBar";
import ProfilePage from "./components/ProfilePage";

const App = () => {
    return (
        <Router>
            <div>
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
                                    {/* Redirect all other paths to HomePage, adjust as needed */}
                                    <Route
                                        path="*"
                                        element={<Navigate to="/" />}
                                    />
                                </Routes>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
