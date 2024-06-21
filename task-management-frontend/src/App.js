import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginComponent from "./components/LoginComponent";

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/login" element={<LoginComponent />} />
                    {/* Add more routes here */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
