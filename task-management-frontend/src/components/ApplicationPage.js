import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/ApplicationPage.css";

const ApplicationPage = () => {
    const { appAcronym } = useParams();
    const [tasks, setTasks] = useState({
        open: [],
        todo: [],
        doing: [],
        done: [],
        closed: [],
    });

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
                    <button>Plans</button>
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
        </div>
    );
};

export default ApplicationPage;
