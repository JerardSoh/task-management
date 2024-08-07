import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import Select from "react-select";
import "../styles/OpenTaskModal.css";

Modal.setAppElement("#root");

const ClosedTaskModal = ({ isOpen, onRequestClose, task, appAcronym }) => {
    const [form, setForm] = useState({
        Task_plan: task.Task_plan || "",
        Task_notes: task.Task_notes || "",
    });

    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Update form state when task prop changes
        if (task) {
            setForm({
                Task_plan: task.Task_plan || "",
                Task_notes: task.Task_notes || "",
            });
        }
    }, [task]);

    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}`,
                    {
                        withCredentials: true,
                    }
                );
                setForm({
                    Task_plan: response.data.task.Task_plan || "",
                    Task_notes: response.data.task.Task_notes || "",
                });
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error.response.data.message || "An error occurred",
                });
            }
        };

        fetchTaskDetails();
    }, [appAcronym, task]);

    const handleClose = () => {
        setMessage({ type: "", text: "" });
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Closed Task Modal"
            className="open-task-modal-content"
            overlayClassName="open-task-modal-overlay"
        >
            <div className="open-task-modal-header">
                <h2>Closed Task</h2>
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
                            value={{
                                value: form.Task_plan,
                                label: form.Task_plan,
                            }}
                            isDisabled
                            options={[]}
                        />
                    </div>
                </div>
                <div className="open-task-modal-right-section">
                    <div className="open-task-modal-notes">
                        {form.Task_notes.split("\n").map((note, index) => (
                            <p key={index}>{note}</p>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ClosedTaskModal;
