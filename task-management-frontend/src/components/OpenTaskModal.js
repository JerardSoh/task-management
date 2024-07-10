import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import Select from "react-select";
import ReadOnlyTask from "./ReadOnlyTask";
import "../styles/OpenTaskModal.css";

Modal.setAppElement("#root");

const OpenTaskModal = ({
    isOpen,
    onRequestClose,
    task,
    appAcronym,
    fetchTasks,
}) => {
    const [form, setForm] = useState({
        Task_plan: task.Task_plan || "",
        Task_notes: task.Task_notes || "",
    });

    const [plans, setPlans] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [newNote, setNewNote] = useState("");
    const [canEdit, setCanEdit] = useState(false);

    // Check permission
    useEffect(() => {
        if (isOpen) {
            const checkPermission = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL}/app/${appAcronym}`,
                        { withCredentials: true }
                    );
                    const app = response.data.app;
                    const res = await axios.get(
                        `${process.env.REACT_APP_API_URL}/check-group/${app.App_permit_Open}`,
                        { withCredentials: true }
                    );
                    setCanEdit(res.data.success);
                } catch (err) {
                    setCanEdit(false);
                }
            };

            checkPermission();
        }
    }, [isOpen, appAcronym]);

    // Update form state when task prop changes
    useEffect(() => {
        if (task) {
            setForm({
                Task_plan: task.Task_plan || "",
                Task_notes: task.Task_notes || "",
            });
        }
    }, [task]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/plan/${appAcronym}/all`,
                    {
                        withCredentials: true,
                    }
                );
                setPlans(
                    response.data.plans.map((plan) => ({
                        value: plan.Plan_MVP_Name,
                        label: plan.Plan_MVP_Name,
                    }))
                );
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error.response.data.message || "An error occurred",
                });
            }
        };

        fetchPlans();
    }, [appAcronym]);

    const fetchTaskDetails = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}`,
                {
                    withCredentials: true,
                }
            );
            setForm({
                Task_notes: response.data.task.Task_notes || "",
                Task_plan: response.data.task.Task_plan || "",
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response.data.message || "An error occurred",
            });
        }
    };

    const handleSelectChange = (name, selectedOption) => {
        setForm({
            ...form,
            [name]: selectedOption ? selectedOption.value : "",
        });
    };

    const handleNewNoteChange = (e) => {
        setNewNote(e.target.value);
    };

    const handleSavePlan = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}/save-plan`,
                { Task_plan: form.Task_plan },
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "success",
                text: "Plan updated successfully",
            });
            fetchTasks(); // Fetch updated tasks
            fetchTaskDetails(); // Fetch updated task details
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response.data.message || "An error occurred",
            });
        }
    };

    const handleRelease = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}/open-to-todo`,
                {
                    Task_plan: form.Task_plan,
                },
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "",
                text: "",
            });
            setForm((prevForm) => ({
                ...prevForm,
                Task_plan: "",
            }));
            fetchTasks();
            onRequestClose();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response.data.message || "An error occurred",
            });
        }
    };

    const handleSubmitNote = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}/update-notes`,
                { Task_notes: newNote, Task_state: "open" },
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "success",
                text: "Note added successfully",
            });
            setNewNote("");
            fetchTaskDetails();
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response.data.message || "An error occurred",
            });
        }
    };

    const handleClose = () => {
        setMessage({ type: "", text: "" });
        setNewNote("");
        setForm((prevForm) => ({
            ...prevForm,
            Task_plan: "",
        }));
        onRequestClose();
    };

    if (!canEdit) {
        return (
            <ReadOnlyTask
                isOpen={isOpen}
                onRequestClose={handleClose}
                task={task}
                appAcronym={appAcronym}
                state="Open"
            />
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Open Task Modal"
            className="open-task-modal-content"
            overlayClassName="open-task-modal-overlay"
        >
            <div className="open-task-modal-header">
                <h2>Open Task</h2>
                <button
                    onClick={handleClose}
                    className="open-task-modal-close-button"
                >
                    ×
                </button>
            </div>
            {message.text && (
                <div className={`open-task-modal-message ${message.type}`}>
                    {message.text}
                </div>
            )}
            <div className="open-task-modal-form">
                <div className="open-task-modal-left-section">
                    <div>
                        <label>ID:</label>
                        <input
                            type="text"
                            value={task.Task_id}
                            disabled
                            className="open-task-modal-read-only"
                        />
                    </div>
                    <div>
                        <label>Owner:</label>
                        <input
                            type="text"
                            value={task.Task_owner}
                            disabled
                            className="open-task-modal-read-only"
                        />
                    </div>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={task.Task_Name}
                            disabled
                            className="open-task-modal-read-only"
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={task.Task_description}
                            disabled
                            className="open-task-modal-description"
                        />
                    </div>
                    <div>
                        <label>Plan:</label>
                        <Select
                            name="Task_plan"
                            value={plans.find(
                                (plan) => plan.value === form.Task_plan
                            )}
                            onChange={(selectedOption) =>
                                handleSelectChange("Task_plan", selectedOption)
                            }
                            options={plans}
                            isClearable
                        />
                    </div>
                    <div className="open-task-modal-buttons">
                        <button
                            className="open-task-modal-button"
                            onClick={handleRelease}
                        >
                            Release
                        </button>
                        <button
                            className="open-task-modal-button"
                            onClick={handleSavePlan}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
                <div className="open-task-modal-right-section">
                    <div className="open-task-modal-notes">
                        {form.Task_notes.split("\n").map((note, index) => (
                            <p key={index}>{note}</p>
                        ))}
                    </div>
                    <textarea
                        placeholder="Write notes here. Adjustable text box."
                        value={newNote}
                        onChange={handleNewNoteChange}
                        className="open-task-modal-textarea"
                    />
                    <button
                        className="open-task-modal-submit-button"
                        onClick={handleSubmitNote}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default OpenTaskModal;
