import './ManageSubjects.css';

export function ManageSubjects() {
    return (
        <div className="manage-subjects-container">
            <div className="ms-header-container">
                <h2 className="ms-heading">Manage Subjects</h2>
                <button className="ms-btn-primary ms-create-subject-btn" type="button">
                    Create New Subject
                </button>
            </div>
        </div>
    );
}
