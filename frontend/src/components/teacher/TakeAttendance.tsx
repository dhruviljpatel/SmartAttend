import { useState } from 'react';

export function TakeAttendance() {
    const [subjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold m-0 text-gray-900">Take AI Attendance</h2>
                <button className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors cursor-pointer border-none" type="button">
                    Add Photos
                </button>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="subject-select" className="text-sm font-medium text-gray-700">Select Subject</label>
                <select
                    id="subject-select"
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
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

            <div className="flex flex-wrap gap-4 mt-4">
                <button className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors cursor-pointer border-none shadow-sm" type="button">Clear Photos</button>
                <button className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors cursor-pointer border-none shadow-sm" type="button">Run Face Analysis</button>
                <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer border-none shadow-sm" type="button">Use Voice Attendance</button>
            </div>
        </div>
    );
}
