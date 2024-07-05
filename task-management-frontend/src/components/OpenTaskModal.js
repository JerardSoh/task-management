import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import Select from "react-select";
import "../styles/OpenTaskModal.css";

Modal.setAppElement("#root");

const OpenTaskModal = ({ isOpen, onRequestClose, task, appAcronym }) => {
    const initialFormState = {
        Task_plan: task.Task_plan || "",
        Task_notes: task.Task_notes || "",
    };

    const [form, setForm] = useState(initialFormState);
    const [plans, setPlans] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [newNote, setNewNote] = useState("");

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
                {},
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "success",
                text: "Task released successfully",
            });
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
                { Task_notes: newNote },
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "success",
                text: "Note added successfully",
            });
            setForm((prevState) => ({
                ...prevState,
                Task_notes: `${prevState.Task_notes}\n${newNote}`,
            }));
            setNewNote("");
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

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Open Task Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className="modal-header">
                <h2>Open Task</h2>
                <button onClick={handleClose} className="close-button">
                    ×
                </button>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <div className="modal-form">
                <div className="left-section">
                    <div>
                        <label>ID:</label>
                        <input
                            type="text"
                            value={task.Task_id}
                            disabled
                            className="read-only"
                        />
                    </div>
                    <div>
                        <label>Owner:</label>
                        <input
                            type="text"
                            value={task.Task_owner}
                            disabled
                            className="read-only"
                        />
                    </div>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={task.Task_Name}
                            disabled
                            className="read-only"
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            value={task.Task_description}
                            disabled
                            className="read-only"
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
                    <button onClick={handleRelease}>Release</button>
                    <button onClick={handleSavePlan}>Save Changes</button>
                </div>
                <div className="right-section">
                    <div className="task-notes">
                        {task.Task_notes.split("\n").map((note, index) => (
                            <p key={index}>{note}</p>
                        ))}
                    </div>
                    <textarea
                        placeholder="Write notes here. Adjustable text box."
                        value={newNote}
                        onChange={handleNewNoteChange}
                    />
                    <button onClick={handleSubmitNote}>Submit</button>
                </div>
            </div>
        </Modal>
    );
};

export default OpenTaskModal;
