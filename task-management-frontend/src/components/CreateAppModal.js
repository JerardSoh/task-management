import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import Select from "react-select";
import { createApp, getAllGroups } from "../apiService";
import { format, parseISO } from "date-fns";

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

    const [form, setForm] = useState(initialFormState);
    const [allGroups, setAllGroups] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groups = await getAllGroups();
                setAllGroups(
                    groups.map((group) => ({ value: group, label: group }))
                );
            } catch (error) {
                setMessage({ type: "error", text: error.message });
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

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedForm = {
            ...form,
            App_startDate: format(parseISO(form.App_startDate), "yyyy-MM-dd"),
            App_endDate: format(parseISO(form.App_endDate), "yyyy-MM-dd"),
        };

        try {
            await createApp(formattedForm);
            setMessage({ type: "success", text: "App created successfully" });
            setForm(initialFormState); // Reset form values
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        }
    };

    const formatDateForInput = (date) => {
        if (!date) return "";
        return format(parseISO(date), "yyyy-MM-dd");
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Create App Modal"
        >
            <h2>Create New App</h2>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit}>
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
                    <label>Start Date:</label>
                    <input
                        type="date"
                        name="App_startDate"
                        value={formatDateForInput(form.App_startDate)}
                        onChange={handleDateChange}
                        required
                    />
                </div>
                <div>
                    <label>End Date:</label>
                    <input
                        type="date"
                        name="App_endDate"
                        value={formatDateForInput(form.App_endDate)}
                        onChange={handleDateChange}
                        required
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
                    />
                </div>
                <div>
                    <label>Permit ToDo List:</label>
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
                    />
                </div>
                <button type="submit">Create App</button>
            </form>
            <button onClick={onRequestClose}>Close</button>
        </Modal>
    );
};

export default CreateAppModal;
