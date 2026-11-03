import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { RotateCw, CheckCircle2, XCircle, Users, Loader2 } from "lucide-react";

interface AttendanceRecordItem {
    id: number;
    name: string;
    studentId?: number;
    date: string;
    time: string;
    subject: string;
    subjectCode?: string;
    section?: string;
    status: string;
    isPresent: boolean;
}

export function AttendanceRecords() {
    const [records, setRecords] = useState<AttendanceRecordItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all');

    const fetchRecords = () => {
        setIsLoading(true);
        api.get('/attendance')
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    setRecords(res.data);
                }
            })
            .catch((err) => {
                console.warn('Could not load attendance records:', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const filteredRecords = records.filter((r) => {
        if (filterStatus === 'present') return r.isPresent;
        if (filterStatus === 'absent') return !r.isPresent;
        return true;
    });

    const totalPresent = records.filter((r) => r.isPresent).length;
    const totalAbsent = records.filter((r) => !r.isPresent).length;

    return (
        <div className="flex flex-col gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Attendance Records
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Historical attendance logs recorded from classroom face scans
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Filter buttons */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                filterStatus === 'all'
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            All ({records.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus('present')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                filterStatus === 'present'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-gray-500 hover:text-emerald-700'
                            }`}
                        >
                            Present ({totalPresent})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus('absent')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${
                                filterStatus === 'absent'
                                    ? 'bg-white text-red-600 shadow-xs'
                                    : 'text-gray-500 hover:text-red-600'
                            }`}
                        >
                            Absent ({totalAbsent})
                        </button>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchRecords}
                        disabled={isLoading}
                        className="h-9 w-9 rounded-xl border-gray-200 text-gray-600 hover:text-indigo-600"
                        title="Refresh attendance records"
                    >
                        <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200/80 overflow-hidden shadow-xs">
                <Table className="min-w-[650px]">
                    <TableHeader className="bg-slate-50/70 border-b border-gray-200">
                        <TableRow>
                            <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider">Student Name</TableHead>
                            <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider">Subject & Section</TableHead>
                            <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider">Date & Time</TableHead>
                            <TableHead className="font-bold text-gray-700 text-xs uppercase tracking-wider text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                        <span className="text-xs font-medium">Loading database records...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-gray-400">
                                    <p className="text-sm font-medium">No attendance records found.</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Take attendance in the "Take Attendance" tab to generate live entries.
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRecords.map((record) => (
                                <TableRow key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-semibold text-gray-900 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    record.isPresent
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-600'
                                                }`}
                                            >
                                                {record.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span>{record.name}</span>
                                            {record.studentId && (
                                                <span className="text-[10px] text-gray-400 font-mono">#{record.studentId}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <span className="font-medium text-gray-800">{record.subject}</span>
                                            {record.subjectCode && (
                                                <span className="ml-1.5 text-xs text-gray-500 font-mono">
                                                    ({record.subjectCode} - Sec {record.section || 'A'})
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {record.date} {record.time && `• ${record.time}`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            className={`rounded-xl px-2.5 py-0.5 text-xs font-semibold border-0 ${
                                                record.isPresent
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-100'
                                            }`}
                                        >
                                            {record.isPresent ? (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    Present
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <XCircle className="w-3 h-3 text-red-500" />
                                                    Absent
                                                </span>
                                            )}
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
