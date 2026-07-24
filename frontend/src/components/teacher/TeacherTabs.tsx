import { useState } from 'react';
import { TakeAttendance } from './TakeAttendance';

import './TeacherTabs.css'

export function TeacherTabs({ name }: { name: string }) {
    const [activeTab, setActiveTab] = useState('take_attendance');

    return (
        <div className="teacher-tabs-container">
            <h2 className='welcome-message'>Welcome, {name}</h2>

            <div className='tabs'>
                <button
                    className={
                        activeTab === 'take_attendance'
                            ? 'tab-active'
                            : 'tab'
                    }
                    onClick={
                        () => setActiveTab('take_attendance')
                    }
                >
                    Take Attendance
                </button>
                <button
                    className={
                        activeTab === 'manage_subjects'
                            ? 'tab-active'
                            : 'tab'
                    }
                    onClick={
                        () => setActiveTab('manage_subjects')
                    }
                >
                    Manage Subjects
                </button>
                <button
                    className={
                        activeTab === 'attendance_records'
                            ? 'tab-active'
                            : 'tab'
                    }
                    onClick={
                        () => setActiveTab('attendance_records')
                    }
                >
                    Attendance Records
                </button>
            </div>

            <div className='tab-content'>
                {activeTab === 'take_attendance' && (
                    <TakeAttendance />
                )}
                {activeTab === 'manage_subjects' && (
                    <div>
                        <h3>Manage Subjects</h3>
                    </div>
                )}
                {activeTab === 'attendance_records' && (
                    <div>
                        <h3>Attendance Records</h3>
                    </div>
                )}
            </div>
        </div>
    )
}