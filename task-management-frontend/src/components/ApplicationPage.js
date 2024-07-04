import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PlansModal from "../components/PlansModal";
import "../styles/ApplicationPage.css";

const ApplicationPage = () => {
    const { appAcronym } = useParams();
    const [isProjectManager, setIsProjectManager] = useState(false);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState({
        open: [],
        todo: [],
        doing: [],
        done: [],
        closed: [],
    });
    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/${appAcronym}/task/all`,
                    {
                        withCredentials: true,
                    }
                );
                setTasks(response.data.tasks);
            } catch (error) {
                console.error("Error fetching tasks", error);
            }
        };

        fetchTasks();
    }, [appAcronym]);

    // Check if user is a project manager
    useEffect(() => {
        const checkProjectManagerStatus = async () => {
            try {
                console.log("Checking project manager status");
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/projectmanager`,
                    {
                        withCredentials: true,
                    }
                );
                setIsProjectManager(response.data.success);
            } catch (error) {
                console.error("Error checking project manager status", error);
                if (error.request.status === 401) {
                    navigate("/login");
                } else if (error.request.status === 403) {
                    navigate("/");
                }
            }
        };

        checkProjectManagerStatus();
    }, [navigate]);

    const columns = [
        { id: "open", title: "Open" },
        { id: "todo", title: "To-Do" },
        { id: "doing", title: "Doing" },
        { id: "done", title: "Done" },
        { id: "closed", title: "Closed" },
    ];

    return (
        <div>
            <header className="header">
                <h1>{appAcronym}</h1>
                <p>It is an application about {appAcronym}.</p>
                <div className="header-buttons">
                    <button>Create Task</button>
                    {isProjectManager && (
                        <button onClick={() => setIsPlansModalOpen(true)}>
                            Plans
                        </button>
                    )}
                </div>
            </header>
            <div className="application-page">
                {columns.map((column) => (
                    <div key={column.id} className="task-column">
                        <h2>{column.title}</h2>
                        {tasks[column.id].map((task) => (
                            <div key={task.id} className="task-card">
                                <p>
                                    <strong>Sprint:</strong> {task.sprint}
                                </p>
                                <p>
                                    <strong>Name:</strong> {task.name}
                                </p>
                                <p>
                                    <strong>Description:</strong>{" "}
                                    {task.description}
                                </p>
                                <p>
                                    <strong>Owner:</strong> {task.owner}
                                </p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {isProjectManager && (
                <PlansModal
                    isOpen={isPlansModalOpen}
                    onRequestClose={() => setIsPlansModalOpen(false)}
                    appAcronym={appAcronym}
                />
            )}
        </div>
    );
};

export default ApplicationPage;
