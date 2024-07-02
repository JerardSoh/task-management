import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { format, parseISO } from "date-fns";
import "../styles/CreateAppModal.css";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

const CreateAppModal = ({ isOpen, onRequestClose }) => {
    const initialFormState = {
        App_Acronym: "",
        App_Description: "",
        App_Rnumber: 0,
        App_startDate: "",
        App_endDate: "",
        App_permit_Create: "",
        App_permit_Open: "",
        App_permit_toDoList: "",
        App_permit_Doing: "",
        App_permit_Done: "",
    };
    const navigate = useNavigate();
    const [form, setForm] = useState(initialFormState);
    const [allGroups, setAllGroups] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/group/all`,
                    {
                        withCredentials: true,
                    }
                );
                setAllGroups(
                    response.data.groups.map((group) => ({
                        value: group,
                        label: group,
                    }))
                );
            } catch (error) {
                setMessage({
                    type: "error",
                    text: error.response.data.message || "An error occurred",
                });
                if (error.request.status === 401) {
                    navigate("/login");
                } else if (error.request.status === 403) {
                    navigate("/");
                }
            }
        };

        fetchGroups();
    }, []);

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

    const handleDateChange = (name, date) => {
        setForm({
            ...form,
            [name]: date ? format(date, "yyyy-MM-dd") : "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedForm = {
            ...form,
            App_startDate: form.App_startDate,
            App_endDate: form.App_endDate,
        };

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/app/new`,
                formattedForm,
                {
                    withCredentials: true,
                }
            );
            setMessage({
                type: "success",
                text: "App created successfully",
            });
            setForm(initialFormState);
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response.data.message || "An error occurred",
            });
            if (error.request.status === 401) {
                navigate("/login");
            } else if (error.request.status === 403) {
                navigate("/");
            }
        }
    };

    const parseDateForInput = (date) => {
        return date ? parseISO(date) : null;
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Create App Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div className="modal-header">
                <h2>Create New App</h2>
                <button onClick={onRequestClose} className="close-button">
                    ×
                </button>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="modal-form">
                <div>
                    <label>App Acronym:</label>
                    <input
                        type="text"
                        name="App_Acronym"
                        value={form.App_Acronym}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>App Description:</label>
                    <textarea
                        name="App_Description"
                        value={form.App_Description}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>App Rnumber:</label>
                    <input
                        type="number"
                        name="App_Rnumber"
                        value={form.App_Rnumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Start Date: </label>
                    <DatePicker
                        selected={parseDateForInput(form.App_startDate)}
                        onChange={(date) =>
                            handleDateChange("App_startDate", date)
                        }
                        dateFormat="dd/MM/yyyy"
                        className="date-picker"
                        placeholderText="Select start date"
                    />
                </div>
                <div>
                    <label>End Date: </label>
                    <DatePicker
                        selected={parseDateForInput(form.App_endDate)}
                        onChange={(date) =>
                            handleDateChange("App_endDate", date)
                        }
                        dateFormat="dd/MM/yyyy"
                        className="date-picker"
                        placeholderText="Select end date"
                    />
                </div>
                <div>
                    <label>Permit Create:</label>
                    <Select
                        name="App_permit_Create"
                        value={allGroups.find(
                            (group) => group.value === form.App_permit_Create
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(
                                "App_permit_Create",
                                selectedOption
                            )
                        }
                        options={allGroups}
                        isClearable
                    />
                </div>
                <div>
                    <label>Permit Open:</label>
                    <Select
                        name="App_permit_Open"
                        value={allGroups.find(
                            (group) => group.value === form.App_permit_Open
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(
                                "App_permit_Open",
                                selectedOption
                            )
                        }
                        options={allGroups}
                        isClearable
                    />
                </div>
                <div>
                    <label>Permit ToDo:</label>
                    <Select
                        name="App_permit_toDoList"
                        value={allGroups.find(
                            (group) => group.value === form.App_permit_toDoList
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(
                                "App_permit_toDoList",
                                selectedOption
                            )
                        }
                        options={allGroups}
                        isClearable
                    />
                </div>
                <div>
                    <label>Permit Doing:</label>
                    <Select
                        name="App_permit_Doing"
                        value={allGroups.find(
                            (group) => group.value === form.App_permit_Doing
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(
                                "App_permit_Doing",
                                selectedOption
                            )
                        }
                        options={allGroups}
                        isClearable
                    />
                </div>
                <div>
                    <label>Permit Done:</label>
                    <Select
                        name="App_permit_Done"
                        value={allGroups.find(
                            (group) => group.value === form.App_permit_Done
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(
                                "App_permit_Done",
                                selectedOption
                            )
                        }
                        options={allGroups}
                        isClearable
                    />
                </div>
                <button type="submit">Create App</button>
            </form>
        </Modal>
    );
};

export default CreateAppModal;
