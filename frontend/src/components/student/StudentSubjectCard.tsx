import { Users, BookOpen, CheckCircle2, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StudentSubjectCardProps {
    id: number;
    name: string;
    code: string;
    section: string;
    teacherName?: string;
    students: number;
    classes: number;
    presentClasses: number;
    attendanceRate: number;
    onUnenroll: (id: number, name: string) => void;
}

export function StudentSubjectCard({
    id,
    name,
    code,
    section,
    teacherName,
    students,
    classes,
    presentClasses,
    attendanceRate,
    onUnenroll,
}: StudentSubjectCardProps) {
    const isGoodAttendance = attendanceRate >= 75;

    return (
        <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-gray-200 bg-white flex flex-col h-full rounded-2xl overflow-hidden group">
            <CardHeader className="pb-3 bg-gradient-to-br from-slate-50/80 via-white to-white border-b border-gray-100">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-1 text-gray-900">
                        {name}
                    </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="font-mono text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold px-2 py-0.5">
                        {code}
                    </Badge>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500 font-medium">
                        Section: <span className="font-semibold text-gray-700">{section}</span>
                    </span>
                    {teacherName && (
                        <>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs text-gray-500 truncate max-w-[140px]">
                                Inst: <span className="font-medium text-gray-700">{teacherName}</span>
                            </span>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-5 space-y-4">
                {/* 3 STATS PILLS MATCHING TEACHER CARD DETAILS */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/80 flex flex-col items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="font-bold text-gray-900">{students}</span>
                        <span className="text-[10px] text-gray-500">Students</span>
                    </div>

                    <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100/80 flex flex-col items-center justify-center">
                        <BookOpen className="w-4 h-4 text-purple-600 mb-1" />
                        <span className="font-bold text-gray-900">{classes}</span>
                        <span className="text-[10px] text-gray-500">Classes</span>
                    </div>

                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/80 flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
                        <span className="font-bold text-emerald-700">{presentClasses}</span>
                        <span className="text-[10px] text-gray-500">Attended</span>
                    </div>
                </div>

                {/* PERSONAL ATTENDANCE PROGRESS */}
                <div className="pt-2">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-medium text-gray-600">Your Attendance</span>
                        <span className={`font-bold ${isGoodAttendance ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {attendanceRate}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                isGoodAttendance ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, attendanceRate))}%` }}
                        />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t border-gray-100 bg-gray-50/40">
                <Button
                    variant="outline"
                    onClick={() => onUnenroll(id, name)}
                    className="w-full h-10 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors"
                >
                    <UserX className="w-3.5 h-3.5 mr-2" />
                    Unenroll from Subject
                </Button>
            </CardFooter>
        </Card>
    );
}

