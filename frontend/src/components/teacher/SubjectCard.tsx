import { Users, BookOpen } from "lucide-react";

interface SubjectCardProps {
    name: string;
    code: string;
    section: string;
    students: number;
    classes: number;
}

export function SubjectCard({ name, code, section, students, classes }: SubjectCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-black hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            {/* Custom font weight via arbitrary values as requested */}
            <h4 className="text-[1.25rem] font-[600] text-gray-900 mb-3">{name}</h4>
            
            <div className="flex items-center text-gray-500 text-[14px] mb-5 mt-1">
                <span className="mr-2">Code:</span>
                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-mono text-[16px] font-[600] tracking-wide border border-indigo-200 shadow-sm">
                    {code}
                </span>
                <span className="mx-3 text-gray-200">|</span> 
                <span>Section: <span className="font-[600] text-gray-800">{section}</span></span>
            </div>

            <div className="flex items-center gap-4 text-sm pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-100/50">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-[500] text-gray-800">{students} <span className="text-gray-500 font-normal">Students</span></span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50/80 px-3 py-1.5 rounded-lg border border-purple-100/50">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span className="font-[500] text-gray-800">{classes} <span className="text-gray-500 font-normal">Classes</span></span>
                </div>
            </div>
        </div>
    );
}
