import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import ReadOnlyTask from "./ReadOnlyTask";
import "../styles/OpenTaskModal.css";

Modal.setAppElement("#root");

const DoingTaskModal = ({
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
                        `${process.env.REACT_APP_API_URL}/check-group/${app.App_permit_Doing}`,
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

    useEffect(() => {
        // Update form state when task prop changes
        if (task) {
            setForm({
                Task_plan: task.Task_plan || "",
                Task_notes: task.Task_notes || "",
            });
        }
    }, [task]);

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

    const handleNewNoteChange = (e) => {
        setNewNote(e.target.value);
    };

    const handleComplete = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}/doing-to-done`,
                {},
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "",
                text: "",
            });
            fetchTasks();
            onRequestClose();
            // send email
            await axios.post(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}/send-email`,
                {},
                {
                    withCredentials: true,
                }
            );
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response.data.message || "An error occurred",
            });
        }
    };

    const handleHalt = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/${task.Task_id}/doing-to-todo`,
                {},
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "",
                text: "",
            });
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
                { Task_notes: newNote, Task_state: "doing" },
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
        onRequestClose();
    };

    if (!canEdit) {
        return (
            <ReadOnlyTask
                isOpen={isOpen}
                onRequestClose={handleClose}
                task={task}
                appAcronym={appAcronym}
                state="Doing"
            />
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Doing Task Modal"
            className="open-task-modal-content"
            overlayClassName="open-task-modal-overlay"
        >
            <div className="open-task-modal-header">
                <h2>Doing Task</h2>
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
                        <input
                            type="text"
                            value={form.Task_plan}
                            disabled
                            className="open-task-modal-read-only"
                        />
                    </div>
                    <div className="open-task-modal-buttons">
                        <button
                            className="open-task-modal-button"
                            onClick={handleComplete}
                        >
                            Complete
                        </button>
                        <button
                            className="open-task-modal-button"
                            onClick={handleHalt}
                        >
                            Halt
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

export default DoingTaskModal;
