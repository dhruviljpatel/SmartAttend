import { useState } from 'react';
import './TakeAttendance.css';

export function TakeAttendance() {
    // Empty array for subjects to show "no options available" for now
    const [subjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    return (
        <div className="take-attendance-container">
            <div className="ta-header-container">
                <h2 className="ta-heading">Take AI Attendance</h2>
                <button className="ta-btn-primary ta-add-photos-btn" type="button">
                    Add Photos
                </button>
            </div>

            <div className="ta-form-group">
                <label htmlFor="subject-select" className="ta-input-label">Select Subject</label>
                <select
                    id="subject-select"
                    className="ta-subject-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                >
                    {subjects.length === 0 ? (
                        <option value="" disabled>No options available</option>
                    ) : (
                        subjects.map((sub, index) => (
                            <option key={index} value={sub}>{sub}</option>
                        ))
                    )}
                </select>
            </div>

            <div className="ta-action-buttons-group">
                <button className="ta-btn-primary ta-btn-red" type="button">Clear Photos</button>
                <button className="ta-btn-primary" type="button">Run Face Analysis</button>
                <button className="ta-btn-primary ta-btn-purple" type="button">Use Voice Attendance</button>
            </div>
        </div>
    );
}
