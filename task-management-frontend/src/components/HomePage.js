import React, { useState } from "react";
import CreateAppModal from "../components/CreateAppModal";

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
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                }}
            >
                <h1>Applications</h1>
                <button onClick={handleCreateAppClick}>Create App</button>
            </header>
            <main>
                <h2></h2>
                {/* Additional home page content can go here */}
            </main>
            <CreateAppModal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
            />
        </div>
    );
};

export default HomePage;
