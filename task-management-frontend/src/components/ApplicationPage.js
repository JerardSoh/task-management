import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PlansModal from "../components/PlansModal";
import CreateTaskModal from "../components/CreateTaskModal";
import OpenTaskModal from "../components/OpenTaskModal";
import TodoTaskModal from "../components/TodoTaskModal";
import DoingTaskModal from "../components/DoingTaskModal";
import DoneTaskModal from "../components/DoneTaskModal";
import ClosedTaskModal from "../components/ClosedTaskModal";
import "../styles/ApplicationPage.css";

const ApplicationPage = () => {
    const { appAcronym } = useParams();
    const [isProjectManager, setIsProjectManager] = useState(false);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isOpenTaskModalOpen, setIsOpenTaskModalOpen] = useState(false);
    const [isTodoTaskModalOpen, setIsTodoTaskModalOpen] = useState(false);
    const [isDoingTaskModalOpen, setIsDoingTaskModalOpen] = useState(false);
    const [isDoneTaskModalOpen, setIsDoneTaskModalOpen] = useState(false);
    const [isClosedTaskModalOpen, setIsClosedTaskModalOpen] = useState(false);
    const [canEditCreate, setCanEditCreate] = useState(false);
    const [appDescription, setAppDescription] = useState("");

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

    useEffect(() => {
        fetchTasks();
    }, []);

    // Check permission for create task
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/app/${appAcronym}`,
                    { withCredentials: true }
                );
                const app = response.data.app;
                const res = await axios.get(
                    `${process.env.REACT_APP_API_URL}/check-group/${app.App_permit_Create}`,
                    { withCredentials: true }
                );
                setCanEditCreate(res.data.success);
            } catch (err) {
                setCanEditCreate(false);
            }
        };

        checkPermission();
    }, []);

    // Check if user is a project manager for plans
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
            }
        };

        checkProjectManagerStatus();
    }, [navigate]);

    // Get app description
    useEffect(() => {
        const fetchAppDescription = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/app/${appAcronym}`,
                    {
                        withCredentials: true,
                    }
                );
                setAppDescription(response.data.app.App_Description);
            } catch (error) {
                console.error("Error fetching app description", error);
            }
        };
        fetchAppDescription();
    }, [appAcronym]);

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
                <p>{appDescription}</p>
                <div className="header-buttons">
                    {canEditCreate && (
                        <button onClick={() => setIsCreateTaskModalOpen(true)}>
                            Create Task
                        </button>
                    )}
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
                                    if (task.Task_state === "open") {
                                        setIsOpenTaskModalOpen(true);
                                    } else if (task.Task_state === "todo") {
                                        setIsTodoTaskModalOpen(true);
                                    } else if (task.Task_state === "doing") {
                                        setIsDoingTaskModalOpen(true);
                                    } else if (task.Task_state === "done") {
                                        setIsDoneTaskModalOpen(true);
                                    } else if (task.Task_state === "closed") {
                                        setIsClosedTaskModalOpen(true);
                                    }
                                }}
                                style={{
                                    cursor:
                                        task.Task_state === "open" ||
                                        task.Task_state === "todo" ||
                                        task.Task_state === "doing" ||
                                        task.Task_state === "done" ||
                                        task.Task_state === "closed"
                                            ? "pointer"
                                            : "default",
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
            {canEditCreate && (
                <CreateTaskModal
                    isOpen={isCreateTaskModalOpen}
                    onRequestClose={() => setIsCreateTaskModalOpen(false)}
                    appAcronym={appAcronym}
                    fetchTasks={fetchTasks}
                />
            )}

            {selectedTask && (
                <>
                    <OpenTaskModal
                        isOpen={isOpenTaskModalOpen}
                        onRequestClose={() => setIsOpenTaskModalOpen(false)}
                        task={selectedTask}
                        appAcronym={appAcronym}
                        fetchTasks={fetchTasks}
                    />
                    <TodoTaskModal
                        isOpen={isTodoTaskModalOpen}
                        onRequestClose={() => setIsTodoTaskModalOpen(false)}
                        task={selectedTask}
                        appAcronym={appAcronym}
                        fetchTasks={fetchTasks}
                    />
                    <DoingTaskModal
                        isOpen={isDoingTaskModalOpen}
                        onRequestClose={() => setIsDoingTaskModalOpen(false)}
                        task={selectedTask}
                        appAcronym={appAcronym}
                        fetchTasks={fetchTasks}
                    />
                    <DoneTaskModal
                        isOpen={isDoneTaskModalOpen}
                        onRequestClose={() => setIsDoneTaskModalOpen(false)}
                        task={selectedTask}
                        appAcronym={appAcronym}
                        fetchTasks={fetchTasks}
                    />
                    <ClosedTaskModal
                        isOpen={isClosedTaskModalOpen}
                        onRequestClose={() => setIsClosedTaskModalOpen(false)}
                        task={selectedTask}
                        appAcronym={appAcronym}
                    />
                </>
            )}
        </div>
    );
};

export default ApplicationPage;
