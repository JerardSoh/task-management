import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateAppModal from "../components/CreateAppModal";
import EditAppModal from "../components/EditAppModal";
import "../styles/HomePage.css";
import { useNavigate, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";

const HomePage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAppAcronym, setSelectedAppAcronym] = useState(null);
    const [apps, setApps] = useState([]);
    const [isProjectLead, setIsProjectLead] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/app/all`,
                    {
                        withCredentials: true,
                    }
                );
                setApps(response.data.apps);
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error.response.data.message || "An error occurred",
                });
                if (error.request.status === 401) {
                    navigate("/login");
                } else if (error.request.status === 403) {
                    navigate("/");
                }
            }
        };

        fetchApps();
    }, [navigate]);

    useEffect(() => {
        const checkProjectLeadStatus = async () => {
            try {
                console.log("Checking project lead status");
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/projectlead`,
                    {
                        withCredentials: true,
                    }
                );
                setIsProjectLead(response.data.success);
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error.response.data.message || "An error occurred",
                });
                if (error.request.status === 401) {
                    navigate("/login");
                } else if (error.request.status === 403) {
                    navigate("/");
                }
            }
        };

        checkProjectLeadStatus();
    }, [navigate]);

    const handleCreateAppClick = () => {
        setIsCreateModalOpen(true);
    };

    const handleEditAppClick = (appAcronym) => {
        setSelectedAppAcronym(appAcronym);
        setIsEditModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedAppAcronym(null);
    };

    const formatDuration = (start, end) => {
        const startDate = parseISO(start);
        const endDate = parseISO(end);
        return `${format(startDate, "dd-MM-yyyy")} - ${format(
            endDate,
            "dd-MM-yyyy"
        )}`;
    };

    return (
        <div>
            <header className="header">
                <h1>Applications</h1>
                {isProjectLead && (
                    <button
                        onClick={handleCreateAppClick}
                        className="create-app-button"
                    >
                        Create App
                    </button>
                )}
            </header>
            <main className="app-grid">
                {apps.map((app) => (
                    <Link
                        key={app.App_Acronym}
                        to={`/${app.App_Acronym}`}
                        className="app-card-link"
                    >
                        <div className="app-card">
                            <p>
                                <strong>Rnum:</strong> {app.App_Rnumber}
                            </p>
                            <p>
                                <strong>Name:</strong> {app.App_Acronym}
                            </p>
                            <p className="description">
                                <strong>Desc:</strong> {app.App_Description}
                            </p>
                            <p className="duration">
                                <strong>Duration:</strong>{" "}
                                {formatDuration(
                                    app.App_startDate,
                                    app.App_endDate
                                )}
                            </p>
                            {isProjectLead && (
                                <button
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleEditAppClick(app.App_Acronym);
                                    }}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </Link>
                ))}
            </main>
            <CreateAppModal
                isOpen={isCreateModalOpen}
                onRequestClose={handleCloseCreateModal}
            />
            <EditAppModal
                isOpen={isEditModalOpen}
                onRequestClose={handleCloseEditModal}
                appAcronym={selectedAppAcronym}
            />
        </div>
    );
};

export default HomePage;
