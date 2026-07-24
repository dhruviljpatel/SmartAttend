import { useState } from 'react';
import './TakeAttendance.css';

export function TakeAttendance() {
    // Empty array for subjects to show "no options available" for now
    const [subjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    return (
        <div className="take-attendance-container">
            <h2 className="attendance-heading">Take AI Attendance</h2>

            <div className="form-group">
                <label htmlFor="subject-select" className="input-label">Select Subject</label>
                <select
                    id="subject-select"
                    className="subject-select"
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

            <div className="action-section">
                <button className="btn-primary add-photos-btn" type="button">
                    Add Photos
                </button>
            </div>

            <div className="action-buttons-group">
                <button className="btn-primary btn-red" type="button">Clear Photos</button>
                <button className="btn-primary" type="button">Run Face Analysis</button>
                <button className="btn-primary btn-purple" type="button">Use Voice Attendance</button>
            </div>
        </div>
    );
}
