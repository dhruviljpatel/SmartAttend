import { useState } from "react";
import { SubjectCard } from "./SubjectCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const DUMMY_SUBJECTS = [
    { id: 1, name: "Advanced Web Development", code: "CS-401", section: "A", students: 45, classes: 12 },
    { id: 2, name: "Database Management Systems", code: "CS-302", section: "B", students: 60, classes: 24 },
    { id: 3, name: "Machine Learning", code: "CS-501", section: "A", students: 35, classes: 15 },
    { id: 4, name: "Data Structures", code: "CS-201", section: "C", students: 50, classes: 20 },
    { id: 5, name: "Operating Systems", code: "CS-301", section: "A", students: 48, classes: 18 },
    { id: 6, name: "Computer Networks", code: "CS-402", section: "B", students: 55, classes: 22 },
    { id: 7, name: "Software Engineering", code: "CS-305", section: "A", students: 40, classes: 14 },
    { id: 8, name: "Artificial Intelligence", code: "CS-502", section: "C", students: 30, classes: 10 },
];

export function ManageSubjects() {
    const [subjects] = useState(DUMMY_SUBJECTS);

    return (
        <div className="flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Manage Subjects</h2>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Subject
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                    <SubjectCard 
                        key={subject.id}
                        name={subject.name}
                        code={subject.code}
                        section={subject.section}
                        students={subject.students}
                        classes={subject.classes}
                    />
                ))}
            </div>
        </div>
    );
}
