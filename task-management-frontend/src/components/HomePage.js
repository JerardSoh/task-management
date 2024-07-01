import React, { useState } from "react";
import CreateAppModal from "../components/CreateAppModal";
import "../styles/HomePage.css"; // Import the CSS file

const HomePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateAppClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <header className="header">
                <h1>Applications</h1>
                <button
                    onClick={handleCreateAppClick}
                    className="create-app-button"
                >
                    Create App
                </button>
            </header>
            <main>{/* Additional home page content can go here */}</main>
            <CreateAppModal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
            />
        </div>
    );
};

export default HomePage;
