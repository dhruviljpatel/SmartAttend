import { useState } from 'react';
import { TakeAttendance } from './TakeAttendance';
import { ManageSubjects } from './ManageSubjects';
import { AttendanceRecords } from './AttendanceRecords';

export function TeacherTabs({ name }: { name: string }) {
    const [activeTab, setActiveTab] = useState('take_attendance');

    const baseTabStyle = "px-6 py-3 font-medium text-sm transition-colors cursor-pointer border-b-2 bg-transparent";
    const activeStyle = "border-black text-black";
    const inactiveStyle = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent";

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h2 className='text-3xl font-bold mb-8 text-black'>Welcome, {name}</h2>

            <div className='flex border-b border-gray-200 mb-8'>
                <button
                    className={`${baseTabStyle} ${activeTab === 'take_attendance' ? activeStyle : inactiveStyle}`}
                    onClick={() => setActiveTab('take_attendance')}
                >
                    Take Attendance
                </button>
                <button
                    className={`${baseTabStyle} ${activeTab === 'manage_subjects' ? activeStyle : inactiveStyle}`}
                    onClick={() => setActiveTab('manage_subjects')}
                >
                    Manage Subjects
                </button>
                <button
                    className={`${baseTabStyle} ${activeTab === 'attendance_records' ? activeStyle : inactiveStyle}`}
                    onClick={() => setActiveTab('attendance_records')}
                >
                    Attendance Records
                </button>
            </div>

            <div className='bg-white p-6 border border-gray-200 rounded-xl shadow-sm'>
                {activeTab === 'take_attendance' && <TakeAttendance />}
                {activeTab === 'manage_subjects' && <ManageSubjects />}
                {activeTab === 'attendance_records' && <AttendanceRecords />}
            </div>
        </div>
    )
}