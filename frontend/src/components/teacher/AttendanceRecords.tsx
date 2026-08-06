import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AttendanceRecords() {
    // Add some dummy data so it looks nice visually when empty wasn't intended
    const [attendance] = useState<{ name: string; date: string; subject: string; status: string }[]>([
        { name: "Alice Johnson", date: "2023-10-24", subject: "Machine Learning", status: "Present" },
        { name: "Bob Smith", date: "2023-10-24", subject: "Machine Learning", status: "Absent" },
        { name: "Charlie Brown", date: "2023-10-24", subject: "Machine Learning", status: "Present" },
    ]);

    return (
        <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Attendance Records</h2>
            </div>

            <div className="mt-2 rounded-md border">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-700">Student Name</TableHead>
                            <TableHead className="font-semibold text-gray-700">Date</TableHead>
                            <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendance.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    No attendance records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            attendance.map((record, index) => (
                                <TableRow key={index} className="hover:bg-gray-50/50">
                                    <TableCell className="font-medium">{record.name}</TableCell>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.subject}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={record.status === "Present" ? "default" : "destructive"} 
                                               className={record.status === "Present" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}