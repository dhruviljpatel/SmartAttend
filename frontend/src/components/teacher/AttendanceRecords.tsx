import { useState } from "react";

export function AttendanceRecords() {
    const [attendance] = useState<{ name: string; date: string; subject: string }[]>([]);
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold m-0 text-gray-900">Attendance Records</h2>
            </div>

            <div className="mt-4">
                <div className="grid grid-cols-4 gap-4 mb-4 bg-gray-100 p-3 rounded-lg font-semibold">
                    <span className="">Student Name</span>
                    <span className="">Date</span>
                    <span className="">Subject</span>
                </div>
                {attendance.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No attendance records found.</p>
                ) : (
                    <div className="space-y-2">
                        {attendance.map((record, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <span>{record.name}</span>
                                <span>{record.date}</span>
                                <span>{record.subject}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}