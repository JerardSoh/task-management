// ReadOnlyTask.js
import React from "react";
import Modal from "react-modal";
import Select from "react-select";
import "../styles/OpenTaskModal.css"; // Use the same CSS as OpenTaskModal

Modal.setAppElement("#root");

const ReadOnlyTask = ({ isOpen, onRequestClose, task, appAcronym, state }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={`${state} Task Modal`}
            className="open-task-modal-content"
            overlayClassName="open-task-modal-overlay"
        >
            <div className="open-task-modal-header">
                <h2>{`${state} Task`}</h2>
                <button
                    onClick={onRequestClose}
                    className="open-task-modal-close-button"
                >
                    ×
                </button>
            </div>
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
                                value: task.Task_plan,
                                label: task.Task_plan,
                            }}
                            isDisabled
                            options={[]}
                        />
                    </div>
                </div>
                <div className="open-task-modal-right-section">
                    <div className="open-task-modal-notes">
                        {task.Task_notes.split("\n").map((note, index) => (
                            <p key={index}>{note}</p>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ReadOnlyTask;
