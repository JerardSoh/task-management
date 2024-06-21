import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginComponent from "./components/LoginComponent";
import HomePage from "./components/HomePage";

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/login" element={<LoginComponent />} />
                    <Route path="/home" element={<HomePage />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
