import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { format, isValid, isBefore } from "date-fns";
import "../styles/PlansModal.css";

Modal.setAppElement("#root");

const PlansModal = ({ isOpen, onRequestClose, appAcronym }) => {
    const initialFormState = {
        Plan_MVP_Name: "",
        Plan_startDate: null,
        Plan_endDate: null,
    };

    const [plans, setPlans] = useState([]);
    const [form, setForm] = useState(initialFormState);
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
                setPlans(response.data.plans);
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

    const handleDateChange = (name, date) => {
        setForm({
            ...form,
            [name]: date,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates before submission
        const { Plan_startDate, Plan_endDate } = form;

        if (
            !Plan_startDate ||
            !Plan_endDate ||
            !isValid(Plan_startDate) ||
            !isValid(Plan_endDate)
        ) {
            setMessage({ type: "error", text: "Invalid date format." });
            return;
        }

        if (isBefore(Plan_endDate, Plan_startDate)) {
            setMessage({
                type: "error",
                text: "End date cannot be before start date.",
            });
            return;
        }

        const formattedForm = {
            ...form,
            Plan_startDate: format(Plan_startDate, "yyyy-MM-dd"),
            Plan_endDate: format(Plan_endDate, "yyyy-MM-dd"),
        };

        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/plan/${appAcronym}/new`,
                formattedForm,
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "success",
                text: "Plan created successfully",
            });
            setForm(initialFormState);
            // Refresh the plans list
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/plan/${appAcronym}/all`,
                {
                    withCredentials: true,
                }
            );
            setPlans(response.data.plans);
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
            contentLabel="Plans Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className="modal-header">
                <h2>Plans</h2>
                <button onClick={handleClose} className="close-button">
                    ×
                </button>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <div className="plans-list">
                <table>
                    <thead>
                        <tr>
                            <th>Plan Name</th>
                            <th>Start</th>
                            <th>End</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.map((plan) => (
                            <tr key={plan.Plan_MVP_Name}>
                                <td>{plan.Plan_MVP_Name}</td>
                                <td>
                                    {format(
                                        new Date(plan.Plan_startDate),
                                        "dd/MM/yyyy"
                                    )}
                                </td>
                                <td>
                                    {format(
                                        new Date(plan.Plan_endDate),
                                        "dd/MM/yyyy"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
                <div>
                    <label>Plan Name:</label>
                    <input
                        type="text"
                        name="Plan_MVP_Name"
                        value={form.Plan_MVP_Name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Plan Start Date: </label>
                    <DatePicker
                        selected={form.Plan_startDate}
                        onChange={(date) =>
                            handleDateChange("Plan_startDate", date)
                        }
                        dateFormat="dd-MM-yyyy"
                        className="date-picker"
                        placeholderText="Select start date"
                    />
                </div>
                <div>
                    <label>Plan End Date: </label>
                    <DatePicker
                        selected={form.Plan_endDate}
                        onChange={(date) =>
                            handleDateChange("Plan_endDate", date)
                        }
                        dateFormat="dd-MM-yyyy"
                        className="date-picker"
                        placeholderText="Select end date"
                    />
                </div>
                <button type="submit">Create</button>
            </form>
        </Modal>
    );
};

export default PlansModal;
