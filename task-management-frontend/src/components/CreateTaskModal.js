import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import axios from "axios";
import Select from "react-select";
import "../styles/CreateTaskModal.css";

Modal.setAppElement("#root");

const CreateTaskModal = ({ isOpen, onRequestClose, appAcronym }) => {
    const initialFormState = {
        Task_Name: "",
        Task_description: "",
        Task_notes: "",
        Task_plan: "",
        Task_state: "open",
        Task_owner: "",
    };

    const [form, setForm] = useState(initialFormState);
    const [plans, setPlans] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSelectChange = (name, selectedOption) => {
        setForm({
            ...form,
            [name]: selectedOption ? selectedOption.value : "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/task/${appAcronym}/create`,
                form,
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "success",
                text: "Task created successfully",
            });
            setForm(initialFormState);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response.data.message || "An error occurred",
            });
        }
    };

    const handleClose = () => {
        setMessage({ type: "", text: "" });
        setForm(initialFormState);
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            contentLabel="Create Task Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className="modal-header">
                <h2>Create Task</h2>
                <button onClick={handleClose} className="close-button">
                    ×
                </button>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="modal-form">
                <div>
                    <label>ID:</label>
                    <input type="text" value="AUTO GENERATED" disabled />
                </div>
                <div>
                    <label>Owner:</label>
                    <input type="text" value="AUTO GENERATED" disabled />
                </div>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="Task_Name"
                        value={form.Task_Name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        name="Task_description"
                        value={form.Task_description}
                        onChange={handleChange}
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
                <button type="submit">Create</button>
            </form>
        </Modal>
    );
};

export default CreateTaskModal;
