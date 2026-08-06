import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TakeAttendance } from './TakeAttendance';
import { ManageSubjects } from './ManageSubjects';
import { AttendanceRecords } from './AttendanceRecords';
import { Users, BookOpen, ClipboardList } from 'lucide-react';

export function TeacherTabs({ name }: { name: string }) {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <h2 className='text-3xl font-bold mb-8 text-gray-900 tracking-tight'>Welcome, {name}</h2>

            <Tabs defaultValue="take_attendance" className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8 bg-gray-100/50 p-1 rounded-xl shadow-inner border border-gray-200/50">
                    <TabsTrigger value="take_attendance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all data-[state=active]:text-indigo-600">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Attendance</span>
                    </TabsTrigger>
                    <TabsTrigger value="manage_subjects" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all data-[state=active]:text-indigo-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Subjects</span>
                    </TabsTrigger>
                    <TabsTrigger value="attendance_records" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all data-[state=active]:text-indigo-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Records</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="take_attendance" className="mt-0 outline-none">
                    <TakeAttendance />
                </TabsContent>
                
                <TabsContent value="manage_subjects" className="mt-0 outline-none">
                    <ManageSubjects />
                </TabsContent>
                
                <TabsContent value="attendance_records" className="mt-0 outline-none">
                    <AttendanceRecords />
                </TabsContent>
            </Tabs>
        </div>
    )
}