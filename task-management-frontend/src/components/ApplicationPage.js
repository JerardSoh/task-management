import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PlansModal from "../components/PlansModal";
import CreateTaskModal from "../components/CreateTaskModal";
import OpenTaskModal from "../components/OpenTaskModal"; // Import OpenTaskModal
import "../styles/ApplicationPage.css";

const ApplicationPage = () => {
    const { appAcronym } = useParams();
    const [isProjectManager, setIsProjectManager] = useState(false);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null); // Add state for selected task
    const [isOpenTaskModalOpen, setIsOpenTaskModalOpen] = useState(false); // Add state for OpenTaskModal

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/task/${appAcronym}/all`,
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

    const getTasksByState = (state) =>
        tasks.filter((task) => task.Task_state === state);

    return (
        <div>
            <header className="header">
                <h1>{appAcronym}</h1>
                <p>It is an application about {appAcronym}.</p>
                <div className="header-buttons">
                    <button onClick={() => setIsCreateTaskModalOpen(true)}>
                        Create Task
                    </button>
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
                        {getTasksByState(column.id).map((task) => (
                            <div
                                key={task.Task_id}
                                className="task-card"
                                onClick={() => {
                                    setSelectedTask(task);
                                    setIsOpenTaskModalOpen(true);
                                }}
                            >
                                <h3>{task.Task_plan}</h3>
                                <p className="task-info">
                                    <strong>ID:</strong> {task.Task_id}
                                </p>
                                <p className="task-info">
                                    <strong>Name:</strong> {task.Task_Name}
                                </p>
                                <p className="task-info">
                                    <strong>Description:</strong>{" "}
                                    {task.Task_description}
                                </p>
                                <p className="task-info">
                                    <strong>Owner:</strong> {task.Task_owner}
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
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onRequestClose={() => setIsCreateTaskModalOpen(false)}
                appAcronym={appAcronym}
            />
            {selectedTask && (
                <OpenTaskModal
                    isOpen={isOpenTaskModalOpen}
                    onRequestClose={() => setIsOpenTaskModalOpen(false)}
                    task={selectedTask}
                    appAcronym={appAcronym}
                />
            )}
        </div>
    );
};

export default ApplicationPage;
