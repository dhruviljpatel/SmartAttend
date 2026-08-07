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
                <TabsList variant="line" className="w-full justify-start border-b border-border bg-transparent h-12 p-0 rounded-none mb-8 overflow-x-auto overflow-y-hidden flex-nowrap hide-scrollbar">
                    <TabsTrigger value="take_attendance" className="h-full px-4 sm:px-6 text-sm sm:text-base data-active:shadow-none whitespace-nowrap">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        <span>Attendance</span>
                    </TabsTrigger>
                    <TabsTrigger value="manage_subjects" className="h-full px-4 sm:px-6 text-sm sm:text-base data-active:shadow-none whitespace-nowrap">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>Subjects</span>
                    </TabsTrigger>
                    <TabsTrigger value="attendance_records" className="h-full px-4 sm:px-6 text-sm sm:text-base data-active:shadow-none whitespace-nowrap">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Records</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="take_attendance" className="mt-2 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
                    <TakeAttendance />
                </TabsContent>
                
                <TabsContent value="manage_subjects" className="mt-2 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
                    <ManageSubjects />
                </TabsContent>
                
                <TabsContent value="attendance_records" className="mt-2 outline-none animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
                    <AttendanceRecords />
                </TabsContent>
            </Tabs>
        </div>
    )
}